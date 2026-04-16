import type { Request, Response, NextFunction } from "express";
import AppointmentsService from "./service.js";
import type { UserInfo } from "@custom_types/userinfo";
import { CreateAppointmentResult } from "@custom_types/createappointmentresult";
import { UpdateAppointmentResult } from "@custom_types/updateappointmentresult";
import { CancelAppointmentResult } from "@custom_types/cancelappointmentresult";
import type { AppointmentsCreateRequestDto } from "@contracts/appointments/create.js";
import type { AppointmentsCompleteRequestDto } from "@contracts/appointments/complete.js";
import type { AppointmentsCancelRequestDto } from "@contracts/appointments/cancel.js";
import { PatientInfoNotFoundError } from "@errors/patientinfonotfound";
import { DoctorInfoNotFoundError } from "@errors/doctorinfonotfound";
import { AppointmentInfoNotFoundError } from "@errors/appointmentinfonotfound";
import { CreateAppointmentError } from "@errors/createappointment";
import { UpdateAppointmentError } from "@errors/updateappointment";
import { CancelAppointmentError } from "@errors/cancelappointment";

export default class AppointmentsController {
    constructor(private service: AppointmentsService) {}

    async get(req: Request, res: Response, next: NextFunction) {
        try {
            const userInfo: UserInfo = req.user!;
            if (userInfo.user_role === "A") {
                const appointments = await this.service.getAllAppointments();
                res.status(200).json(appointments);
            } else if (userInfo.user_role === "D") {
                const appointments = await this.service.getAppointmentsByDoctorId(req.get("Authorization")!, userInfo.user_id);
                res.status(200).json(appointments);
            } else {
                const appointments = await this.service.getAppointmentsByPatientId(req.get("Authorization")!, userInfo.user_id);
                res.status(200).json(appointments);
            }
        } catch (err) {
            next(err);
        }
    }

    async create(req: Request, res: Response, next: NextFunction) {
        try {
            const userInfo: UserInfo = req.user!;
            const appointmentData = req.body as AppointmentsCreateRequestDto;
            
            const createAppointmentResult = await this.service.createAppointment(
                req.get("Authorization")!, 
                userInfo.user_id, 
                appointmentData
            );
            if (createAppointmentResult.result === CreateAppointmentResult.UserNotFound) return next(new PatientInfoNotFoundError());
            if (createAppointmentResult.result === CreateAppointmentResult.Error) return next(new CreateAppointmentError());
            
            res.status(200).json(createAppointmentResult.data);
        } catch (err) {
            next(err);
        }
    }

    async cancel(req: Request, res: Response, next: NextFunction) {
        try {
            const userInfo: UserInfo = req.user!;
            const appointmentData = req.body as AppointmentsCancelRequestDto;
            let cancelResult: CancelAppointmentResult;

            if (userInfo.user_role === "A") {
                cancelResult = await this.service.cancelAppointment(appointmentData.appointment_id);
                if (cancelResult === CancelAppointmentResult.AppointmentNotFound) return next(new AppointmentInfoNotFoundError());
            } else if (userInfo.user_role === "D") {
                cancelResult = await this.service.cancelAppointmentAsDoctor(
                    req.get("Authorization")!, 
                    appointmentData.appointment_id, 
                    userInfo.user_id
                );
                if (cancelResult === CancelAppointmentResult.UserNotFound) return next(new DoctorInfoNotFoundError());
            } else {
                cancelResult = await this.service.cancelAppointmentAsPatient(
                    req.get("Authorization")!, 
                    appointmentData.appointment_id, 
                    userInfo.user_id
                );
                if (cancelResult === CancelAppointmentResult.UserNotFound) return next(new PatientInfoNotFoundError());
            }

            if (cancelResult === CancelAppointmentResult.Error) return next(new CancelAppointmentError());
            if (cancelResult === CancelAppointmentResult.AppointmentNotFound) return next(new AppointmentInfoNotFoundError());

            res.status(200).send(true);
        } catch (err) {
            next(err);
        }
    }

    async complete(req: Request, res: Response, next: NextFunction) {
        try {
            const userInfo: UserInfo = req.user!;
            const notesData = req.body as AppointmentsCompleteRequestDto;

            const updateNotesResult = await this.service.completeAppointment(
                req.get("Authorization")!, 
                userInfo.user_id, 
                notesData.appointment_id, 
                notesData.doctor_notes
            );
            if (updateNotesResult.result === UpdateAppointmentResult.Error) return next(new UpdateAppointmentError());
            if (updateNotesResult.result === UpdateAppointmentResult.AppointmentNotFound) return next(new AppointmentInfoNotFoundError());
            if (updateNotesResult.result === UpdateAppointmentResult.UserNotFound) return next(new DoctorInfoNotFoundError());

            res.status(200).json(updateNotesResult.data);
        } catch (err) {
            next(err);
        }
    }
}
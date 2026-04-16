import type { Request, Response, NextFunction } from "express";
import UsersService from "./service.js";
import type { VolatilePatientInfo } from "@custom_types/volatilepatientinfo";
import type { UsersPatientsInfoRequestDto } from "@contracts/users/patients/info.js";
import type { UsersPatientsUpdateRequestDto } from "@contracts/users/patients/update.js";
import type { UsersDoctorsInfoRequestDto } from "@contracts/users/doctors/info.js";
import { PatientInfoNotFoundError } from "@errors/patientinfonotfound";
import { DoctorInfoNotFoundError } from "@errors/doctorinfonotfound";
import { UpdatePatientError } from "@errors/updatepatient";

export default class UsersController {
    constructor(private service: UsersService) {}

    async patientsGet(req: Request, res: Response, next: NextFunction) {
        try {
            const patients = await this.service.getAllPatients();
            res.status(200).json(patients);
        } catch (err) {
            next(err);
        }
    }

    async doctorsGet(req: Request, res: Response, next: NextFunction) {
        try {
            const doctors = await this.service.getAllDoctors();
            res.status(200).json(doctors);
        } catch (err) {
            next(err);
        }
    }

    async patientsInfo(req: Request, res: Response, next: NextFunction) {
        try {
            const params = req.parsedQuery as UsersPatientsInfoRequestDto;
            const patientInfo = await this.service.getPatientInfo(params.id);
            if (!patientInfo) return next(new PatientInfoNotFoundError());
            res.status(200).json(patientInfo);
        } catch (err) {
            next(err);
        }
    }

    async doctorsInfo(req: Request, res: Response, next: NextFunction) {
        try {
            const params = req.parsedQuery as UsersDoctorsInfoRequestDto;
            const doctorInfo = await this.service.getDoctorInfo(params.id);
            if (!doctorInfo) return next(new DoctorInfoNotFoundError());
            res.status(200).json(doctorInfo);
        } catch (err) {
            next(err);
        }
    }

    async patientsUpdate(req: Request, res: Response, next: NextFunction) {
        try {
            const patientData = req.body as UsersPatientsUpdateRequestDto;
            const patientInfo = patientData as VolatilePatientInfo;
            const updatedPatientInfo = await this.service.updatePatientInfo(req.user!.user_id, patientInfo);
            if (!updatedPatientInfo) return next(new UpdatePatientError());
            res.status(200).json(updatedPatientInfo);
        } catch (err) {
            next(err);
        }
    }
}
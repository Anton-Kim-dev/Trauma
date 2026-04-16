import AppointmentsRepository from "./repository.js";
import { HTTPClient } from "@modules/client";
import { CreateAppointmentResult } from "@custom_types/createappointmentresult";
import { UpdateAppointmentResult } from "@custom_types/updateappointmentresult";
import { CancelAppointmentResult } from "@custom_types/cancelappointmentresult";
import type { AppointmentInfo } from "@shared/types/data/appointmentinfo.js";

async function getGroupIdForUser(scope: string, userId: string, authHeader: string, usersClient: HTTPClient): Promise<string | null> {
    const userInfoResponse: { id: string } | null = await usersClient.get(
        `/${scope}/info?id=${userId}`, {
            headers: {
                'Authorization': authHeader
            }
        }
    );
    if (!userInfoResponse) return null;
    return userInfoResponse.id;
}

export default class AppointmentsService {
    constructor(private repo: AppointmentsRepository, private usersClient: HTTPClient) {}

    async getAllAppointments(): Promise<AppointmentInfo[]> {
        return this.repo.getAllAppointments();
    }

    async getAppointmentsByPatientId(authHeader: string, patientUserId: string): Promise<AppointmentInfo[]> {
        const patientId = await getGroupIdForUser("patients", patientUserId, authHeader, this.usersClient);
        if (!patientId) return [];

        return this.repo.getAppointmentsByPatientId(patientId);
    }

    async getAppointmentsByDoctorId(authHeader: string, doctorUserId: string): Promise<AppointmentInfo[]> {
        const doctorId = await getGroupIdForUser("doctors", doctorUserId, authHeader, this.usersClient);
        if (!doctorId) return [];
        
        return this.repo.getAppointmentsByDoctorId(doctorId);
    }

    async createAppointment(authHeader: string, patientUserId: string, appointmentData: {
        doctor_id: string;
        start_time: Date;
        patient_notes: string | null;
    }): Promise<{
        result: CreateAppointmentResult;
        data?: AppointmentInfo
    }> {
        const patientId = await getGroupIdForUser("patients", patientUserId, authHeader, this.usersClient);
        if (!patientId) return { result: CreateAppointmentResult.UserNotFound };
        
        const newAppointmentInfo = await this.repo.addAppointment({
            patient_id: patientId,
            doctor_id: appointmentData.doctor_id,
            start_time: appointmentData.start_time,
            patient_notes: appointmentData.patient_notes
        });
        if (!newAppointmentInfo) return { result: CreateAppointmentResult.Error };

        return { result: CreateAppointmentResult.Success, data: newAppointmentInfo };
    }

    async completeAppointment(authHeader: string, doctorUserId: string, appointmentId: string, doctorNotes: string): Promise<{
        result: UpdateAppointmentResult;
        data?: AppointmentInfo
    }> {
        const doctorId = await getGroupIdForUser("doctors", doctorUserId, authHeader, this.usersClient);
        if (!doctorId) return { result: UpdateAppointmentResult.UserNotFound };

        const appointmentInfo = await this.repo.getAppointmentsByDoctorId(doctorId);
        if (!appointmentInfo.find(apt => apt.id === appointmentId)) return { result: UpdateAppointmentResult.AppointmentNotFound };

        const newAppointmentInfo = await this.repo.updateDoctorNotesForAppointment(appointmentId, doctorNotes);
        if (!newAppointmentInfo) return { result: UpdateAppointmentResult.Error };

        const updateStatusSuccess = await this.repo.updateAppointmentStatus(appointmentId, 'Завершен');
        if (!updateStatusSuccess) return { result: UpdateAppointmentResult.Error };
        newAppointmentInfo.progress = 'Завершен';

        return { result: UpdateAppointmentResult.Success, data: newAppointmentInfo };
    }

    async cancelAppointment(appointmentId: string): Promise<CancelAppointmentResult> {
        const success = await this.repo.updateAppointmentStatus(appointmentId, 'Отменен');
        return success ? CancelAppointmentResult.Success : CancelAppointmentResult.AppointmentNotFound;
    }

    async cancelAppointmentAsPatient(authHeader: string, appointmentId: string, patientUserId: string): Promise<CancelAppointmentResult> {
        const patientId = await getGroupIdForUser("patients", patientUserId, authHeader, this.usersClient);
        if (!patientId) return CancelAppointmentResult.UserNotFound;

        const appointmentInfo = await this.repo.getAppointmentsByPatientId(patientId);
        if (!appointmentInfo.find(apt => apt.id === appointmentId)) return CancelAppointmentResult.AppointmentNotFound;

        const success = await this.repo.updateAppointmentStatus(appointmentId, 'Отменен');
        return success ? CancelAppointmentResult.Success : CancelAppointmentResult.Error;
    }

    async cancelAppointmentAsDoctor(authHeader: string, appointmentId: string, doctorUserId: string): Promise<CancelAppointmentResult> {
        const doctorId = await getGroupIdForUser("doctors", doctorUserId, authHeader, this.usersClient);
        if (!doctorId) return CancelAppointmentResult.UserNotFound;

        const appointmentInfo = await this.repo.getAppointmentsByDoctorId(doctorId);
        if (!appointmentInfo.find(apt => apt.id === appointmentId)) return CancelAppointmentResult.AppointmentNotFound;

        const success = await this.repo.updateAppointmentStatus(appointmentId, 'Отменен');
        return success ? CancelAppointmentResult.Success : CancelAppointmentResult.Error;
    }
}
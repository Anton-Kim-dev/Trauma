import { Database } from "@modules/database";
import { DatabaseError } from "pg";
import type { AppointmentInfo } from "@shared/types/data/appointmentinfo.js";

export default class AppointmentsRepository {
    constructor(private db: Database) {}

    async getAllAppointments(): Promise<AppointmentInfo[]> {
        try {
            const appointmentsQueryResult = await this.db.query(
                "SELECT * FROM appointments"
            );
            return appointmentsQueryResult.rows as AppointmentInfo[];
        } catch (err) {
            if (err instanceof Error || err instanceof DatabaseError) {
                console.log(err);
            }
            return [];
        }
    }

    async getAppointmentsByPatientId(patientId: string): Promise<AppointmentInfo[]> {
        try {
            const appointmentsQueryResult = await this.db.query(
                "SELECT * FROM appointments WHERE patient_id = $1",
                [patientId]
            );
            return appointmentsQueryResult.rows as AppointmentInfo[];
        } catch (err) {
            if (err instanceof Error || err instanceof DatabaseError) {
                console.log(err);
            }
            return [];
        }
    }

    async getAppointmentsByDoctorId(doctorId: string): Promise<AppointmentInfo[]> {
        try {
            const appointmentsQueryResult = await this.db.query(
                "SELECT * FROM appointments WHERE doctor_id = $1",
                [doctorId]
            );
            return appointmentsQueryResult.rows as AppointmentInfo[];
        } catch (err) {
            if (err instanceof Error || err instanceof DatabaseError) {
                console.log(err);
            }
            return [];
        }
    }

    async addAppointment(appointmentData: {
        patient_id: string;
        doctor_id: string;
        start_time: Date;
        patient_notes: string | null;
    }) : Promise<AppointmentInfo | null> {
        try {
            const insertAppointmentQueryResult = await this.db.query(
                `WITH inserted_appointment AS (
                    INSERT INTO appointments (patient_id, doctor_id, start_time, patient_notes)
                    VALUES ($1, $2, $3, $4)
                    RETURNING *
                )
                SELECT * FROM inserted_appointment`,
                [
                    appointmentData.patient_id,
                    appointmentData.doctor_id,
                    appointmentData.start_time,
                    appointmentData.patient_notes
                ]
            );
            return insertAppointmentQueryResult.rows[0] as AppointmentInfo;
        } catch (err) {
            if (err instanceof Error || err instanceof DatabaseError) {
                console.log(err);
            }
            return null;
        }
    }

    async updateDoctorNotesForAppointment(appointmentId: string, doctorNotes: string): Promise<AppointmentInfo | null> {
        try {
            const updateDoctorNotesQueryResult = await this.db.query(
                `WITH updated_appointment AS (
                    UPDATE appointments
                    SET doctor_notes = $1, updated_at = NOW()
                    WHERE id = $2
                    RETURNING *
                )
                SELECT * FROM updated_appointment`,
                [doctorNotes, appointmentId]
            );
            return updateDoctorNotesQueryResult.rows[0] as AppointmentInfo;
        } catch (err) {
            if (err instanceof Error || err instanceof DatabaseError) {
                console.log(err);
            }
            return null;
        }
    }

    async updateAppointmentStatus(appointmentId: string, newStatus: string): Promise<boolean> {
        try {
            await this.db.query(
                "UPDATE appointments SET progress = $1 WHERE id = $2",
                [newStatus, appointmentId]
            );
            return true;
        } catch (err) {
            if (err instanceof Error || err instanceof DatabaseError) {
                console.log(err);
            }
            return false;
        }
    }
}
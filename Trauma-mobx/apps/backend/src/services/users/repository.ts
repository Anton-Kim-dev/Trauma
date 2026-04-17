import { Database } from "@modules/database";
import { DatabaseError } from "pg";
import type { PatientInfo } from "@shared/types/data/patientinfo.js";
import type { DoctorInfo } from "@shared/types/data/doctorinfo.js";
import type { VolatilePatientInfo } from "@custom_types/volatilepatientinfo";

export default class UsersRepository {
    constructor(private db: Database) {}

    async getAllPatients(): Promise<PatientInfo[]> {
        try {
            const patientsQueryResult = await this.db.query(
                "SELECT * FROM patients"
            );
            return patientsQueryResult.rows as PatientInfo[];
        } catch (err) {
            if (err instanceof Error || err instanceof DatabaseError) {
                console.log(err);
            }
            return [];
        }
    }

    async getAllDoctors(): Promise<DoctorInfo[]> {
        try {
            const doctorsQueryResult = await this.db.query(
                "SELECT * FROM doctors"
            );
            return doctorsQueryResult.rows as DoctorInfo[];
        } catch (err) {
            if (err instanceof Error || err instanceof DatabaseError) {
                console.log(err);
            }
            return [];
        }
    }

    async getPatientById(patientId: string): Promise<PatientInfo | null> {
        try {
            const patientQueryResult = await this.db.query(
                "SELECT * FROM patients WHERE id = $1 OR user_id = $1",
                [patientId]
            );
            return patientQueryResult.rows[0] as PatientInfo;
        } catch (err) {
            if (err instanceof Error || err instanceof DatabaseError) {
                console.log(err);
            }
            return null;
        }
    }

    async getDoctorById(doctorId: string): Promise<DoctorInfo | null> {
        try {
            const doctorQueryResult = await this.db.query(
                "SELECT * FROM doctors WHERE id = $1 OR user_id = $1",
                [doctorId]
            );
            return doctorQueryResult.rows[0] as DoctorInfo;
        } catch (err) {
            if (err instanceof Error || err instanceof DatabaseError) {
                console.log(err);
            }
            return null;
        }
    }

    async updatePatient(patientId: string, patientData: VolatilePatientInfo): Promise<PatientInfo | null> {
        try {
            const updatePatientQueryResult = await this.db.query(
                `INSERT INTO patients (user_id, email, phone, first_name, last_name, patronymic, birth_date, gender)
                VALUES ($8, $1, $2, $3, $4, $5, $6, $7)
                ON CONFLICT (user_id) DO UPDATE SET
                    email = EXCLUDED.email,
                    phone = EXCLUDED.phone,
                    first_name = EXCLUDED.first_name,
                    last_name = EXCLUDED.last_name,
                    patronymic = EXCLUDED.patronymic,
                    birth_date = EXCLUDED.birth_date,
                    gender = EXCLUDED.gender,
                    updated_at = NOW()
                RETURNING *`,
                [
                    patientData.email,
                    patientData.phone,
                    patientData.first_name,
                    patientData.last_name,
                    patientData.patronymic,
                    patientData.birth_date,
                    patientData.gender,
                    patientId
                ]
            );
            return updatePatientQueryResult.rows[0] as PatientInfo;
        } catch (err) {
            if (err instanceof Error) {
                console.log(err);
            }
            return null;
        }
    }
}
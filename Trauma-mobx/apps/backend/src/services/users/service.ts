import UsersRepository from "./repository.js";
import type { PatientInfo } from "@shared/types/data/patientinfo.js";
import type { DoctorInfo } from "@shared/types/data/doctorinfo.js";
import type { VolatilePatientInfo } from "@custom_types/volatilepatientinfo";

export default class UsersService {
    constructor(private repo: UsersRepository) {}

    async getAllPatients(): Promise<PatientInfo[]> {
        return this.repo.getAllPatients();
    }

    async getAllDoctors(): Promise<DoctorInfo[]> {
        return this.repo.getAllDoctors();
    }

    async getPatientInfo(patientId: string): Promise<PatientInfo | null> {
        return this.repo.getPatientById(patientId);
    }

    async getDoctorInfo(doctorId: string): Promise<DoctorInfo | null> {
        return this.repo.getDoctorById(doctorId);
    }

    async updatePatientInfo(patientId: string, patientData: VolatilePatientInfo): Promise<PatientInfo | null> {
        return this.repo.updatePatient(patientId, patientData);
    }
}
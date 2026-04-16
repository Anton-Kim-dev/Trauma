export type AppointmentInfo = {
    id: string;
    patient_id: string;
    doctor_id: string;
    progress: string;
    start_time: Date;
    patient_notes: string | null;
    doctor_notes: string | null;
    created_at: Date;
    updated_at: Date;
};
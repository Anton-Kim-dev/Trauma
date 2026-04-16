export type DoctorInfo = {
    id: string;
    user_id: string;
    specialty: string;
    first_name: string;
    last_name: string;
    patronymic: string | null;
    notes: string | null;
    is_active: boolean;
    work_days: number;
    shift_start: string;
    shift_end: string;
    slot_minutes: number;
};

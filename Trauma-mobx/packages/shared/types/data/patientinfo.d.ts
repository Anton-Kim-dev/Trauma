export type PatientInfo = {
    id: string;
    user_id: string;
    email: string;
    phone: string | null;
    first_name: string;
    last_name: string;
    patronymic: string | null;
    birth_date: Date;
    gender: 'M' | 'F';
    created_at: Date;
    updated_at: Date;
}
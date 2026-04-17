export type VolatilePatientInfo = {
    email: string;
    phone: string | null;
    first_name: string;
    last_name: string;
    patronymic: string | null;
    birth_date: Date;
    gender: 'M' | 'F';
};
import { z } from "zod";
import type { PatientInfo } from "@shared/types/data/patientinfo.js";

export const UsersPatientsUpdateRequestSchema = z.object({
    email: z.email({ message: 'Некорректный email' }),
    phone: z.string().nullable(),
    first_name: z.string().min(1, { message: 'Имя обязательно' }),
    last_name: z.string().min(1, { message: 'Фамилия обязательна' }),
    patronymic: z.string().nullable(),
    birth_date: z.coerce.date({ message: 'Некорректная дата рождения' }),
    gender: z.enum(['M', 'F']),
});

export type UsersPatientsUpdateRequestDto = z.infer<typeof UsersPatientsUpdateRequestSchema>;

export type UsersPatientsUpdateResponseDto = PatientInfo;
import { z } from "zod";
import type { AppointmentInfo } from "@shared/types/data/appointmentinfo.js";

export const AppointmentsCreateRequestSchema = z.object({
    doctor_id: z.uuid({ message: 'Некорректный идентификатор врача' }),
    start_time: z.coerce.date({ message: 'Время начала обязательно' }),
    patient_notes: z.string().nullable(),
});

export type AppointmentsCreateRequestDto = z.infer<typeof AppointmentsCreateRequestSchema>;

export type AppointmentsCreateResponseDto = AppointmentInfo;

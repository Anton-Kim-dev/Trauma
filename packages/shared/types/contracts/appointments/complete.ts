import { z } from "zod";
import type { AppointmentInfo } from "@shared/types/data/appointmentinfo.js";

export const AppointmentsCompleteRequestSchema = z.object({
    appointment_id: z.uuid({ message: 'Некорректный идентификатор записи' }),
    doctor_notes: z.string().min(1, { message: 'Заметки врача не могут быть пустыми' }),
});

export type AppointmentsCompleteRequestDto = z.infer<typeof AppointmentsCompleteRequestSchema>;

export type AppointmentsCompleteResponseDto = AppointmentInfo;

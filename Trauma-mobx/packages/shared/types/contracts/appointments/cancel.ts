import { z } from "zod";

export const AppointmentsCancelRequestSchema = z.object({
    appointment_id: z.uuid({ message: 'Некорректный идентификатор записи' }),
});

export type AppointmentsCancelRequestDto = z.infer<typeof AppointmentsCancelRequestSchema>;

export type AppointmentsCancelResponseDto = boolean;

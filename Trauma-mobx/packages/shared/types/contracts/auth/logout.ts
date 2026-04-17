import { z } from "zod";

export const LogoutRequestSchema = z.object({
    token: z.string().length(96),
});

export type LogoutRequestDto = z.infer<typeof LogoutRequestSchema>;

export type LogoutResponseDto = void;
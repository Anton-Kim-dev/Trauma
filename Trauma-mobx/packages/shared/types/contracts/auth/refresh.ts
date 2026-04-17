import { z } from "zod";

export const RefreshRequestSchema = z.object({
    token: z.string().length(96),
});

export type RefreshRequestDto = z.infer<typeof RefreshRequestSchema>;

export type RefreshResponseDto = {
    access_token: string;
};
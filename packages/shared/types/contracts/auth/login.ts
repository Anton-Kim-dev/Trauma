import { z } from "zod";

export const LoginRequestSchema = z.object({
    username: z.string().min(4, { message: 'Имя пользователя должно содержать не менее 4 символов' }),
    password: z.string().min(8, { message: 'Пароль должен содержать не менее 8 символов' }),
});

export type LoginRequestDto = z.infer<typeof LoginRequestSchema>;

export type LoginResponseDto = {
    refresh_token: string;
    access_token: string;
};
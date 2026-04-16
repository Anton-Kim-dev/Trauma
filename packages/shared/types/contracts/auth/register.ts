import { z } from "zod";

export const RegisterRequestSchema = z.object({
    username: z.string().min(4, { message: 'Имя пользователя должно содержать не менее 4 символов' }),
    password: z.string().min(8, { message: 'Пароль должен содержать не менее 8 символов' }),
    role: z.enum(['P', 'D', 'A'], { message: 'Недопустимая роль' }).default('P'),
    first_name: z.string().min(1, { message: 'Имя обязательно' }),
    last_name: z.string().min(1, { message: 'Фамилия обязательна' }),
    patronymic: z.string().nullable().optional(),
    email: z.string().email({ message: 'Некорректный email' }),
    phone: z.string().nullable().optional(),
    birth_date: z.coerce.date({ message: 'Дата рождения обязательна' }),
    gender: z.enum(['M', 'F'], { message: 'Укажите пол' }),
});

export type RegisterRequestDto = z.infer<typeof RegisterRequestSchema>;

export const RegisterResult = {
    Success: 0,
    Duplicate: 1,
    Error: 2,
} as const;
export type RegisterResult = typeof RegisterResult[keyof typeof RegisterResult];

export type RegisterResponseDto = {
    result: RegisterResult;
    user_id: string | null;
};
import { z } from "zod";
import type { DoctorInfo } from "@shared/types/data/doctorinfo.js";

export const UsersDoctorsInfoRequestSchema = z.object({
    id: z.string(),
});

export type UsersDoctorsInfoRequestDto = z.infer<typeof UsersDoctorsInfoRequestSchema>;

export type UsersDoctorsInfoResponseDto = DoctorInfo;
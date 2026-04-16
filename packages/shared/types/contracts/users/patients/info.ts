import { z } from "zod";
import type { PatientInfo } from "@shared/types/data/patientinfo.js";

export const UsersPatientsInfoRequestSchema = z.object({
    id: z.string(),
});

export type UsersPatientsInfoRequestDto = z.infer<typeof UsersPatientsInfoRequestSchema>;

export type UsersPatientsInfoResponseDto = PatientInfo;
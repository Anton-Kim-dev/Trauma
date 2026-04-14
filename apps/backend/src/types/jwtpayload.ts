import type { UserRole } from "./userroles.js";

export type JWTPayload = {
    user_id: string,
    user_name: string,
    user_role: UserRole,
    ver: number,
    exp: number,
    iat: number,
    jti: string
};
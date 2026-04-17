import type { UserRole } from "./userroles";

export type UserInfo = {
    user_id: string,
    user_name: string,
    user_role: UserRole
};
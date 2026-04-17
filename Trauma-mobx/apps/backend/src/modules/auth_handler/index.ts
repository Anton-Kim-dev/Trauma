import { env } from "@config/env";
import * as crypto from "crypto";
import { JWTHandler } from "@modules/jwt";
import type { UserInfo } from "@custom_types/userinfo";
import { JWTCheckResult } from "@custom_types/jwtcheckresult";

const REFRESH_TOKEN_SIZE = 48;

export class AuthHandler {
    static hashToken(token: string): string {
        return crypto.createHmac("sha256", env.JWT_REFRESH_SALT).update(token).digest("hex");
    }

    static generateAccessToken(userData: UserInfo): string {
        return JWTHandler.sign(userData, env.JWT_SECRET);
    }

    static generateRefreshToken(): { token: string, exp: Date } {
        const token = crypto.randomBytes(REFRESH_TOKEN_SIZE).toString("hex");
        return { token, exp: new Date(Date.now() + env.JWT_REFRESH_EXP * 1000) };
    }

    static checkAccessToken(token: string): { result: JWTCheckResult, data?: UserInfo } {
        try {
            const decrypted = JWTHandler.verify(token, env.JWT_SECRET);
            return { result: JWTCheckResult.Valid, data: decrypted };
        } catch (err) {
            if (err instanceof Error && err.message.match("JWTERR1")) {
                return { result: JWTCheckResult.Expired };
            }
            return { result: JWTCheckResult.Invalid };
        }
    }
}
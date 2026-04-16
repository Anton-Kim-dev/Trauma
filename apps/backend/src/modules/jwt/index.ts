import * as crypto from "crypto";
import { env } from "@config/env";
import type { JWTPayload } from "@custom_types/jwtpayload";
import type { UserInfo } from "@custom_types/userinfo";

function bufToB64URL(input: Buffer): string {
    return input.toString("base64url");
}

export class JWTHandler {
    static sign(payload: UserInfo, secret: string): string {
        const now = Math.floor(Date.now() / 1000);
        const header = {alg: "HS256", typ: "JWT"};
        const fullPayload: JWTPayload = {
            user_id: payload.user_id,
            user_name: payload.user_name,
            user_role: payload.user_role,
            ver: env.JWT_VER,
            exp: now + env.JWT_EXP,
            iat: now,
            jti: crypto.randomUUID()
        };

        const encHeader = bufToB64URL(Buffer.from(JSON.stringify(header)));
        const encPayload = bufToB64URL(Buffer.from(JSON.stringify(fullPayload)));
        const data = `${encHeader}.${encPayload}`;
        const signature = crypto.createHmac("sha256", secret).update(data).digest("base64url");
        return `${data}.${signature}`;
    };

    static verify(token: string, secret: string): JWTPayload {
        const [encHeader, encPayload, signature] = token.split(".");
        if (!encHeader || !encPayload || !signature) {
            throw new Error(`[JWTERR2] Invalid token passed. Token: ${token}`);
        }

        const data = `${encHeader}.${encPayload}`;
        const expectedSignature = crypto.createHmac("sha256", secret).update(data).digest("base64url");
        if (expectedSignature !== signature) {
            throw new Error(`[JWTERR2] Invalid signature. Token: ${token}`);
        }

        const payload: JWTPayload = JSON.parse(Buffer.from(encPayload, "base64url").toString("utf8"));

        const ver = env.JWT_VER;
        if (!payload.ver || ver !== payload.ver) {
            throw new Error(`[JWTERR2] Invalid token version. Token: ${token}`);
        }

        const now = Math.floor(Date.now() / 1000);
        if (!payload.exp || now >= payload.exp) {
            throw new Error(`[JWTERR1] Token expired. Token: ${token}`);
        }

        return payload;
    };
}
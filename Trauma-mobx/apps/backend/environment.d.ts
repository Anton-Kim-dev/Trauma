import type { UserInfo } from "./src/types/userinfo.js";

declare global {
    namespace Express {
        interface Request {
            parsedQuery?: Record<string, string>;
            user?: UserInfo;
        }
    }
}

export {};

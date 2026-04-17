import * as crypto from "crypto";

export class PasswordHandler {
    static hash(pass: string): string {
        const salt = crypto.randomBytes(16).toString("hex");
        const hashBuf = crypto.scryptSync(pass, salt, 64);
        return `${hashBuf.toString("hex")}.${salt}`;
    };

    static compare(hashedPass1: string, pass2: string): boolean {
        const [pass1Hash, passSalt] = hashedPass1.split(".");
        if (!(pass1Hash || passSalt)) throw Error("[PWDERR1] Malformed password passed to compare - missing hash or salt");
        const pass2HashBuf = crypto.scryptSync(pass2, passSalt as string, 64);
        const pass1HashBuf = Buffer.from(pass1Hash as string, "hex");
        return crypto.timingSafeEqual(pass1HashBuf, pass2HashBuf);
    };
}
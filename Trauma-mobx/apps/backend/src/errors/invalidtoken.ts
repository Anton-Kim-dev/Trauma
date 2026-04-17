import { BaseError } from "./base.js";

export class InvalidTokenError extends BaseError {
    constructor() {
        super("Token invalid or malformed", 401);
    }
}
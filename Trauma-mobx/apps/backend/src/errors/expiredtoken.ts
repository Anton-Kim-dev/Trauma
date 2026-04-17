import { BaseError } from "./base.js";

export class ExpiredTokenError extends BaseError {
    constructor() {
        super("Token has expired", 401);
    }
}
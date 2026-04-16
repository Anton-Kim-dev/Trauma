import { BaseError } from "./base.js";

export class InvalidCredentialsError extends BaseError {
    constructor() {
        super("Invalid username or password", 401);
    }
}
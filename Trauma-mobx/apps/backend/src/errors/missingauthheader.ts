import { BaseError } from "./base.js";

export class MissingAuthHeaderError extends BaseError {
    constructor() {
        super("Authorization Bearer token is required", 401);
    }
}
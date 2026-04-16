import { BaseError } from "./base.js";

export class UnauthorizedError extends BaseError {
    constructor() {
        super("You are not authorized to access this resource", 403);
    }
}
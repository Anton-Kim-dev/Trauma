import { BaseError } from "./base.js";

export class DoctorInfoNotFoundError extends BaseError {
    constructor() {
        super("Failed to retrieve requested doctor data", 404);
    }
}
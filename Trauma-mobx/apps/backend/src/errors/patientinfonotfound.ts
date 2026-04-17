import { BaseError } from "./base.js";

export class PatientInfoNotFoundError extends BaseError {
    constructor() {
        super("Failed to retrieve requested patient data", 404);
    }
}
import { BaseError } from "./base.js";

export class CreateAppointmentError extends BaseError {
    constructor() {
        super("Failed to create appointment", 500);
    }
}
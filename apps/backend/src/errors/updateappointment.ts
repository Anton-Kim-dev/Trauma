import { BaseError } from "./base.js";

export class UpdateAppointmentError extends BaseError {
    constructor() {
        super("Failed to update appointment", 500);
    }
}
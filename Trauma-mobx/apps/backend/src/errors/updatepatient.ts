import { BaseError } from "./base.js";

export class UpdatePatientError extends BaseError {
    constructor() {
        super("Failed to update patient information", 500);
    }
}
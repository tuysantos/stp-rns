import uuid = require("uuid");

export class UuidGenerator {
    public generateUUID(): string {
        return uuid.v1();
    }
}
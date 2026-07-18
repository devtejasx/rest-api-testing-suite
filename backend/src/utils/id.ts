import { v4 as uuidv4 } from "uuid";

/** Generate a RFC-4122 v4 UUID. Used for request correlation ids. */
export function generateId(): string {
  return uuidv4();
}

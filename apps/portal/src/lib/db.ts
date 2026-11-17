/**
 * Backward-compatibility proxy for database and repository functions.
 * All core database connection, domain models, and repositories are now located under:
 * src/services/api/
 */

export * from "@/services/api/types";
export * from "@/services/api/core";
export * from "@/services/api/repositories";

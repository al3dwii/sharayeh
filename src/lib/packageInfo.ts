// src/lib/packageInfo.ts
//-----------------------------------------------------
// FINAL state after the 10-day sprint
//-----------------------------------------------------

/**
 * Expose the app’s semantic version (pulled from package.json) so
 * other modules—e.g. StructuredDataAr—can embed the current build
 * number inside JSON-LD or logs.
 *
 * `resolveJsonModule` is enabled in tsconfig, so importing JSON is safe.
 */
import pkg from "../../package.json";

export const appVersion: string = pkg.version;

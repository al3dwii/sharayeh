//-----------------------------------------------------
// GCS bucket helper (Day 6)
//-----------------------------------------------------

/**
 * Central place to read the Google Cloud Storage bucket
 * so tests/staging/prod can swap via env-var.
 */
export const GCS_BUCKET =
  process.env.GCS_BUCKET || "tablesb";

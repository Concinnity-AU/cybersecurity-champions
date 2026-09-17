/* Campaign attribution — shared validation + normalisation for /api/start and /api/lead.
 *
 * utm_source / utm_medium / utm_campaign are lower-cased so "Facebook" and
 * "facebook" report as one source. utm_content is kept verbatim because it
 * carries creative identifiers (e.g. from Publer) that may be case-sensitive.
 * referrer is a bare hostname — the client never sends paths or query strings. */

import { z } from 'zod';

const utm = z
  .string()
  .trim()
  .max(120)
  .nullable()
  .optional()
  .transform((v) => (v ? v : null));

export const AttributionSchema = z.object({
  utm_source: utm.transform((v) => v?.toLowerCase() ?? null),
  utm_medium: utm.transform((v) => v?.toLowerCase() ?? null),
  utm_campaign: utm.transform((v) => v?.toLowerCase() ?? null),
  utm_content: utm,
  referrer: z
    .string()
    .trim()
    .toLowerCase()
    .max(253)
    .regex(/^[a-z0-9.-]+$/, 'referrer must be a hostname')
    .nullable()
    .optional()
    .or(z.literal(''))
    .transform((v) => (v ? v : null)),
});

export type Attribution = z.infer<typeof AttributionSchema>;

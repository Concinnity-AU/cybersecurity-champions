/* Participant sharing — the platforms we offer, and how a shared link carries
 * its referral into the next visitor's session.
 *
 * Each share button hands out /r/<session_id>?via=<platform>. The share landing
 * page turns that into the Challenge link:
 *   /?utm_source=<platform>&utm_medium=share&utm_campaign=participant_share&shared_by=<session_id>
 * so the friend's session is attributed as participant-generated sharing, and
 * `sessions.shared_by` points back to the sharer's session (and through it, to
 * the campaign that brought the sharer in). */

export const SHARE_PLATFORMS = ['facebook', 'whatsapp', 'linkedin', 'native', 'copy', 'twitter'] as const;
export type SharePlatform = (typeof SHARE_PLATFORMS)[number];

export const SHARE_MEDIUM = 'share';
export const SHARE_CAMPAIGN = 'participant_share';
/** utm_source for links shared before per-platform `via` existed. */
export const SHARE_SOURCE_UNKNOWN = 'shared_link';

export function parseVia(value: string | null): SharePlatform | null {
  return (SHARE_PLATFORMS as readonly string[]).includes(value ?? '') ? (value as SharePlatform) : null;
}

export function challengeUrlFromShare(primary: string, sessionId: string, via: SharePlatform | null): string {
  const u = new URL(`https://${primary}/`);
  u.searchParams.set('utm_source', via ?? SHARE_SOURCE_UNKNOWN);
  u.searchParams.set('utm_medium', SHARE_MEDIUM);
  u.searchParams.set('utm_campaign', SHARE_CAMPAIGN);
  u.searchParams.set('shared_by', sessionId);
  return u.toString();
}

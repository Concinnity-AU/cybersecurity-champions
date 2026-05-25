/* Verify a Turnstile token against Cloudflare's siteverify endpoint. */

const VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

interface VerifyResponse {
  success: boolean;
  'error-codes'?: string[];
  challenge_ts?: string;
  hostname?: string;
  action?: string;
}

export async function verifyTurnstile(token: string, secret: string): Promise<boolean> {
  if (!token) {
    console.warn('Turnstile: no token in request body');
    return false;
  }
  if (!secret) {
    console.warn('Turnstile: TURNSTILE_SECRET env var is empty');
    return false;
  }
  try {
    const form = new FormData();
    form.append('secret', secret);
    form.append('response', token);
    const res = await fetch(VERIFY_URL, { method: 'POST', body: form });
    if (!res.ok) {
      console.warn('Turnstile: siteverify HTTP', res.status);
      return false;
    }
    const json = (await res.json()) as VerifyResponse;
    if (!json.success) {
      console.warn('Turnstile: siteverify rejected, error-codes =', json['error-codes']);
    }
    return json.success === true;
  } catch (e) {
    console.warn('Turnstile: siteverify threw', e);
    return false;
  }
}

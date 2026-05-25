/* Middleware that wraps every /api/* response with CORS headers.
   Pages Functions chains _middleware files top-down; this one lives in
   functions/api/ so it only runs for API routes (not for /r/ or /og/). */

import { corsHeaders, withCors } from '../_shared/cors';
import type { Env } from '../_shared/types';

export const onRequest: PagesFunction<Env> = async (context) => {
  const origin = context.request.headers.get('Origin') || '';
  const env = context.env;

  // Handle OPTIONS preflight directly without invoking the route.
  if (context.request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders(origin, env.PRIMARY_DOMAIN, env.EMBED_PARENT_DOMAINS),
    });
  }

  const res = await context.next();
  return withCors(res, origin, env.PRIMARY_DOMAIN, env.EMBED_PARENT_DOMAINS);
};

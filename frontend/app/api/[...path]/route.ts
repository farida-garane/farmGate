import { NextRequest, NextResponse } from 'next/server';

// Proxy same-origin vers le backend Django :
// les appels /api/* du navigateur restent sur le domaine du frontend,
// ce qui évite les problèmes de cookies tiers et de CORS en production.
// BACKEND_URL : URL du backend (ex: http://backend:8000 en docker,
// https://farmgate-backend-xxx.onrender.com sur Vercel).
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000';

async function proxy(req: NextRequest) {
  // nextUrl.pathname conserve le slash final (/api/auth/me/ -> auth/me/)
  const apiPath = req.nextUrl.pathname.replace(/^\/api\/?/, '');
  const target = `${BACKEND_URL}/api/${apiPath}${req.nextUrl.search}`;

  const headers = new Headers(req.headers);
  headers.delete('host');
  headers.delete('content-length');

  const hasBody = !['GET', 'HEAD'].includes(req.method);
  const upstream = await fetch(target, {
    method: req.method,
    headers,
    body: hasBody ? await req.arrayBuffer() : undefined,
    redirect: 'manual',
  });

  const res = new NextResponse(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
  });
  upstream.headers.forEach((value, key) => {
    const k = key.toLowerCase();
    if (k === 'set-cookie' || k === 'content-encoding' || k === 'content-length') return;
    res.headers.set(key, value);
  });
  // Préserver tous les cookies (csrftoken, sessionid) posés par Django
  const setCookies =
    typeof upstream.headers.getSetCookie === 'function'
      ? upstream.headers.getSetCookie()
      : [];
  for (const cookie of setCookies) {
    res.headers.append('set-cookie', cookie);
  }
  return res;
}

export {
  proxy as GET,
  proxy as POST,
  proxy as PUT,
  proxy as PATCH,
  proxy as DELETE,
  proxy as OPTIONS,
  proxy as HEAD,
};

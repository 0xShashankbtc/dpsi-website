import type { CookieOptions } from "hono/utils/cookie";

function isLocalhost(headers: Headers): boolean {
  const host = headers.get("host") || "";
  return /^127\.0\.0\.1(:|\b)|localhost(:|\b)/i.test(host);
}

export function getSessionCookieOptions(headers: Headers): CookieOptions {
  const localhost = isLocalhost(headers);

  return {
    httpOnly: true,
    path: "/",
    sameSite: localhost ? "Lax" : "None",
    secure: !localhost,
  };
}
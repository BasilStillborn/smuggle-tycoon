import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { detectLocale, supportedLocales } from "@/lib/i18n";

const CANONICAL_DOMAIN = "localflowhub.com";

export function middleware(request: NextRequest) {
  const { hostname, pathname, search } = request.nextUrl;
  const host = hostname.replace(/^www\./, "");

  // Allow Vercel preview URLs through so you can view the site while DNS resolves
  if (host.endsWith(".vercel.app")) {
    return handleLocale(request);
  }

  // Redirect non-canonical hosts to the live domain
  if (host !== CANONICAL_DOMAIN) {
    return NextResponse.redirect(
      `https://${CANONICAL_DOMAIN}${pathname}${search}`,
      { status: 308 },
    );
  }

  return handleLocale(request);
}

function handleLocale(request: NextRequest) {
  const response = NextResponse.next();

  // Detect and set locale cookie silently (for future i18n use)
  const existing = request.cookies.get("locale")?.value;
  if (existing && (supportedLocales as readonly string[]).includes(existing)) {
    return response;
  }

  const detected = detectLocale(request.headers.get("Accept-Language") || undefined);
  if (detected !== "en") {
    response.cookies.set("locale", detected, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      httpOnly: false,
    });
  }

  return response;
}

export const config = {
  matcher: [
    // Match all routes except static files, images, and API internals
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|logos/).*)",
  ],
};

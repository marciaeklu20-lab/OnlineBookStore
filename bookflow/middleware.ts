import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Admin route protection is handled inside the layout (server component checks is_admin).
// This middleware just ensures /admin paths never get cached by CDN/browser.
export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/admin")) {
    const response = NextResponse.next();
    response.headers.set("Cache-Control", "no-store");
    return response;
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};

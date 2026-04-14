import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher(["/admin(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  const hostname = req.headers.get("host") || "";

  // Redirección canónica de www a sin-www
  if (hostname.startsWith("www.unknown-club.store")) {
    const url = req.nextUrl.clone();
    url.host = "unknown-club.store";
    url.protocol = "https";
    return NextResponse.redirect(url, 301);
  }

  if (isProtectedRoute(req)) {
      await auth.protect();
  }
});


export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}

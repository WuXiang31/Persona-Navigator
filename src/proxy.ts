import { NextResponse } from "next/server";
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Only the welcome screen and the auth pages are open; everything else needs an account.
// The cron endpoint authenticates with CRON_SECRET instead of a session
const isPublicRoute = createRouteMatcher(["/", "/sign-in(.*)", "/sign-up(.*)", "/api/push/cron"]);
const isApiRoute = createRouteMatcher(["/api(.*)"]);

export default clerkMiddleware(
  async (auth, req) => {
    if (isPublicRoute(req)) return;

    // API callers get a 401 instead of being redirected to a sign-in page
    if (isApiRoute(req)) {
      const { userId } = await auth();
      if (!userId) return NextResponse.json({ error: "Sign in required" }, { status: 401 });
      return;
    }

    await auth.protect();
  },
  // Send signed-out visitors to our own sign-in page rather than Clerk's hosted one
  { signInUrl: "/sign-in", signUpUrl: "/sign-up" }
);

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};

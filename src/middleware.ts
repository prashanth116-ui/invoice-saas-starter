import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
  // Public routes that don't require authentication
  publicRoutes: [
    "/",
    "/pricing",
    "/about",
    "/login",
    "/sign-in(.*)",
    "/sign-up(.*)",
    "/api/webhooks(.*)",
    "/invoice/(.*)", // Public invoice view for clients
  ],
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};

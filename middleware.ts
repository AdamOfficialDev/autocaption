import { authMiddleware } from "@clerk/nextjs";
 
export default authMiddleware({
  publicRoutes: ["/"],
  afterAuth(auth, req) {
    // Handle users who aren't authenticated
    if (!auth.userId && !auth.isPublicRoute) {
      return Response.redirect(new URL('/sign-in', req.url));
    }

    // Handle authenticated users trying to access auth pages
    if (auth.userId && req.nextUrl.pathname.startsWith('/sign-in')) {
      return Response.redirect(new URL('/dashboard', req.url));
    }
    if (auth.userId && req.nextUrl.pathname.startsWith('/sign-up')) {
      return Response.redirect(new URL('/dashboard', req.url));
    }
  }
});
 
export const config = {
  matcher: [
    "/((?!.+\\.[\\w]+$|_next).*)", 
    "/", 
    "/(api|trpc)(.*)",
  ],
};
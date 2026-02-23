import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

export const { auth: middleware } = NextAuth(authConfig);

// Public routes that don't require authentication
const publicPaths = ["/", "/login", "/pricing", "/api/auth"];

export default middleware((req) => {
    const isLoggedIn = !!req.auth;
    const path = req.nextUrl.pathname;

    // Check if current path starts with any public path
    // Exactly matching / or starting with /login, /api/auth, etc.
    const isPublic =
        path === "/" ||
        publicPaths.some(p => p !== "/" && path.startsWith(p));

    // If the user is on the login page and ALREADY logged in, send them to dashboard
    if (path.startsWith("/login") && isLoggedIn) {
        return Response.redirect(new URL("/dashboard", req.nextUrl));
    }

    // If the user is NOT logged in and trying to access a PROTECTED route, send them to login
    if (!isLoggedIn && !isPublic) {
        let callbackUrl = path;
        if (req.nextUrl.search) {
            callbackUrl += req.nextUrl.search;
        }
        const encodedCallbackUrl = encodeURIComponent(callbackUrl);
        return Response.redirect(
            new URL(`/login?callbackUrl=${encodedCallbackUrl}`, req.nextUrl)
        );
    }
});

// Optionally, don't invoke Middleware on some paths
export const config = {
    matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico|manifest.json|icons/|images/).*)"],
};

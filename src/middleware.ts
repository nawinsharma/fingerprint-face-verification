import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    if (!req.nextauth.token) {
      const signupUrl = new URL("/signup", req.url);
      signupUrl.searchParams.set("callbackUrl", req.url);
      return NextResponse.redirect(signupUrl);
    }
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: ["/capture", "/search"],
};
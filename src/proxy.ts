import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isAuthPage = req.nextUrl.pathname === "/login" || req.nextUrl.pathname === "/register";

  if (!isLoggedIn && !isAuthPage) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    return NextResponse.redirect(loginUrl);
  }

  if (isLoggedIn && isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl.origin));
  }
});

export const config = {
  matcher: ["/dashboard", "/login", "/register"],
};

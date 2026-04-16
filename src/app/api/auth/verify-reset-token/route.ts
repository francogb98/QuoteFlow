import prisma from "@/lib/prisma";
import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const rawToken = req.nextUrl.searchParams.get("token");

  if (!rawToken) {
    return NextResponse.redirect(
      new URL("/auth/reset-password?error=invalid", req.nextUrl.origin),
    );
  }

  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");

  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { tokenHash },
  });

  if (!resetToken || resetToken.expiresAt < new Date()) {
    // Delete expired token if it exists
    if (resetToken) {
      await prisma.passwordResetToken.delete({ where: { tokenHash } });
    }
    return NextResponse.redirect(
      new URL("/auth/reset-password?error=expired", req.nextUrl.origin),
    );
  }

  // Exchange: generate a short-lived session token
  const rawSession = crypto.randomBytes(32).toString("hex");
  const sessionHash = crypto
    .createHash("sha256")
    .update(rawSession)
    .digest("hex");

  // 10-minute session window
  const expiresAt = new Date(Date.now() + 1000 * 60 * 10);

  // Delete any existing reset sessions for this admin
  await prisma.passwordResetSession.deleteMany({
    where: { adminId: resetToken.adminId },
  });

  await prisma.passwordResetSession.create({
    data: {
      sessionHash,
      adminId: resetToken.adminId,
      expiresAt,
    },
  });

  // Consume the email token immediately (one-time use)
  await prisma.passwordResetToken.delete({ where: { tokenHash } });

  const response = NextResponse.redirect(
    new URL("/auth/reset-password", req.nextUrl.origin),
  );

  const isProduction = process.env.NODE_ENV === "production";

  response.cookies.set("reset_session", rawSession, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    maxAge: 600, // 10 minutes
    path: "/",
  });

  return response;
}

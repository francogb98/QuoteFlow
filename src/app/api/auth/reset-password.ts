import type { NextApiRequest, NextApiResponse } from "next";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import prisma from "../../../lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") return res.status(405).end();
  const { id, token, password } = req.body;
  if (!id || !token || !password)
    return res.status(400).json({ error: "Missing fields" });

  const admin = await prisma.administrador.findUnique({ where: { id } });
  if (!admin || !admin.resetPasswordTokenHash || !admin.resetPasswordExpires) {
    return res.status(400).json({ error: "Invalid or expired token" });
  }

  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  if (tokenHash !== admin.resetPasswordTokenHash)
    return res.status(400).json({ error: "Invalid token" });
  if (admin.resetPasswordExpires.getTime() < Date.now())
    return res.status(400).json({ error: "Token expired" });

  const hashed = await bcrypt.hash(password, 10);
  await prisma.administrador.update({
    where: { id },
    data: {
      password: hashed,
      resetPasswordTokenHash: null,
      resetPasswordExpires: null,
    },
  });

  return res.status(200).json({ ok: true });
}

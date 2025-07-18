"use server";

import prisma from "@/lib/prisma";

export const deleteTables = async () => {
  try {
    console.log("Tablas eliminadas");
  } catch (error) {
    console.log(error);
  }
};

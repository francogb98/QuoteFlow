import prisma from "@/prisma";

export const findEmpresa = async (empresa: string) => {
  try {
    const admin = await prisma.empresa.findUnique({
      where: {
        nombre: empresa,
      },
    });

    return admin;
  } catch (error) {
    console.log(error);
  }
};

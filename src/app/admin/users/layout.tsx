import { auth } from "@/*";

export default async function layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <div className="flex flex-col gap-3">
      <h1 className="text-5xl font-bold text-center capitalize mb-3">
        {session?.user?.empresa.nombre}
      </h1>

      <div>{children}</div>
    </div>
  );
}

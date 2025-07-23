import { auth } from "@/*";

export default async function layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-5xl font-bold text-center capitalize bg-gradient-to-r from-green-600 to-purple-600 bg-clip-text text-transparent pb-2">
        {session?.user?.empresa.nombre}
      </h2>
      <div className="flex-1 mt-2">{children}</div>
    </div>
  );
}

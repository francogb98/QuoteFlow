import { auth } from "@/*";

export default async function layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return <div className="flex-1 mt-2">{children}</div>;
}

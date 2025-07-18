import { redirect } from "next/navigation";

export default async function NamePage() {
  redirect("/admin/users/list");

  return <div className="flex flex-col"></div>;
}

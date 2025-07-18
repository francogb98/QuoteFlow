import { DatosPersonales, TarifasGrid } from "./ui";

export default async function NamePage() {
  return (
    <div className="flex flex-col gap-5">
      <DatosPersonales />

      <TarifasGrid />
    </div>
  );
}

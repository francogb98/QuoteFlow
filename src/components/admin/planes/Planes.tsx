import { Metadata } from "next";
import { Check, X } from "lucide-react";

export const metadata: Metadata = {
  title: "Planes y Precios",
  description: "Elige el plan que mejor se adapte a tus necesidades",
};

const tiers = [
  {
    name: "Prueba",
    id: "tier-basic",
    href: "#",
    price: "Free",
    description:
      "Perfecto para empezar con lo esencial (se necesita código otorgado por el administrador)",
    featured: false,
  },
  {
    name: "Mensual",
    id: "tier-professional",
    href: "#",
    price: "$10.000",
    description: "Ideal para profesionales independientes",
    featured: true,
  },
  {
    name: "Anual",
    id: "tier-enterprise",
    href: "#",
    price: "$100.000",
    description: "Plan anual 20% de descuento",
    featured: false,
  },
];

const features = [
  {
    name: "Usuarios ilimitados",
    description: "Registra todos los usuarios que necesites",
    tiers: { Prueba: true, Mensual: true, Anual: true },
  },
  {
    name: "Control total de usuarios",
    description: "Editalos, activalos y desactivalos",
    tiers: { Prueba: true, Mensual: true, Anual: true },
  },
  {
    name: "Actualización automática de mora",
    description: "Cambios de estado según pagos",
    tiers: { Prueba: true, Mensual: true, Anual: true },
  },
  {
    name: "Soporte prioritario",
    description: "Respuesta en menos de 24 horas",
    tiers: { Prueba: false, Mensual: true, Anual: true },
  },
];

export function Planes() {
  return (
    <div className="bg-background py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Planes a medida para cada necesidad
          </h2>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Elige el plan que mejor se adapte a tu negocio y comienza a crecer
            hoy mismo.
          </p>
        </div>

        {/* Cards de Planes */}
        <div className="isolate mx-auto mt-10 grid max-w-md grid-cols-1 gap-8 lg:mx-0 lg:max-w-none lg:grid-cols-3">
          {tiers.map((tier) => (
            <div
              key={tier.id}
              className={`rounded-3xl p-8 ring-1 ring-border ${
                tier.featured
                  ? "ring-2 ring-primary bg-muted/50"
                  : ""
              }`}
            >
              <h3
                id={tier.id}
                className={`text-3xl font-semibold leading-8 ${
                  tier.featured ? "text-primary" : "text-foreground"
                }`}
              >
                {tier.name}
              </h3>
              <p className="mt-4 text-sm leading-6 text-muted-foreground">
                {tier.description}
              </p>
              <p className="mt-6 flex items-baseline gap-x-1">
                <span className="text-4xl font-bold tracking-tight text-foreground">
                  {tier.price}
                </span>
                <span className="text-sm font-semibold leading-6 text-muted-foreground">
                  {tier.name === "Mensual" ? "/mes" : ""}
                  {tier.name === "Anual" ? "/anual" : ""}
                </span>
              </p>
              <a
                href={tier.href}
                aria-describedby={tier.id}
                className={`mt-6 block rounded-md py-2 px-3 text-center text-sm font-semibold leading-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
                  tier.featured
                    ? "bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:outline-primary"
                    : "bg-muted text-muted-foreground hover:bg-muted/80 focus-visible:outline-muted-foreground"
                }`}
              >
                Comenzar
              </a>
            </div>
          ))}
        </div>

        {/* Tabla Comparativa de Beneficios */}
        <div className="mt-24">
          <h3 className="text-2xl font-bold tracking-tight text-foreground text-center mb-8">
            Comparación de características
          </h3>
          <div className="overflow-hidden shadow ring-1 ring-border rounded-lg">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-muted/50">
                <tr>
                  <th
                    scope="col"
                    className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-foreground sm:pl-6"
                  >
                    Beneficios
                  </th>
                  {tiers.map((tier) => (
                    <th
                      key={tier.id}
                      scope="col"
                      className="px-3 py-3.5 text-center text-sm font-semibold text-foreground"
                    >
                      {tier.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-card">
                {features.map((feature) => (
                  <tr key={feature.name}>
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-foreground sm:pl-6">
                      <div className="font-semibold">{feature.name}</div>
                      <div className="text-muted-foreground text-xs mt-1">
                        {feature.description}
                      </div>
                    </td>
                    {tiers.map((tier) => (
                      <td
                        key={`${feature.name}-${tier.name}`}
                        className="whitespace-nowrap px-3 py-4 text-sm text-center"
                      >
                        {feature.tiers[tier.name as keyof typeof feature.tiers] ? (
                          <Check className="inline-block h-5 w-5 text-accent" />
                        ) : (
                          <X className="inline-block h-5 w-5 text-destructive/60" />
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Preguntas frecuentes */}
        <div className="mt-24">
          <h3 className="text-2xl font-bold tracking-tight text-foreground text-center mb-8">
            Preguntas frecuentes
          </h3>
          <dl className="space-y-6 divide-y divide-border max-w-3xl mx-auto">
            {[
              {
                question: "¿Puedo cambiar de plan más tarde?",
                answer:
                  "Sí, puedes actualizar o degradar tu plan en cualquier momento desde tu panel de control.",
              },
              {
                question: "¿Puedo cancelar mi suscripción?",
                answer:
                  "Sí, puedes cancelar tu suscripción en cualquier momento desde tu panel de control.",
              },
              {
                question: "¿Cómo funciona la actualización por mora?",
                answer:
                  "El sistema cambia automáticamente el estado de los usuarios según su situación de pago.",
              },
            ].map((faq) => (
              <div key={faq.question} className="pt-6">
                <dt className="text-lg font-semibold leading-7 text-foreground">
                  {faq.question}
                </dt>
                <dd className="mt-2 text-base leading-7 text-muted-foreground">
                  {faq.answer}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}

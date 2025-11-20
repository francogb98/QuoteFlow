export default function DiagramaPage() {
  return (
    <div className="flex flex-col items-center w-full">
      <h1 className="text-3xl font-bold">
        Diagrama de Flujo de la Funcion de Procesamiento Diario
      </h1>
      <div className="w-full flex justify-center items-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="1200"
          height="900"
          viewBox="0 0 1200 900"
        >
          <style>{`
            .node { fill: #f8fafc; stroke: #1f2937; stroke-width: 1.5; rx: 8; }
            .title { font: 14px sans-serif; fill: #0f172a; font-weight: 700; }
            .text { font: 13px sans-serif; fill: #0f172a; }
            .arrow { stroke: #0f172a; stroke-width: 2; fill: none; marker-end: url(#arrowhead); }
          `}</style>
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="7"
              refX="10"
              refY="3.5"
              orient="auto"
            >
              <polygon points="0 0, 10 3.5, 0 7" fill="#0f172a" />
            </marker>
          </defs>
          <g transform="translate(450,20)">
            <rect className="node" x="0" y="0" width="300" height="50"></rect>
            <text className="title" x="150" y="30" textAnchor="middle">
              Inicio: Cron diario
            </text>
          </g>
          <g transform="translate(350,110)">
            <rect className="node" x="0" y="0" width="500" height="70"></rect>
            <text className="title" x="250" y="28" textAnchor="middle">
              processDailyComplete
            </text>
            <text className="text" x="250" y="48" textAnchor="middle">
              src/lib/cron/.../processing-payments-daily.action.ts
            </text>
          </g>
          <path className="arrow" d="M600 70 L600 110" />
          <g transform="translate(120,220)">
            <rect className="node" x="0" y="0" width="300" height="50"></rect>
            <text className="title" x="150" y="28" textAnchor="middle">
              getNormalizedBusinessDate
            </text>
          </g>
          <g transform="translate(760,220)">
            <rect className="node" x="0" y="0" width="300" height="50"></rect>
            <text className="title" x="150" y="28" textAnchor="middle">
              Load data (usuarios, tarifas, pagos)
            </text>
          </g>
          <path className="arrow" d="M450 180 L250 220" />
          <path className="arrow" d="M750 180 L900 220" />
          <g transform="translate(130,320)">
            <rect className="node" x="0" y="0" width="300" height="70"></rect>
            <text className="title" x="150" y="26" textAnchor="middle">
              procesarVencimientosDinamicos
            </text>
            <text className="text" x="150" y="46" textAnchor="middle">
              .../procesarVencimientosDinamicos.ts
            </text>
            <rect className="node" x="360" y="0" width="300" height="70"></rect>
            <text className="title" x="510" y="26" textAnchor="middle">
              actualizarTarifasFijas
            </text>
            <text className="text" x="510" y="46" textAnchor="middle">
              .../actualizarTarifasFijas.ts
            </text>
            <rect className="node" x="720" y="0" width="300" height="70"></rect>
            <text className="title" x="870" y="26" textAnchor="middle">
              generarPagosFuturos
            </text>
            <text className="text" x="870" y="46" textAnchor="middle">
              .../generarPagosFuturos.ts
            </text>
          </g>
          <path className="arrow" d="M310 270 L260 320" />
          <path className="arrow" d="M900 270 L760 320" />
          <g transform="translate(420,440)">
            <rect className="node" x="0" y="0" width="360" height="60"></rect>
            <text className="title" x="180" y="28" textAnchor="middle">
              calculations
            </text>
            <text className="text" x="180" y="48" textAnchor="middle">
              findTarifaRangeForDate / calculateDynamicPayment
            </text>
          </g>
          <path className="arrow" d="M290 390 L500 440" />
          <path className="arrow" d="M660 390 L600 440" />
          <path className="arrow" d="M930 390 L780 440" />
          <g transform="translate(360,540)">
            <rect className="node" x="0" y="0" width="480" height="70"></rect>
            <text className="title" x="240" y="28" textAnchor="middle">
              Actualizar estados / Crear registros de pago (Prisma)
            </text>
            <text className="text" x="240" y="50" textAnchor="middle">
              queries: create/update en tabla pagos
            </text>
          </g>
          <path className="arrow" d="M600 500 L600 540" />
          <g transform="translate(360,640)">
            <rect className="node" x="0" y="0" width="480" height="60"></rect>
            <text className="title" x="240" y="30" textAnchor="middle">
              enviarRecordatoriosDePago
            </text>
            <text className="text" x="240" y="48" textAnchor="middle">
              .../lib/sendEmailFunction.ts
            </text>
          </g>
          <path className="arrow" d="M600 610 L600 640" />
          <g transform="translate(360,730)">
            <rect className="node" x="0" y="0" width="480" height="70"></rect>
            <text className="title" x="240" y="28" textAnchor="middle">
              logger / registerCronLog
            </text>
            <text className="text" x="240" y="50" textAnchor="middle">
              .../lib/logger.ts -- src/app/api/cron/audit-log-cron.ts
            </text>
          </g>
          <path className="arrow" d="M600 700 L600 730" />
          <g transform="translate(450,830)">
            <rect className="node" x="0" y="0" width="300" height="50"></rect>
            <text className="title" x="150" y="30" textAnchor="middle">
              Fin: Respuesta HTTP
            </text>
          </g>
          <path className="arrow" d="M600 800 L600 830" />
        </svg>
      </div>
    </div>
  );
}

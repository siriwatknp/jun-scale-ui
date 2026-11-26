import { createRoot } from "react-dom/client";
import type { CSSProperties, ReactNode } from "react";
import { demos } from "./demos";
import { fixtures } from "./fixtures";
import "./kit.css";

const scales = new URLSearchParams(location.search).get("scales")?.split(",").map(Number) ?? [0.75, 1, 1.25, 1.5];

function Rows({ title, rows }: { title: string; rows: { name: string; render: () => ReactNode }[] }) {
  return (
    <>
      <h2>{title}</h2>
      <table className="kit-table">
        <thead>
          <tr>
            <th />
            {scales.map((scale) => <th key={scale}>--scale: {scale}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.name} data-block={row.name}>
              <th>{row.name}</th>
              {scales.map((scale) => <td key={scale} style={{ "--scale": scale } as CSSProperties}>{row.render()}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

createRoot(document.getElementById("root")!).render(
  <main className="kit-page" data-ready>
    <h1>Gallery</h1>
    <Rows title="Fixtures" rows={fixtures} />
    <Rows title="Compositions" rows={demos} />
  </main>,
);

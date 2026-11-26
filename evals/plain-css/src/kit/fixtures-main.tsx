import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";
import { fixtures } from "./fixtures";
import "./kit.css";

const host = document.createElement("div");
const root = createRoot(host);
flushSync(() =>
  root.render(
    <>
      {fixtures.map((fixture) => (
        <div key={fixture.name} data-fixture={fixture.name} data-group={fixture.group}>
          {fixture.render()}
        </div>
      ))}
    </>,
  ),
);
host.querySelectorAll<HTMLElement>("[data-fixture]").forEach((element) => {
  const template = document.createElement("template");
  template.dataset.fixture = element.dataset.fixture;
  template.dataset.group = element.dataset.group;
  template.innerHTML = element.innerHTML;
  document.body.append(template);
});
root.unmount();

function start() {
  const script = document.createElement("script");
  script.src = "./harness.js";
  script.addEventListener("load", () => (window as unknown as { runHarness: () => void }).runHarness());
  script.addEventListener("error", () => {
    document.querySelector("[data-summary]")!.textContent = `${fixtures.length} fixtures rendered. The harness is added when the evals are checked.`;
  });
  document.head.append(script);
}

if (document.readyState === "complete") start();
else addEventListener("load", start);

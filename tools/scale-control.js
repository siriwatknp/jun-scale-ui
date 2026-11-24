const SCALE_PARAM = "scale";

function applyScale(value) {
  document.documentElement.style.setProperty("--scale", value);
  document.querySelectorAll("[data-scale-output]").forEach((output) => {
    output.textContent = value;
  });
}

const initialScale = new URLSearchParams(location.search).get(SCALE_PARAM) ?? "1";
applyScale(initialScale);

addEventListener("DOMContentLoaded", () => {
  applyScale(initialScale);
  document.querySelectorAll("[data-scale-input]").forEach((input) => {
    input.value = initialScale;
    input.addEventListener("input", () => {
      applyScale(input.value);
      const params = new URLSearchParams(location.search);
      params.set(SCALE_PARAM, input.value);
      history.replaceState(null, "", `?${params}`);
      window.annotate?.();
    });
  });
});

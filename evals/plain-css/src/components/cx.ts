export function cx(...names: (string | undefined | false)[]) {
  return names.filter(Boolean).join(" ");
}

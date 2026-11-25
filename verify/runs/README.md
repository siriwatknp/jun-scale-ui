# Verification runs

Each folder holds what a fresh agent built from one version of `PRINCIPLE.md`, with only the principle, `verify/brief.md` and the fixture markup to go on. `notes.md` in each folder lists what the agent found unclear. Run `verify/run.sh runs/<folder>` to check one.

The harness has grown over the runs, so a folder can fail a check that did not exist when it was built. The table shows each run checked by the harness as it is now.

| Run | Principle | Result | What it showed |
| --- | --- | --- | --- |
| `v0-src` | v1 to v3 | 466 checks, 0 failed | `src/`, the hand-written implementation, used to check the harness itself. |
| `v1` | v1 | 10 failed | The Radio dot and Switch thumb were painted as background gradients, and an invalid inner value fell back to 1 instead of the outer value. v1 did not say what a part is or which value an invalid one falls back to. 13 unclear points. |
| `v2` | v2 | 466 checks, 0 failed | Correct on the first try. Its notes found wording problems: rule 10's examples broke its own centering rule, and rule 5 described the invalid-value fallback two ways. |
| `v3` | v3 | 466 checks, 0 failed | Correct on the first try. The remaining notes are edge cases, listed in `v3/notes.md`. |

# Verification runs

Each folder holds what a fresh agent built from one version of `PRINCIPLE.md`, with only the principle, `verify/brief.md` and the fixture markup to go on. `notes.md` in each folder lists what the agent found unclear. Run `verify/run.sh runs/<folder>` to check one.

The harness has grown over the runs, so a folder can fail a check that did not exist when it was built. "Result now" is each run checked by the current harness. "Result then" is the harness as it was when the run was built.

| Run | Principle | Result then | Result now | What it showed |
| --- | --- | --- | --- | --- |
| `v0-src` | latest | all passed | 469 checks, 0 failed | `src/`, the hand-written implementation, used to check the harness itself. |
| `v1` | v1 | 10 failed | 15 failed | The Radio dot and Switch thumb were painted as background gradients. v1 did not say what a part is. |
| `v2` | v2 | 0 failed | 6 failed | Correct on the first try. Its notes found wording problems in rules 5 and 10. It fails now only because v4 changed how group factors combine. |
| `v3` | v3 | 0 failed | 6 failed | Correct on the first try. Fails now for the same reason as `v2`. |
| `v4` | v4 | 0 failed | 469 checks, 0 failed | v4 made a group factor carry into the components inside, so an `Icon` keeps its proportion to a scaled `Button`. Correct on the first try. Its notes found two contradictions in the text. |
| `v5` | v5 | 0 failed | 469 checks, 0 failed | Correct on the first try with the fixed text. Remaining notes are edge cases, listed in `v5/notes.md`. v6 only removed the invalid-value rule, which the owner ruled out of scope, so this run also satisfies v6. Under v7 it fails 2 checks, because v7 changed how factors reach the components inside. |
| `v7` | v7 | 0 failed | 469 checks, 0 failed | v7 switched to the direct design: each component passes its own factor down to every smaller group. Correct on the first try. Its notes found that rule 10's 8px centering rule cannot hold for every member of a group: a 20px `Badge` in a 32px `Button` differs by 12px, and a `Badge` on a 20px label line differs by 4px. |

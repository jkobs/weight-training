# Resume: Bench 225

**Where it stands (2026-11-09):** Bench 225 is live at https://jkobs.github.io/bench-tracker/ (repo `jkobs/bench-tracker`). It has a 4-week block program, set logging, plate math, a rest timer, a max test that builds the next block, a target weight, a program length of 4, 8, 12 or 16 weeks, and backup and restore. Both test suites pass, and a headless run on the live site works, including offline support. It hasn't been confirmed on a real iPhone yet. The private Claude test link was deleted.

**Starting point:** Jason benches 135 × 8, an estimated 1RM of about 171. The goal is 225. At about 10 lb per block, that's roughly 24 weeks (estimate). His son uses the same app on his own iPhone with his own numbers.

**Open items:**
- Jason and his son install it in Safari (Share, Add to Home Screen) and report anything off.
- Possible next features: more lifts (squat, deadlift), sharing progress between the two phones (that needs a backend; they chose no sharing for now).

**Resume prompt:**
> Continue the Bench 225 app in `Claude-Projects/bench-press-app`. Read `CLAUDE.md` and `TASKS.md` first. It's live at https://jkobs.github.io/bench-tracker/ from repo `jkobs/bench-tracker`. Run both test suites in `tools/tests` before pushing, and ask me before any push.

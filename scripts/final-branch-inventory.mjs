// Read-only Git archaeology. Never deletes or updates any ref.
import { execFileSync } from "node:child_process";
const git = (...args) => execFileSync("git", args, { encoding: "utf8" }).trim();
const baseline = "fce9ccd868d773f2e6a7c5a2c29dc376b1414c50";
const refs = git("for-each-ref", "--format=%(refname:short)", "refs/remotes/origin").split("\n")
  .filter(ref => ref !== "origin" && ref !== "origin/main" && ref !== "origin/astra/global-final-closure");
console.log("| Branch | Tip SHA | Relation to baseline main | Classification | Unique work? | Action | Safe deletion? |");
console.log("|---|---|---|---|---|---|---|");
for (const ref of refs) {
  const sha = git("rev-parse", ref);
  let ancestor = false;
  try { git("merge-base", "--is-ancestor", ref, baseline); ancestor = true; } catch { /* inspect patch equivalence */ }
  const cherry = ancestor ? [] : git("cherry", baseline, ref).split("\n").filter(Boolean);
  const represented = !ancestor && cherry.length > 0 && cherry.every(line => line.startsWith("-"));
  const classification = ancestor ? "merged" : represented ? "superseded" : "uncertain";
  const safe = ancestor || represented;
  console.log(`| ${ref.replace(/^origin\//, "")} | ${sha} | ${ancestor ? "ancestor" : represented ? "all unique commits patch-equivalent" : "non-ancestor; differing patches require manual review"} | ${classification} | ${safe ? "no unrepresented patches" : "potential; preserve"} | ${safe ? "deletion candidate; provenance recorded here" : "retain; do not merge blindly"} | ${safe ? "yes" : "uncertain"} |`);
}

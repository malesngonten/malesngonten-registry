import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

function walk(dir, out = []) {
  for (const n of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = dir + "/" + n.name;
    if (n.isSymbolicLink()) out.push(p);
    else if (n.isDirectory()) walk(p, out);
  }
  return out;
}

const links = walk("lib");
let fixed = 0;
const broken = [];
for (const p of links) {
  const t = fs.readlinkSync(p);
  if (!t.startsWith("/root/malesngonten-registry/")) continue;
  const relTarget = t.replace("/root/malesngonten-registry/", "");
  const from = path.dirname(path.join(ROOT, p));
  const to = path.join(ROOT, relTarget);
  const relative = path.relative(from, to);
  fs.unlinkSync(p);
  fs.symlinkSync(relative, p);
  fixed++;
}

for (const p of links) {
  if (!fs.existsSync(p)) broken.push(p + " -> " + fs.readlinkSync(p));
}
console.log("total:", links.length, "converted:", fixed, "broken after:", broken.length);
if (broken.length) console.log(broken.slice(0, 10).join("\n"));

/**
 * Generates src/registry-meta.json — real playback metadata for every
 * component in the registry (composition size, fps, duration, default input
 * props, preview backdrop).
 *
 * config.ts files are parsed statically (brace-matcher + regex) instead of
 * imported: ~80 of them import `@/components/docs/...` modules that are not
 * part of this repo, so a module import would crash. Static parsing only
 * extracts object literals, which is all we need.
 *
 * Run via `npm run registry:generate` (also runs automatically before build).
 * Output is committed so the browser bundle never needs this step.
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;
const REGISTRY_JSON = path.join(ROOT, "registry.json");
const COMPONENTS = path.join(ROOT, "components");
const OUT = path.join(ROOT, "src", "registry-meta.json");

const CATEGORIES = ["ui", "typography", "backgrounds", "transitions", "mockups"];

/** Values used by lib/customizer-config.ts constants. */
const FPS = 30;
const W = 1280;
const H = 720;

/** Fallback composition for components without config.ts. */
const FALLBACK = { width: W, height: H, fps: FPS, durationInFrames: 120 };

/**
 * Default captions fixture (same shape as the upstream CAPTION_FIXTURE that
 * is referenced by caption-* configs but not present in this repo).
 * { text, startMs, endMs } entries sized for ~11s of speech.
 */
const CAPTION_FIXTURE = [
  { text: "This is a preview transcript", startMs: 0, endMs: 1400 },
  { text: "so you can see the caption styling", startMs: 1500, endMs: 3200 },
  { text: "and how words sync over time.", startMs: 3300, endMs: 4800 },
  { text: "Each sentence becomes its own page,", startMs: 5000, endMs: 6700 },
  { text: "words light up as they are spoken,", startMs: 6800, endMs: 8400 },
  { text: "and pages hold for a moment.", startMs: 8500, endMs: 9900 },
].map((c) => ({ ...c, text: c.text + " " }));

const CAPTION_DURATION_MS = 10600 + 700; // speech + holdMs tail

const titleCase = (slug) =>
  slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

/** Walks a balanced `{...}`/`[...]` block starting at `start`. */
function readBlock(src, start) {
  const open = src[start];
  const close = open === "{" ? "}" : open === "[" ? "]" : null;
  if (!close) throw new Error("not a block at " + start);
  let depth = 0;
  for (let i = start; i < src.length; i++) {
    const ch = src[i];
    if (ch === '"' || ch === "'" || ch === "`") {
      const quote = ch;
      i++;
      while (i < src.length) {
        if (src[i] === "\\") i++;
        else if (src[i] === quote) break;
        i++;
      }
      continue;
    }
    if (ch === open) depth++;
    else if (ch === close) {
      depth--;
      if (depth === 0) return { end: i };
    }
  }
  throw new Error("unbalanced block at " + start);
}

/** Splits `{ a: ..., b: { ... } }` body into top-level `key` -> value text. */
function parseEntries(src, start, end) {
  const entries = new Map();
  let depth = 0;
  let i = start;
  while (i < end) {
    // find key
    const keyMatch = /^\s*([A-Za-z_$][\w$]*)\s*:/.exec(src.slice(i, end));
    if (!keyMatch) {
      i++;
      continue;
    }
    const key = keyMatch[1];
    let cursor = i + keyMatch[0].length;
    // value boundary: scan until a top-level comma
    let valStart = cursor;
    let vDepth = 0;
    let value = null;
    let pos = cursor;
    for (; pos < end; pos++) {
      const ch = src[pos];
      if (ch === '"' || ch === "'" || ch === "`") {
        const quote = ch;
        pos++;
        while (pos < end) {
          if (src[pos] === "\\") pos++;
          else if (src[pos] === quote) break;
          pos++;
        }
        continue;
      }
      if (ch === "{" || ch === "(" || ch === "[") vDepth++;
      else if (ch === "}" || ch === ")" || ch === "]") vDepth--;
      else if (ch === "," && vDepth === 0) break;
    }
    value = src.slice(valStart, pos);
    entries.set(key, value.trim());
    i = pos + 1;
  }
  return entries;
}

function unquote(value) {
  const m = /^(["'`])([\s\S]*)\1\s*$/.exec(value.trim());
  return m ? m[2] : null;
}

function parseScalar(value) {
  const v = value.trim();
  const s = unquote(v);
  if (s !== null) return s;
  if (/^-?\d+(\.\d+)?$/.test(v)) return Number(v);
  if (v === "true" || v === "false") return v === "true";
  return null; // identifier, expression, function -> unresolvable
}

/** Parses one config.ts file into playback metadata. */
function parseConfig(configPath) {
  const src = fs.readFileSync(configPath, "utf8");
  const marker = /export\s+const\s+[\w$]+\s*(?::\s*ComponentConfig)?\s*=/.exec(src);
  if (!marker) return null;
  const braceIdx = src.indexOf("{", marker.index);
  let blockEnd;
  try {
    blockEnd = readBlock(src, src.indexOf("{", src.indexOf("= ", braceIdx - 2) >= 0 ? src.indexOf("{", braceIdx) : braceIdx)).end;
  } catch {
    blockEnd = readBlock(src, braceIdx).end;
  }
  const body = parseEntries(src, braceIdx + 1, blockEnd);

  const out = {};
  const wRaw = body.get("compositionWidth");
  const hRaw = body.get("compositionHeight");
  const fpsRaw = body.get("fps");
  const durRaw = body.get("durationInFrames");

  const scalarOrConst = (raw, constant, fallback) => {
    if (raw === undefined) return null;
    const lit = parseScalar(raw);
    if (typeof lit === "number") return lit;
    if (lit === null && new RegExp("(^|[^\\w$])" + constant + "([^\\w$]|$)").test(raw)) return fallback;
    return null;
  };

  out.width = scalarOrConst(wRaw, "W", W) ?? FALLBACK.width;
  out.height = scalarOrConst(hRaw, "H", H) ?? FALLBACK.height;
  out.fps = scalarOrConst(fpsRaw, "FPS", FPS) ?? FALLBACK.fps;
  out.durationInFrames = scalarOrConst(durRaw, "", FALLBACK.durationInFrames) ?? null;
  out.hasLiteralDuration = typeof parseScalar(durRaw ?? "") === "number";

  // previewBackdrop: { type: "color", value: "#123456" }
  const backdropRaw = body.get("previewBackdrop");
  out.backdrop = null;
  if (backdropRaw) {
    const b = backdropRaw.indexOf("{");
    if (b >= 0) {
      const bEnd = readBlock(backdropRaw, b).end;
      for (const sub of parseEntries(backdropRaw, b + 1, bEnd).values()) {
        const s = parseScalar(sub);
        if (typeof s === "string" && s.startsWith("#")) out.backdrop = s;
      }
    }
  }

  // controls: { prop: { type: ..., default: ... }, ... }
  out.inputProps = {};
  out.captionsProp = false;
  const controlsRaw = body.get("controls");
  if (controlsRaw && controlsRaw.startsWith("{")) {
    const cEnd = readBlock(controlsRaw, controlsRaw.indexOf("{")).end;
    for (const [prop, value] of parseEntries(controlsRaw, controlsRaw.indexOf("{") + 1, cEnd)) {
      if (!value.startsWith("{")) continue;
      const pEnd = readBlock(value, 0).end;
      const fields = parseEntries(value, 1, pEnd);
      const type = parseScalar(fields.get("type") ?? "");
      const def = fields.get("default");
      if (type === "remotion-captions") {
        out.captionsProp = true;
        continue; // fixture injected separately
      }
      const lit = parseScalar(def ?? "");
      if (lit !== null) out.inputProps[prop] = lit;
    }
  }
  return out;
}

function main() {
  const registry = JSON.parse(fs.readFileSync(REGISTRY_JSON, "utf8"));
  const registryBySlug = new Map();
  for (const [key, entry] of Object.entries(registry.components)) {
    const firstPath = entry.files?.[0]?.path ?? "";
    const segs = firstPath.split("/");
    const slug = segs.length >= 3 ? segs[2] : null;
    if (slug) {
      registryBySlug.set(slug, {
        key,
        name: entry.name,
        description: entry.description,
        dependencies: entry.dependencies ?? [],
        files: (entry.files ?? []).map((f) => f.path),
      });
    }
  }

  // Discover every component directory on disk (covers entries missing from
  // registry.json as well).
  const dirs = [];
  for (const cat of CATEGORIES) {
    const catDir = path.join(COMPONENTS, cat);
    for (const name of fs.readdirSync(catDir, { withFileTypes: true })) {
      if (name.isDirectory()) dirs.push({ category: cat, slug: name.name });
    }
  }

  const meta = {};
  let configHits = 0;
  for (const { category, slug } of dirs) {
    const configPath = path.join(COMPONENTS, category, slug, "config.ts");
    const reg = registryBySlug.get(slug);
    let parsed = null;
    if (fs.existsSync(configPath)) {
      try {
        parsed = parseConfig(configPath);
        configHits += 1;
      } catch (err) {
        console.warn(`[meta] parse failed for ${category}/${slug}: ${err.message}`);
      }
    }

    const duration =
      parsed?.durationInFrames ?? FALLBACK.durationInFrames;
    const inputProps = { ...(parsed?.inputProps ?? {}) };
    const isCaption = slug.startsWith("caption-") && parsed?.captionsProp;
    let usedDuration = duration;
    if (isCaption) {
      inputProps.captions = CAPTION_FIXTURE;
      // caption configs compute duration from the fixture via a helper that
      // is not statically parseable -> derive it from the generated fixture.
      if (!parsed.hasLiteralDuration) {
        usedDuration = Math.ceil((CAPTION_DURATION_MS / 1000) * (parsed?.fps ?? FPS));
      }
    }

    meta[`${category}/${slug}`] = {
      key: reg?.key ?? titleCase(slug),
      category,
      width: parsed?.width ?? FALLBACK.width,
      height: parsed?.height ?? FALLBACK.height,
      fps: parsed?.fps ?? FALLBACK.fps,
      durationInFrames: Math.max(1, Math.round(usedDuration)),
      inputProps,
      backdrop: parsed?.backdrop ?? null,
      inRegistry: Boolean(reg),
    };
  }

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify(meta, null, 2) + "\n");
  const withBackdrop = Object.values(meta).filter((m) => m.backdrop).length;
  console.log(
    `[registry-meta] ${Object.keys(meta).length} components (${configHits} with config.ts, ${withBackdrop} with backdrop) -> ${path.relative(ROOT, OUT)}`,
  );
}

main();

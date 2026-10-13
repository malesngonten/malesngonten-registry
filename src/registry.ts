/**
 * Single source of truth for the component gallery.
 *
 * Combines:
 * - registry.json          -> registry metadata (name, description, files,
 *                             dependencies) for entries published to the CLI
 * - src/registry-meta.json -> playback metadata generated from each
 *                             component's config.ts (width, height, fps,
 *                             durationInFrames, default inputProps, backdrop)
 *
 * The generation script (`npm run registry:generate`) parses config.ts
 * statically, so importing this module never loads component code — keeps
 * React.lazy code-splitting intact.
 */
import registryData from "../registry.json";
import meta from "./registry-meta.json";

export interface RegistryFile {
  path: string;
  type: string;
}

export type CategoryId =
  | "ui"
  | "typography"
  | "backgrounds"
  | "transitions"
  | "mockups";

export interface RegistryItem {
  /** Directory id, e.g. "typography/caption-karaoke". */
  id: string;
  /** Registry key, e.g. "Caption Karaoke". */
  key: string;
  slug: string;
  category: CategoryId;
  name: string;
  description: string;
  dependencies: string[];
  files: string[];
  /** Composition size in px (from config.ts / customizer defaults). */
  width: number;
  height: number;
  fps: number;
  durationInFrames: number;
  /** Default props extracted from config.ts controls (incl. caption fixture). */
  inputProps: Record<string, unknown>;
  /** Optional solid backdrop color for the preview box. */
  previewBackdrop: string | null;
  /** Whether the component is published in registry.json. */
  inRegistry: boolean;
}

interface RegistryEntry {
  name: string;
  description: string;
  dependencies: string[];
  files: RegistryFile[];
}

interface MetaEntry {
  key: string;
  category: CategoryId;
  width: number;
  height: number;
  fps: number;
  durationInFrames: number;
  inputProps: Record<string, unknown>;
  backdrop: string | null;
  inRegistry: boolean;
}

const components = (registryData as unknown as {
  components: Record<string, RegistryEntry>;
}).components;

export const registryItems: RegistryItem[] = Object.entries(
  meta as unknown as Record<string, MetaEntry>,
).map(([id, m]) => {
  const [category, slug] = id.split("/", 2);
  const reg = components[m.key];
  const files = reg?.files?.map((f) => f.path) ?? [];
  return {
    id,
    key: m.key,
    slug,
    category,
    name: reg?.name ?? slug
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" "),
    description:
      reg?.description ?? `Production-ready Remotion component: ${slug}`,
    dependencies: reg?.dependencies ?? [],
    files,
    width: m.width,
    height: m.height,
    fps: m.fps,
    durationInFrames: m.durationInFrames,
    inputProps: m.inputProps ?? {},
    previewBackdrop: m.backdrop,
    inRegistry: m.inRegistry,
  };
});

export const CATEGORY_LABELS: Record<CategoryId, string> = {
  typography: "Text Animation",
  backgrounds: "Backgrounds",
  transitions: "Transitions",
  mockups: "Phone Mockups",
  ui: "UI Components",
};

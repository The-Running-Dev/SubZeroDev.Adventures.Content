/**
 * The published side quest, read back the way a consumer reads it: manifest plus campaign
 * files from the repository root, through `fromPortable`, into
 * `buildValidatedContentRegistry` with the manifest's own `attachments`. Then played — from
 * the host's start, through the attached choice, through the module, and back out into the
 * host where the binding says it lands.
 */
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  buildValidatedContentRegistry,
  createCountingIds,
  createEngine,
  digestManifestResolution,
  digestPortableCampaign,
  fromPortable,
  storyGraphKind,
  type GameState,
  type KindRegistry,
  type PortableCampaign,
  type PortableManifest,
} from "@the-running-dev/game-engine";

const repoRoot = fileURLToPath(new URL("../../", import.meta.url));
const kinds = { "story-graph": storyGraphKind } as unknown as KindRegistry;

interface Choice {
  readonly id: string;
  readonly goto: string;
}
interface Node {
  readonly kind: string;
  readonly goto?: string;
  readonly choices?: readonly Choice[];
}
interface Content {
  readonly startNodeId: string;
  readonly nodes: Record<string, Node>;
}
interface KindState {
  readonly currentNodeId: string;
  readonly unlockedAchievements: readonly string[];
}

async function readJson<T>(file: string): Promise<T> {
  return JSON.parse(await readFile(`${repoRoot}${file}`, "utf8")) as T;
}

async function loadPublished() {
  const manifest = await readJson<PortableManifest>("manifest.json");
  const files = await Promise.all(
    manifest.campaigns.map((entry) => readJson<PortableCampaign>(entry.file)),
  );
  return { manifest, files };
}

/** The choice ids that walk `content` from its start to `target`, passing through `auto`
 *  nodes the way the engine does. Breadth-first, so the shortest route. */
function routeTo(content: Content, target: string): string[] {
  const queue: { node: string; path: string[] }[] = [
    { node: content.startNodeId, path: [] },
  ];
  const seen = new Set<string>();
  while (queue.length > 0) {
    const { node, path } = queue.shift()!;
    if (node === target) return path;
    if (seen.has(node)) continue;
    seen.add(node);
    const current = content.nodes[node];
    if (current?.kind === "auto" && current.goto !== undefined)
      queue.push({ node: current.goto, path });
    for (const choice of current?.choices ?? [])
      queue.push({ node: choice.goto, path: [...path, choice.id] });
  }
  throw new Error(`no route to "${target}"`);
}

describe("the published getting-started side quest", () => {
  it("publishes the module hidden and the attachment on the manifest, covered by its resolution", async () => {
    const { manifest, files } = await loadPublished();
    const sideQuest = files.find(
      (file) => file.campaign.id === "getting-started-side-quest",
    );
    expect(sideQuest?.catalog.hidden).toBe(true);
    expect(manifest.attachments?.map((a) => a.hostCampaignId)).toEqual([
      "getting-started",
    ]);
    manifest.campaigns.forEach((entry, i) =>
      expect(digestPortableCampaign(files[i]!)).toBe(entry.digest),
    );
    expect(
      digestManifestResolution(manifest.campaigns, manifest.attachments),
    ).toBe(manifest.resolution);
    expect(digestManifestResolution(manifest.campaigns)).not.toBe(
      manifest.resolution,
    );
  });

  it("stamps the host, leaves the module and every other campaign at its authored version", async () => {
    const { manifest, files } = await loadPublished();
    const result = buildValidatedContentRegistry(
      files.map((file) => fromPortable(file).built),
      kinds,
      manifest.attachments,
    );
    if (!result.ok || result.value === undefined)
      throw new Error(JSON.stringify(result.errors));
    for (const entry of manifest.campaigns) {
      const version = result.value.campaigns.get(entry.id)!.version;
      if (entry.id === "getting-started")
        expect(version).toMatch(/^1\.0\.0\+att\.[0-9a-f]{12}$/);
      else expect(version).toBe(entry.version);
    }
  });

  it("plays from the host's start through the attached choice and back out to campaign_shapes", async () => {
    const { manifest, files } = await loadPublished();
    const result = buildValidatedContentRegistry(
      files.map((file) => fromPortable(file).built),
      kinds,
      manifest.attachments,
    );
    if (!result.ok || result.value === undefined)
      throw new Error(JSON.stringify(result.errors));
    const registry = result.value;
    const host = registry.campaigns.get("getting-started")!.content as Content;
    expect(
      host.nodes["content_composition_intro"]!.choices!.map((c) => c.id),
    ).toEqual(["shrug", "skip", "what_was_that"]);

    const engine = createEngine({ kinds, registry, ids: createCountingIds() });
    let state: GameState = engine.createGame({
      campaignId: "getting-started",
      seed: "side-quest",
    }).value!;
    const kindState = () => state.kindState as KindState;
    const step = (actionId: string) => {
      const next = engine.submitAction(state, actionId);
      if (!next.ok || next.value === undefined)
        throw new Error(`${actionId}: ${JSON.stringify(next.errors)}`);
      state = next.value;
    };

    for (const choice of routeTo(host, "content_composition_intro"))
      step(choice);
    expect(kindState().currentNodeId).toBe("content_composition_intro");

    step("what_was_that");
    expect(kindState().currentNodeId).toBe("side_quest::side_quest_landing");
    expect(kindState().unlockedAchievements).toContain(
      "side_quest::off_the_beaten_graph",
    );
    step("proceed");
    expect(kindState().currentNodeId).toBe("side_quest::side_quest_end");
    step("continue");
    expect(kindState().currentNodeId).toBe("campaign_shapes");
    expect(state.status).toBe("active");
  });
});

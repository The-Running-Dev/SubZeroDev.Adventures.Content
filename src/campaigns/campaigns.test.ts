import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  buildValidatedContentRegistry,
  fromPortable,
  storyGraphKind,
  type KindRegistry,
} from "@the-running-dev/game-engine";
import {
  digestPortableCampaign,
  toPortable,
} from "@the-running-dev/game-engine/authoring";
import {
  buildWhatWouldLuciferDoCampaign,
  whatWouldLuciferDoCatalog,
  whatWouldLuciferDoMigration,
} from "./what-would-lucifer-do.js";
import {
  buildWhatWouldLuciferDoEngineersCutCampaign,
  whatWouldLuciferDoEngineersCutCatalog,
} from "./what-would-lucifer-do-engineers-cut.js";
import {
  buildLuciferChroniclesCampaign,
  luciferChroniclesCatalog,
  luciferChroniclesMigration,
} from "./lucifer-chronicles.js";
import {
  buildBulgariaBureaucracyCampaign,
  bulgariaBureaucracyCatalog,
  bulgariaBureaucracyMigration,
} from "./bulgaria-bureaucracy.js";
import {
  buildBulgariaReturnCampaign,
  bulgariaReturnCatalog,
  bulgariaReturnMigration,
} from "./bulgaria-return.js";
import {
  buildBulgariaDrivingCampaign,
  bulgariaDrivingCatalog,
  bulgariaDrivingMigration,
} from "./bulgaria-driving.js";
import {
  buildBulgariaInheritanceCampaign,
  bulgariaInheritanceCatalog,
  bulgariaInheritanceMigration,
} from "./bulgaria-inheritance.js";
import {
  buildBulgariaEnterpriseCampaign,
  bulgariaEnterpriseCatalog,
  bulgariaEnterpriseMigration,
} from "./bulgaria-enterprise.js";
import {
  buildSakiQuestCampaign,
  sakiQuestCatalog,
} from "./saki-quest-for-redemption.js";

const entries = [
  [
    buildWhatWouldLuciferDoCampaign,
    whatWouldLuciferDoCatalog,
    whatWouldLuciferDoMigration,
  ],
  [
    buildWhatWouldLuciferDoEngineersCutCampaign,
    whatWouldLuciferDoEngineersCutCatalog,
  ],
  [
    buildLuciferChroniclesCampaign,
    luciferChroniclesCatalog,
    luciferChroniclesMigration,
  ],
  [
    buildBulgariaBureaucracyCampaign,
    bulgariaBureaucracyCatalog,
    bulgariaBureaucracyMigration,
  ],
  [buildBulgariaReturnCampaign, bulgariaReturnCatalog, bulgariaReturnMigration],
  [
    buildBulgariaDrivingCampaign,
    bulgariaDrivingCatalog,
    bulgariaDrivingMigration,
  ],
  [
    buildBulgariaInheritanceCampaign,
    bulgariaInheritanceCatalog,
    bulgariaInheritanceMigration,
  ],
  [
    buildBulgariaEnterpriseCampaign,
    bulgariaEnterpriseCatalog,
    bulgariaEnterpriseMigration,
  ],
  [buildSakiQuestCampaign, sakiQuestCatalog],
] as const;

const kinds = { "story-graph": storyGraphKind } as unknown as KindRegistry;

interface StoryGraphNode {
  readonly kind: string;
  readonly goto?: string;
  readonly choices?: readonly { readonly goto: string }[];
  readonly transitions?: readonly { readonly goto: string }[];
}

interface StoryGraphContent {
  readonly startNodeId: string;
  readonly nodes: Record<string, StoryGraphNode>;
}

/** Walks every `goto` edge (choice/random/auto) from `startNodeId` and returns the set of
 *  `ending`-kind node ids actually reachable — a stronger claim than counting ending nodes
 *  in the map, which says nothing about whether the graph actually connects to them. */
function reachableEndingIds(content: StoryGraphContent): Set<string> {
  const visited = new Set<string>();
  const endings = new Set<string>();
  const stack = [content.startNodeId];
  while (stack.length > 0) {
    const nodeId = stack.pop();
    if (nodeId === undefined || visited.has(nodeId)) continue;
    visited.add(nodeId);
    const node = content.nodes[nodeId];
    if (node === undefined) continue;
    if (node.kind === "ending") {
      endings.add(nodeId);
      continue;
    }
    const next = [
      ...(node.goto !== undefined ? [node.goto] : []),
      ...(node.choices?.map((c) => c.goto) ?? []),
      ...(node.transitions?.map((t) => t.goto) ?? []),
    ];
    for (const target of next) stack.push(target);
  }
  return endings;
}

/** Campaign ids are the only stable handle on `entries` — array position drifts the moment
 *  a campaign is inserted or reordered, and nothing would signal that a test's selection had
 *  silently moved to a different campaign. */
function builtCampaignId(result: {
  ok: boolean;
  value?: { campaign: { id: string } };
}): string {
  if (!result.ok || result.value === undefined)
    throw new Error("campaign build failed");
  return result.value.campaign.id;
}

const isBulgariaCampaign = (id: string): boolean => id.startsWith("bulgaria-");

describe("published campaign sources", () => {
  it("builds and validates all nine campaigns", () => {
    const results = entries.map(([build]) => build());
    const built = results.flatMap((result) =>
      result.ok && result.value !== undefined ? [result.value] : [],
    );
    expect(built.length).toBe(entries.length);

    const registry = buildValidatedContentRegistry(built, kinds);
    expect(registry.ok).toBe(true);
  });

  it("keeps the expanded Bulgaria catalog at 75 reachable endings and portable-hydrates it", () => {
    const bulgaria = entries.filter(([build]) =>
      isBulgariaCampaign(builtCampaignId(build())),
    );
    expect(bulgaria.length).toBe(5);
    const reachableCount = bulgaria.reduce((total, [build]) => {
      const result = build();
      if (!result.ok || result.value === undefined)
        throw new Error("campaign build failed");
      return (
        total +
        reachableEndingIds(result.value.campaign.content as StoryGraphContent)
          .size
      );
    }, 0);
    expect(reachableCount).toBe(75);
    const result = buildBulgariaBureaucracyCampaign();
    if (!result.ok || result.value === undefined)
      throw new Error("campaign build failed");
    expect(
      fromPortable(
        toPortable(
          result.value,
          bulgariaBureaucracyCatalog,
          bulgariaBureaucracyMigration,
        ),
      ).built.campaign.id,
    ).toBe("bulgaria-bureaucracy");
  });

  it("migrates a 1.0.0 save through the published portable document", () => {
    const built = buildBulgariaBureaucracyCampaign();
    if (!built.ok || built.value === undefined)
      throw new Error("campaign build failed");

    const portable = toPortable(
      built.value,
      bulgariaBureaucracyCatalog,
      bulgariaBureaucracyMigration,
    );
    const hydrated = fromPortable(portable);
    if (hydrated.built.campaign.migrateState === undefined) {
      throw new Error("expected the hydrated campaign to carry migrateState");
    }

    // "clerk_review" only existed pre-expansion (see bulgariaBureaucracyMigration's
    // nodeMap) and remaps to "registry_route_event_1" in the published 2.0.0 graph.
    const v1State = {
      currentNodeId: "clerk_review",
      variables: {},
      visitedCounts: {},
    };
    const migrated = hydrated.built.campaign.migrateState(v1State, "1.0.0");

    expect(migrated.ok).toBe(true);
    expect((migrated.value as { currentNodeId: string }).currentNodeId).toBe(
      "registry_route_event_1",
    );
  });

  it("keeps the four non-Bulgaria campaigns' published digests unchanged", async () => {
    const repoRoot = fileURLToPath(new URL("../../", import.meta.url));
    const manifest = JSON.parse(
      await readFile(`${repoRoot}manifest.json`, "utf8"),
    ) as { campaigns: readonly { id: string; digest: string }[] };
    const manifestDigest = (id: string): string => {
      const entry = manifest.campaigns.find((c) => c.id === id);
      if (entry === undefined)
        throw new Error(`manifest has no entry for "${id}"`);
      return entry.digest;
    };

    const unaffected = entries.filter(
      ([build]) => !isBulgariaCampaign(builtCampaignId(build())),
    );
    expect(unaffected.length).toBe(4);
    for (const [build, catalog, migration] of unaffected) {
      const result = build();
      if (!result.ok || result.value === undefined)
        throw new Error("campaign build failed");
      const portable = toPortable(result.value, catalog, migration);
      expect(digestPortableCampaign(portable)).toBe(
        manifestDigest(result.value.campaign.id),
      );
    }
  });
});

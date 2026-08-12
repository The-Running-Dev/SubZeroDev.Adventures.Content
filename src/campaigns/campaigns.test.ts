import { describe, expect, it } from "vitest";
import {
  buildValidatedContentRegistry,
  fromPortable,
  storyGraphKind,
  type KindRegistry,
} from "@the-running-dev/game-engine";
import { toPortable } from "@the-running-dev/game-engine/authoring";
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

describe("published campaign sources", () => {
  it("builds and validates all nine campaigns", () => {
    const built = entries.map(([build]) => build());
    expect(
      built.every((result) => result.ok && result.value !== undefined),
    ).toBe(true);
    const registry = buildValidatedContentRegistry(
      built.map((result) => result.value!),
      { "story-graph": storyGraphKind } as unknown as KindRegistry,
    );
    expect(registry.ok).toBe(true);
  });

  it("keeps the expanded Bulgaria catalog at 75 endings and portable-hydrates it", () => {
    const bulgaria = entries.slice(3, 8);
    const endingCount = bulgaria.reduce((total, [build]) => {
      const result = build();
      if (!result.ok || result.value === undefined)
        throw new Error("campaign build failed");
      return (
        total +
        Object.values(
          (
            result.value.campaign.content as {
              nodes: Record<string, { kind: string }>;
            }
          ).nodes,
        ).filter((node) => node.kind === "ending").length
      );
    }, 0);
    expect(endingCount).toBe(75);
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
});

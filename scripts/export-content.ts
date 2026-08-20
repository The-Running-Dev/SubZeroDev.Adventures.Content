/**
 * Builds and publishes the canonical portable JSON from this repository's TypeScript sources.
 * The ordered `entries` list is the publication catalog. Every campaign builds before any
 * output is written, so an authoring failure cannot leave a partial manifest behind.
 */

import { existsSync } from "node:fs";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

import {
  buildWhatWouldLuciferDoCampaign,
  whatWouldLuciferDoCatalog,
  whatWouldLuciferDoMigration,
} from "../src/campaigns/what-would-lucifer-do.js";
import {
  buildWhatWouldLuciferDoEngineersCutCampaign,
  whatWouldLuciferDoEngineersCutCatalog,
} from "../src/campaigns/what-would-lucifer-do-engineers-cut.js";
import {
  buildLuciferChroniclesCampaign,
  luciferChroniclesCatalog,
  luciferChroniclesMigration,
} from "../src/campaigns/lucifer-chronicles.js";
import {
  buildBulgariaBureaucracyCampaign,
  bulgariaBureaucracyCatalog,
  bulgariaBureaucracyMigration,
} from "../src/campaigns/bulgaria-bureaucracy.js";
import {
  buildBulgariaReturnCampaign,
  bulgariaReturnCatalog,
  bulgariaReturnMigration,
} from "../src/campaigns/bulgaria-return.js";
import {
  buildBulgariaDrivingCampaign,
  bulgariaDrivingCatalog,
  bulgariaDrivingMigration,
} from "../src/campaigns/bulgaria-driving.js";
import {
  buildBulgariaInheritanceCampaign,
  bulgariaInheritanceCatalog,
  bulgariaInheritanceMigration,
} from "../src/campaigns/bulgaria-inheritance.js";
import {
  buildBulgariaEnterpriseCampaign,
  bulgariaEnterpriseCatalog,
  bulgariaEnterpriseMigration,
} from "../src/campaigns/bulgaria-enterprise.js";
import {
  buildBulgarianAdventuresCampaign,
  bulgarianAdventuresCatalog,
} from "../src/campaigns/bulgarian-adventures.js";
import {
  buildBulgarianAdventuresMaximumAbsurdityCampaign,
  bulgarianAdventuresMaximumAbsurdityCatalog,
} from "../src/campaigns/bulgarian-adventures-maximum-absurdity.js";
import {
  buildSakiQuestCampaign,
  sakiQuestCatalog,
} from "../src/campaigns/saki-quest-for-redemption.js";
import {
  buildGettingStartedCampaign,
  gettingStartedCatalog,
} from "../src/campaigns/getting-started.js";
import {
  toPortable,
  type PortableCampaign,
  type PortableManifestEntry,
} from "@the-running-dev/game-engine/authoring";
import {
  digestManifestResolution,
  digestPortableCampaign,
} from "@the-running-dev/game-engine/authoring";
import type { BuiltCampaign } from "@the-running-dev/game-engine/authoring";
import type {
  PortableCatalog,
  PortableMigration,
} from "@the-running-dev/game-engine/authoring";

const here = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.resolve(here, "..");

interface Entry {
  readonly build: () => {
    ok: boolean;
    value?: BuiltCampaign;
    errors: readonly unknown[];
  };
  readonly catalog: PortableCatalog;
  readonly migration?: PortableMigration;
}

const entries: readonly Entry[] = [
  {
    build: buildWhatWouldLuciferDoCampaign,
    catalog: whatWouldLuciferDoCatalog,
    migration: whatWouldLuciferDoMigration,
  },
  {
    build: buildWhatWouldLuciferDoEngineersCutCampaign,
    catalog: whatWouldLuciferDoEngineersCutCatalog,
  },
  {
    build: buildLuciferChroniclesCampaign,
    catalog: luciferChroniclesCatalog,
    migration: luciferChroniclesMigration,
  },
  {
    build: buildBulgariaBureaucracyCampaign,
    catalog: bulgariaBureaucracyCatalog,
    migration: bulgariaBureaucracyMigration,
  },
  {
    build: buildBulgariaReturnCampaign,
    catalog: bulgariaReturnCatalog,
    migration: bulgariaReturnMigration,
  },
  {
    build: buildBulgariaDrivingCampaign,
    catalog: bulgariaDrivingCatalog,
    migration: bulgariaDrivingMigration,
  },
  {
    build: buildBulgariaInheritanceCampaign,
    catalog: bulgariaInheritanceCatalog,
    migration: bulgariaInheritanceMigration,
  },
  {
    build: buildBulgariaEnterpriseCampaign,
    catalog: bulgariaEnterpriseCatalog,
    migration: bulgariaEnterpriseMigration,
  },
  {
    build: buildBulgarianAdventuresCampaign,
    catalog: bulgarianAdventuresCatalog,
  },
  {
    build: buildBulgarianAdventuresMaximumAbsurdityCampaign,
    catalog: bulgarianAdventuresMaximumAbsurdityCatalog,
  },
  { build: buildSakiQuestCampaign, catalog: sakiQuestCatalog },
  { build: buildGettingStartedCampaign, catalog: gettingStartedCatalog },
];

/** Builds every entry first, writes nothing until every build has succeeded — the abort
 *  this graduation adds. Returns the built portables in source order.
 *
 *  Failures are tagged by stage: "[content]" is a campaign's own build() rejecting its
 *  authored content, "[export]" is toPortable() throwing on an export-plumbing precondition
 *  (e.g. a migration wired to the wrong campaign kind) -- a different bug, in a different
 *  file, and worth telling apart at a glance rather than dumping both into one bullet list. */
function buildAllOrAbort(): readonly PortableCampaign[] {
  const portables: PortableCampaign[] = [];
  const failures: string[] = [];

  for (const entry of entries) {
    const result = entry.build();
    if (!result.ok || result.value === undefined) {
      failures.push(`  - [content] ${JSON.stringify(result.errors)}`);
      continue;
    }
    try {
      portables.push(toPortable(result.value, entry.catalog, entry.migration));
    } catch (error) {
      failures.push(
        `  - [export] ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  if (failures.length > 0) {
    throw new Error(
      `${failures.length} of ${entries.length} campaign build(s) failed, writing nothing:\n${failures.join("\n")}`,
    );
  }

  const seenIds = new Set<string>();
  for (const portable of portables) {
    if (seenIds.has(portable.campaign.id)) {
      throw new Error(
        `two entries build campaign id "${portable.campaign.id}" -- they would overwrite each other's published file. Writing nothing.`,
      );
    }
    seenIds.add(portable.campaign.id);
  }

  return portables;
}

/** The manifest's own view of what's currently published, read before it's overwritten --
 *  the only way to tell a campaign dropped from `entries` apart from one that was never
 *  published at all. Empty when no manifest exists yet (a first run). */
async function previouslyPublishedFiles(
  manifestPath: string,
): Promise<readonly string[]> {
  if (!existsSync(manifestPath)) return [];
  const manifest = JSON.parse(await readFile(manifestPath, "utf8")) as {
    campaigns: readonly { file: string }[];
  };
  return manifest.campaigns.map((entry) => entry.file);
}

async function main(): Promise<void> {
  const portables = buildAllOrAbort();

  await mkdir(outDir, { recursive: true });

  const manifestPath = path.join(outDir, "manifest.json");
  const previouslyPublished = await previouslyPublishedFiles(manifestPath);

  const manifestEntries = await Promise.all(
    portables.map(async (portable): Promise<PortableManifestEntry> => {
      const fileName = `${portable.campaign.id}.json`;
      await writeFile(
        path.join(outDir, fileName),
        `${JSON.stringify(portable, null, 2)}\n`,
        "utf8",
      );
      console.log(
        `Wrote ${fileName} (${Object.keys(portable.strings).length} strings)`,
      );
      return {
        file: fileName,
        id: portable.campaign.id,
        version: portable.campaign.version,
        digest: digestPortableCampaign(portable),
      };
    }),
  );

  const manifest = {
    formatVersion: 2 as const,
    campaigns: manifestEntries,
    resolution: digestManifestResolution(manifestEntries),
  };
  await writeFile(
    manifestPath,
    `${JSON.stringify(manifest, null, 2)}\n`,
    "utf8",
  );
  console.log(`Wrote manifest.json (${manifestEntries.length} campaigns)`);

  const stillPublished = new Set(manifestEntries.map((entry) => entry.file));
  for (const file of previouslyPublished) {
    if (stillPublished.has(file)) continue;
    await rm(path.join(outDir, file), { force: true });
    console.log(`Removed ${file} -- no longer exported`);
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});

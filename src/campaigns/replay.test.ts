/**
 * Replays the three committed Bureaucracy fixtures against this repository's expanded
 * Bulgaria campaign — the stop condition the in-place `2.0.0` republish depends on: the
 * pre-expansion action logs must still produce the pre-expansion `Outcome` byte for byte,
 * even though the campaign now has 75 endings instead of 29.
 *
 * Fixtures were captured against GameEngine's pre-expansion Bureaucracy campaign
 * (`fixtures/replay/bureaucracy-*.json`) and carried over unchanged when publication moved
 * here — regenerating them would defeat the point of the check.
 */

import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  createCountingIds,
  createEngine,
  createInMemoryProfileStore,
  buildValidatedContentRegistry,
  storyGraphKind,
  type KindRegistry,
} from "@the-running-dev/game-engine";
import {
  runReplayFixture,
  type ReplayFixture,
  type ReplayRunnerContext,
  type Outcome,
} from "@the-running-dev/game-engine/authoring";
import { buildBulgariaBureaucracyCampaign } from "./bulgaria-bureaucracy.js";

const FIXTURES_DIR = fileURLToPath(
  new URL("../../fixtures/replay/", import.meta.url),
);

function loadFixture(name: string): ReplayFixture {
  return JSON.parse(
    readFileSync(`${FIXTURES_DIR}${name}.fixture.json`, "utf8"),
  ) as ReplayFixture;
}

function loadExpectedOutcome(name: string): Outcome {
  return JSON.parse(
    readFileSync(`${FIXTURES_DIR}${name}.outcome.json`, "utf8"),
  ) as Outcome;
}

const FIXTURE_NAMES = readdirSync(FIXTURES_DIR)
  .filter((f) => f.endsWith(".fixture.json"))
  .map((f) => f.slice(0, -".fixture.json".length))
  .sort();

function makeContext(): ReplayRunnerContext {
  const built = buildBulgariaBureaucracyCampaign();
  if (!built.ok || !built.value)
    throw new Error("expected the real campaign to build");
  const kinds = { "story-graph": storyGraphKind } as unknown as KindRegistry;
  const registryResult = buildValidatedContentRegistry([built.value], kinds);
  if (!registryResult.ok || !registryResult.value)
    throw new Error("expected the real campaign to validate");

  return {
    engine: createEngine({
      kinds,
      registry: registryResult.value,
      ids: createCountingIds(),
    }),
    kinds,
    registry: registryResult.value,
    profiles: createInMemoryProfileStore(),
    profileId: "replay-oracle-profile",
  };
}

describe("bureaucracy replay corpus (against the published campaign)", () => {
  it("the corpus is non-empty", () => {
    expect(FIXTURE_NAMES.length).toBeGreaterThan(0);
  });

  it.for(FIXTURE_NAMES)("%s: matches its committed Outcome", async (name) => {
    const fixture = loadFixture(name);
    const expected = loadExpectedOutcome(name);
    const verdict = await runReplayFixture(makeContext(), fixture, expected);
    expect(verdict).toEqual({ kind: "match" });
  });
});

/**
 * Proves the claim `bulgaria-bureaucracy.bg.ts`'s own header makes: the English and
 * Bulgarian sources share the same campaign id, namespace, and node/route/ending ids, so
 * `buildStoryGraphCampaign` produces byte-identical `content` from either — only `strings`
 * differs. Without this test the Bulgarian source was authored, exported, and never checked.
 */

import { describe, expect, it } from "vitest";
import {
  buildValidatedContentRegistry,
  storyGraphKind,
  type KindRegistry,
} from "@the-running-dev/game-engine";
import {
  buildBulgariaBureaucracyCampaign,
  BULGARIA_BUREAUCRACY_CAMPAIGN_ID,
} from "./bulgaria-bureaucracy.js";
import { buildBulgariaBureaucracyCampaignBG } from "./bulgaria-bureaucracy.bg.js";

describe("bulgaria-bureaucracy — English/Bulgarian locale parity", () => {
  it("both locales build, share identical content, and differ only in strings", () => {
    const en = buildBulgariaBureaucracyCampaign();
    const bg = buildBulgariaBureaucracyCampaignBG();
    if (!en.ok || !en.value)
      throw new Error("expected the English campaign to build");
    if (!bg.ok || !bg.value)
      throw new Error("expected the Bulgarian campaign to build");

    expect(bg.value.campaign.id).toBe(en.value.campaign.id);
    expect(bg.value.campaign.content).toEqual(en.value.campaign.content);
    expect(bg.value.strings).not.toEqual(en.value.strings);
    expect(new Set(bg.value.strings.keys())).toEqual(
      new Set(en.value.strings.keys()),
    );

    const kinds = { "story-graph": storyGraphKind } as unknown as KindRegistry;
    const registryResult = buildValidatedContentRegistry([bg.value], kinds);
    expect(registryResult.ok).toBe(true);
    expect(
      registryResult.value?.campaigns.get(BULGARIA_BUREAUCRACY_CAMPAIGN_ID),
    ).toBeDefined();
  });
});

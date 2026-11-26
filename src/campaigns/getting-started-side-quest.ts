/**
 * The Getting Started side quest: a hidden module campaign the manifest attaches to
 * `getting-started` (engine 0.15.0, S141 — a campaign publishes its attachments). Ported from
 * SubZeroDev.Adventures' `public/campaigns/getting-started-extension.json`, which Adventures
 * grafted on at runtime through its own `src/play/composition.ts`. The engine now owns that
 * mechanism, so the graft ships as published content instead: this module, plus one
 * `attachments` entry in `manifest.json` that adds the "—wait, what was that?" choice to the
 * host's `content_composition_intro` node. `getting-started.ts` itself does not change.
 *
 * One shape change from the source. The extension's last node offered "Back to it." straight
 * into the host's `campaign_shapes`; a module cannot name a host node, so that choice now
 * reaches the `back` ending, and the attachment's binding maps `back` to `campaign_shapes`.
 * An ending inside a module composes into a pass-through, so its text is never rendered and
 * the player sees the same three beats the extension had.
 */
import type {
  AchievementDefinitionSource,
  AuthoredText,
  BuiltCampaign,
  Campaign,
  CommandResult,
  PortableCampaignAttachment,
  PortableCatalog,
  StoryGraphCampaignSource,
} from "@the-running-dev/game-engine/authoring";
import {
  buildCampaign,
  buildStoryGraphCampaign,
} from "@the-running-dev/game-engine/authoring";
import { createStoryGraphHelpers } from "./_shared/story-graph-helpers.js";
import { GETTING_STARTED_CAMPAIGN_ID } from "./getting-started.js";

export const GETTING_STARTED_SIDE_QUEST_CAMPAIGN_ID =
  "getting-started-side-quest";
const VERSION = "1.0.0";

/** Hidden: a module is reached through its attachment, never picked from a catalog. */
export const gettingStartedSideQuestCatalog: PortableCatalog = {
  title: "Getting Started: Side Quest",
  description:
    "A completely unnecessary mini-path, attached to Getting Started to prove content composition works.",
  duration: "~30 seconds",
  contentNotice: "Self-aware nonsense. No real danger.",
  featured: false,
  hidden: true,
};

const { text, opt, nodes, pick, visited } = createStoryGraphHelpers("gssq");

pick(
  "side_quest_landing",
  "SIDE QUEST DETECTED.\n\n" +
    "A completely unnecessary mini-path has appeared. It exists only to prove that content composition works — this entire node, and the choice that got you here, live in a separate file that was grafted onto the campaign you're playing. Nothing about the original file changed.",
  [opt("side_quest_landing", "proceed", "Proceed anyway.", "side_quest_end")],
);

pick("side_quest_end", "Anyway, where were we?", [
  opt("side_quest_end", "continue", "Back to it.", "side_quest_exit"),
]);

nodes["side_quest_exit"] = {
  kind: "ending",
  text: text("side_quest_exit", "text", "Back to the orientation."),
  endingId: "back",
  outcome: "neutral",
};

const achievements: AchievementDefinitionSource[] = [
  {
    id: "off_the_beaten_graph",
    name: text(
      "achievement_off_the_beaten_graph",
      "name",
      "Off The Beaten Graph",
    ),
    description: text(
      "achievement_off_the_beaten_graph",
      "description",
      "Wandered into content that wasn't even supposed to be here. That's the platform working as intended.",
    ),
    hidden: true,
    condition: visited("side_quest_landing"),
  },
];

const TITLE: AuthoredText = {
  key: "gssq.campaign.title",
  text: "Getting Started: Side Quest",
};

/** The attached choice's label. It lives in this module's strings because the host does not
 *  know it exists — that is the point of the attachment. */
const ATTACHED_LABEL: AuthoredText = {
  key: "gssq.attach.what_was_that",
  text: "—wait, what was that?",
};

export const gettingStartedSideQuestSource: StoryGraphCampaignSource = {
  description: {
    key: "gssq.campaign.description",
    text: "A completely unnecessary mini-path that proves content composition works.",
  },
  variables: {},
  startNodeId: "side_quest_landing",
  nodes,
  achievements,
  module: { inputs: [], outputs: [] },
};

export function buildGettingStartedSideQuestCampaign(
  source: StoryGraphCampaignSource = gettingStartedSideQuestSource,
): CommandResult<BuiltCampaign> {
  const { content, authoredText } = buildStoryGraphCampaign(source);
  const campaign: Campaign = {
    id: GETTING_STARTED_SIDE_QUEST_CAMPAIGN_ID,
    kindId: "story-graph",
    version: VERSION,
    titleKey: TITLE.key,
    content,
  };
  return buildCampaign(campaign, [TITLE, ATTACHED_LABEL, ...authoredText]);
}

/** Published on the manifest. Every host it reaches is stamped `<version>+att.<h12>` at
 *  registry build, so a session on the composed campaign can never be mistaken for one on
 *  the bare host. */
export const gettingStartedSideQuestAttachment: PortableCampaignAttachment = {
  kindId: "story-graph",
  hostCampaignId: GETTING_STARTED_CAMPAIGN_ID,
  include: {
    alias: "side_quest",
    ref: { id: GETTING_STARTED_SIDE_QUEST_CAMPAIGN_ID, version: VERSION },
    binding: { exits: { back: "campaign_shapes" } },
  },
  payload: {
    hostNodeId: "content_composition_intro",
    choice: { id: "what_was_that", labelKey: ATTACHED_LABEL.key },
  },
};

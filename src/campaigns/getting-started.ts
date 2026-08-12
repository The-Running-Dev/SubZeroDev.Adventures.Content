/**
 * Getting Started: an interactive orientation that explains Adventures by making you play
 * it. Ported from SubZeroDev.Adventures' `public/campaigns/getting-started.json`
 * (hand-authored formatVersion 2 JSON, no TypeScript source existed there) into this
 * repo's `StoryGraphCampaignSource` authoring surface via `_shared/story-graph-helpers.ts`,
 * following `bulgarian-adventures.ts`'s precedent for direct authoring.
 *
 * The closing node's original text also claimed "a small unauthorized side quest" —
 * `getting-started-extension.json` in the source repo, grafted on at runtime by
 * Adventures' own `src/play/composition.ts` composition layer. That composition mechanism
 * has no counterpart in `@the-running-dev/game-engine/authoring` or `contracts/` here, so
 * it isn't ported; the line was dropped rather than shipped as a dangling reference to
 * content this campaign no longer contains.
 */
import type {
  AchievementDefinitionSource,
  AuthoredText,
  BuiltCampaign,
  Campaign,
} from "@the-running-dev/game-engine/authoring";
import type { CommandResult } from "@the-running-dev/game-engine/authoring";
import { buildCampaign } from "@the-running-dev/game-engine/authoring";
import {
  buildStoryGraphCampaign,
  type StoryGraphCampaignSource,
} from "@the-running-dev/game-engine/authoring";
import type { PortableCatalog } from "@the-running-dev/game-engine/authoring";
import { createStoryGraphHelpers } from "./_shared/story-graph-helpers.js";

export const GETTING_STARTED_CAMPAIGN_ID = "getting-started";

export const gettingStartedCatalog: PortableCatalog = {
  title: "Getting Started: What The Fuck Is This?",
  description:
    "An interactive orientation that explains Adventures by making you play it. Skipping is a valid choice. So is not skipping.",
  duration: "~4 min (or ~4 seconds if you skip)",
  contentNotice: "Self-aware nonsense. Occasional profanity. No real danger.",
  featured: false,
  hidden: true,
};

const { text, put, opt, nodes, pick, say, visited } =
  createStoryGraphHelpers("gs");

pick(
  "start",
  "Welcome to SubZeroDev.Adventures.\n\nThis probably requires an explanation.",
  [
    opt("start", "explain", "What the fuck is this?", "explain_engine", {
      effects: [put("started", true)],
    }),
    opt("start", "skip", "Skip Intro...", "skip_ending"),
  ],
);

pick(
  "explain_engine",
  "Adventures is a small platform for playing — and building — interactive stories called campaigns.\n\n" +
    "A campaign is a graph: nodes with text, choices that branch, state that persists across choices, and achievements that fire when you do something notable. No account required to read it.\n\n" +
    "This conversation? Also a campaign. We are using the platform to explain the platform.",
  [
    opt("explain_engine", "continue", "Keep going.", "branching_demo"),
    opt("explain_engine", "skip", "Skip Intro...", "skip_ending"),
  ],
);

pick(
  "branching_demo",
  "The engine lets a story branch based on what you pick. Here's a branch. It doesn't matter which way you go.",
  [
    opt(
      "branching_demo",
      "powerful",
      "This sounds incredibly powerful.",
      "branch_converge",
      { effects: [put("first_take", "powerful")] },
    ),
    opt(
      "branching_demo",
      "complicated",
      "This sounds unnecessarily complicated.",
      "branch_converge",
      { effects: [put("first_take", "complicated")] },
    ),
    opt("branching_demo", "skip", "Skip Intro...", "skip_ending"),
  ],
);

pick(
  "branch_converge",
  "Both lead here.\n\nSee? Choices.\n\n" +
    "(You said this sounds {first_take}. We'll remember that — state persists across the whole run, not just the one choice you made it in.)",
  [
    opt("branch_converge", "continue", "Continue.", "node_kinds"),
    opt("branch_converge", "skip", "Skip Intro...", "skip_ending"),
  ],
);

say(
  "node_kinds",
  "(unshown — a bare `auto` pass-through node; see achievements_intro's opening line)",
  "achievements_intro",
);

pick(
  "achievements_intro",
  "Getting to this line took one extra step you didn't click anything for — a node with no choices, that just forwards you to the next one. If you didn't notice, that's correct. That's what those are for.\n\n" +
    "Speaking of things that happen without a form to fill out: the engine also tracks achievements — unlocked mid-story, the moment some condition becomes true, whether or not anyone announces it.\n\n" +
    "For example. You're satisfying one right now.",
  [
    opt(
      "achievements_intro",
      "what",
      "Wait, what did I just unlock?",
      "achievements_explained",
    ),
    opt("achievements_intro", "skip", "Skip Intro...", "skip_ending"),
  ],
);

pick(
  "achievements_explained",
  "Achievement Unlocked: Achievement Unlocked.\n\n" +
    "You learned that achievements exist by receiving an achievement for learning that achievements exist.",
  [
    opt(
      "achievements_explained",
      "continue",
      "Neat.",
      "content_composition_intro",
    ),
    opt("achievements_explained", "skip", "Skip Intro...", "skip_ending"),
  ],
);

pick(
  "content_composition_intro",
  "Not every campaign is a sealed island, either. Content can be composed — extra nodes and choices, injected onto an existing graph from a separate file, without anyone touching the original.\n\n" +
    "Campaigns aren't necessarily isolated. Other content can—",
  [
    opt(
      "content_composition_intro",
      "shrug",
      "—sure. Moving on.",
      "campaign_shapes",
    ),
    opt("content_composition_intro", "skip", "Skip Intro...", "skip_ending"),
  ],
);

pick(
  "campaign_shapes",
  "Here's the part people miss: a campaign isn't just \"choose your own adventure.\" It's a decision graph with content, state, branching, persistence, and achievements. That shape can hold a comedy. It can also hold a game, a how-to guide, a troubleshooting flow, an internal runbook, onboarding for literally anything, or family tech support.",
  [
    opt(
      "campaign_shapes",
      "example",
      "Show me the family tech support one.",
      "tv_support_2",
    ),
    opt("campaign_shapes", "skip", "Skip Intro...", "skip_ending"),
  ],
);

pick(
  "tv_support_2",
  'Case file: "My television doesn\'t work."\n\nIs it turned on?',
  [
    opt("tv_support_2", "yes", "Yes.", "tv_support_3"),
    opt("tv_support_2", "no", "No.", "tv_support_4"),
  ],
);

pick("tv_support_3", "Does it say NO SIGNAL?", [
  opt("tv_support_3", "yes", "Yes.", "tv_support_5"),
  opt("tv_support_3", "no", "No.", "tv_support_6"),
]);

pick("tv_support_4", "Turn it on.", [
  opt("tv_support_4", "continue", "...Oh.", "tv_support_end_ok"),
]);

pick(
  "tv_support_5",
  "Check the input source. It's HDMI 2. It's always HDMI 2.",
  [opt("tv_support_5", "continue", "Continue.", "tv_support_end_ok")],
);

pick(
  "tv_support_6",
  "Unplug it, count to ten, plug it back in. This resolves sixty percent of problems, one hundred percent of the time.",
  [opt("tv_support_6", "continue", "Continue.", "tv_support_end_maybe")],
);

pick(
  "tv_support_end_ok",
  "That's the whole runbook. It's not funnier than your actual runbooks. That's kind of the point.",
  [
    opt(
      "tv_support_end_ok",
      "continue",
      "Good. Continue.",
      "self_hosting_intro",
    ),
    opt("tv_support_end_ok", "skip", "Skip Intro...", "skip_ending"),
  ],
);

pick("tv_support_end_maybe", "Nothing worked.", [
  opt("tv_support_end_maybe", "call_ben", "Call Ben.", "escalation_ending"),
  opt(
    "tv_support_end_maybe",
    "continue",
    "Give up gracefully and continue.",
    "self_hosting_intro",
  ),
]);

nodes.escalation_ending = {
  kind: "ending",
  text: text(
    "escalation_ending",
    "text",
    "Ben does not pick up.\n\nThe graph has exhausted its usefulness. So has Ben.",
  ),
  endingId: "escalation",
  outcome: "neutral",
};

pick(
  "self_hosting_intro",
  "Longer term, campaigns won't only be ours. The plan is for you to author your own graphs and decide how they're exposed — public, private, shared by a link, or fully self-hosted. Some of that exists today. Some of it doesn't yet. We're telling you which is which instead of pretending otherwise.",
  [
    opt("self_hosting_intro", "continue", "Noted.", "closing"),
    opt("self_hosting_intro", "skip", "Skip Intro...", "skip_ending"),
  ],
);

pick(
  "closing",
  "That's Adventures: a graph engine wearing a trenchcoat.\n\n" +
    "In the last few minutes you've used branching, persistent state, an achievement, and a node kind nobody named out loud. There's nothing left to explain. Only things left to play.",
  [opt("closing", "finish", "See the shelf.", "complete_ending")],
);

nodes.complete_ending = {
  kind: "ending",
  text: text(
    "complete_ending",
    "text",
    "Tutorial complete.\n\nAchievement unlocked: Actually Reads the Manual. We genuinely did not expect anyone to get this far.\n\nGo pick a real one.",
  ),
  endingId: "complete",
  outcome: "win",
};

nodes.skip_ending = {
  kind: "ending",
  text: text(
    "skip_ending",
    "text",
    "Skipped.\n\nNo judgment. Well — a little.",
  ),
  endingId: "skip",
  outcome: "neutral",
};

const achievements: AchievementDefinitionSource[] = [
  {
    id: "never_reads_manual",
    name: text("achievement_never", "name", "Never Reads the Manual"),
    description: text(
      "achievement_never",
      "description",
      "Skipped the tutorial. You'll figure it out. Probably.",
    ),
    hidden: false,
    condition: {
      all: [
        { field: "ending", operator: "equals", value: "skip" },
        { field: "var.started", operator: "equals", value: false },
      ],
    },
  },
  {
    id: "tried_reading_manual",
    name: text("achievement_tried", "name", "Tried Reading the Manual"),
    description: text(
      "achievement_tried",
      "description",
      "You made an effort. That's more concerning, actually.",
    ),
    hidden: false,
    condition: {
      all: [
        { field: "ending", operator: "equals", value: "skip" },
        { field: "var.started", operator: "equals", value: true },
      ],
    },
  },
  {
    id: "actually_reads_manual",
    name: text("achievement_actually", "name", "Actually Reads the Manual"),
    description: text(
      "achievement_actually",
      "description",
      "We genuinely did not expect anyone to get this far.",
    ),
    hidden: false,
    condition: { field: "ending", operator: "equals", value: "complete" },
  },
  {
    id: "achievement_unlocked",
    name: text(
      "achievement_meta",
      "name",
      "Achievement Unlocked: Achievement Unlocked",
    ),
    description: text(
      "achievement_meta",
      "description",
      "You learned that achievements exist by receiving an achievement for learning that achievements exist.",
    ),
    hidden: false,
    condition: visited("achievements_explained"),
  },
  {
    id: "the_escalation_path",
    name: text("achievement_escalation", "name", "The Escalation Path"),
    description: text(
      "achievement_escalation",
      "description",
      "The graph has exhausted its usefulness. So has Ben.",
    ),
    hidden: true,
    condition: { field: "ending", operator: "equals", value: "escalation" },
  },
];

// ---------------------------------------------------------------------------

const TITLE: AuthoredText = {
  key: "gs.campaign.title",
  text: "Getting Started",
};

export const gettingStartedSource: StoryGraphCampaignSource = {
  description: {
    key: "gs.campaign.description",
    text: "An interactive orientation. It explains Adventures by making you use Adventures. Skipping is a valid choice. So is not skipping.",
  },
  variables: {
    started: { type: "bool", initial: false },
    first_take: {
      type: "enum",
      initial: "powerful",
      values: ["powerful", "complicated"],
      visible: true,
      label: text("var_first_take", "label", "First take"),
    },
  },
  startNodeId: "start",
  nodes,
  achievements,
};

export function buildGettingStartedCampaign(
  source: StoryGraphCampaignSource = gettingStartedSource,
): CommandResult<BuiltCampaign> {
  const { content, authoredText } = buildStoryGraphCampaign(source);
  const campaign: Campaign = {
    id: GETTING_STARTED_CAMPAIGN_ID,
    kindId: "story-graph",
    version: "1.0.0",
    titleKey: TITLE.key,
    content,
  };
  return buildCampaign(campaign, [TITLE, ...authoredText]);
}

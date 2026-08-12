/**
 * Bulgarian Adventures: Everything Is Fine.
 *
 * One day, five errands, five endings. Authored directly against
 * `StoryGraphCampaignSource` rather than through `adventure-builder.ts`: the builder
 * produces W64's fixed three-route shape, and this arc is a linear five-act spine with
 * per-act branches that reconverge, two random forks, and gates that read state carried
 * across act boundaries. `saki-quest-for-redemption.ts` sets the precedent.
 *
 * Not part of the `bulgaria-*` family despite the subject: those five share a route
 * structure and a 75-reachable-endings assertion in `campaigns.test.ts`, and the prefix is
 * how that test selects them. This campaign is deliberately named outside it.
 *
 * Note on the two displayed-but-inert variables: `patience` and `rakia` are `visible` and
 * nothing gates on either. That is the authored intent — they are the day's cost, readable
 * but not spendable — not a gate someone forgot to wire.
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

export const BULGARIAN_ADVENTURES_CAMPAIGN_ID = "bulgarian-adventures";

// The catalog card travels with the campaign, not a positional entry in
// site/src/play/composition.ts.
export const bulgarianAdventuresCatalog: PortableCatalog = {
  title: "Bulgarian Adventures: Everything Is Fine",
  description:
    "Survive one completely ordinary Bulgarian day involving parking sovereignty, courier physics, a legendary майстор, village intelligence, and one final document.",
  duration: "15–25 min",
  contentNotice:
    "Satire about everyday bureaucracy, driving, neighbours, tradespeople, family logistics, and the national ability to solve impossible problems unofficially.",
  featured: true,
};

const { text, inc, dec, put, atLeast, flag, opt, nodes, pick, fork, finish } =
  createStoryGraphHelpers("bgadv");

// ---------------------------------------------------------------------------
// Prologue
// ---------------------------------------------------------------------------

pick(
  "prologue",
  "BULGARIAN ADVENTURES: EVERYTHING IS FINE\n\n" +
    "It is 08:07. Your objectives are modest: park the car, receive a parcel, let a майстор fix one pipe, visit the village, and submit one document before the municipality closes.\n\n" +
    "The municipality closes at 17:00, except when it does not. You have brought optimism, which was your first mistake.",
  [
    opt(
      "prologue",
      "begin_optimistic",
      "Begin with confidence. Surely five errands are possible in one day",
      "parking",
      { effects: [inc("patience")] },
    ),
    opt(
      "prologue",
      "begin_prepared",
      "Bring a folder of documents and the sacred blue pen",
      "parking",
      { effects: [inc("documents"), put("has_blue_pen", true)] },
    ),
    opt(
      "prologue",
      "begin_local",
      "Call one person who knows one person before anything has happened",
      "parking",
      { effects: [inc("connections")] },
    ),
  ],
);

// ---------------------------------------------------------------------------
// Act I — The chair of sovereignty
// ---------------------------------------------------------------------------

pick(
  "parking",
  "ACT I — THE CHAIR OF SOVEREIGNTY\n\n" +
    "You find the last open parking space. It is occupied by a plastic chair. The chair has no licence plate, no owner, and considerably more territorial authority than your car.\n\n" +
    "Three balconies are watching.",
  [
    opt(
      "parking",
      "respect_chair",
      "Respect the chair as a legitimate municipal institution",
      "parking_result_good",
      { effects: [put("chair_respected", true), inc("connections")] },
    ),
    opt(
      "parking",
      "move_chair",
      "Move the chair. It is a chair",
      "parking_council",
      {
        effects: [dec("patience"), inc("absurdity", 2)],
      },
    ),
    opt(
      "parking",
      "ask_whose_chair",
      "Ask whose chair it is",
      "parking_witnesses",
      {
        effects: [inc("absurdity")],
      },
    ),
  ],
);

pick(
  "parking_council",
  "Before the chair touches the pavement, a man appears from a shop that was visibly closed. He explains that his cousin will be back in five minutes. A woman from the second floor says the cousin has been in Germany since 2019. Neither statement weakens the claim.",
  [
    opt(
      "parking_council",
      "cite_law",
      "Explain public-road parking law to the assembled constitutional court",
      "parking_result_bad",
      { effects: [inc("absurdity", 2)] },
    ),
    opt(
      "parking_council",
      "apologize_to_chair",
      "Return the chair and apologize for the diplomatic incident",
      "parking_result_good",
      { effects: [put("chair_respected", true), inc("connections")] },
    ),
  ],
);

fork(
  "parking_witnesses",
  "The balconies confer. Bulgarian oral law enters deliberation.",
  [
    { weight: 1, effects: [inc("connections")], goto: "parking_result_good" },
    { weight: 1, effects: [inc("absurdity", 2)], goto: "parking_result_bad" },
  ],
);

pick(
  "parking_result_good",
  "The chair's custodian approves your restraint and reveals a legal space behind the pharmacy. You have not parked faster, but you have acquired a person who knows a person.",
  [
    opt(
      "parking_result_good",
      "to_courier_good",
      "Continue with your completely ordinary day",
      "courier",
    ),
  ],
);

pick(
  "parking_result_bad",
  "You park successfully. Nobody blocks you in. This is much worse: they leave exactly eleven centimetres at each bumper, proving both intent and technical competence.",
  [
    opt(
      "parking_result_bad",
      "to_courier_bad",
      "Continue with your completely ordinary day",
      "courier",
    ),
  ],
);

// ---------------------------------------------------------------------------
// Act II — The quantum courier
// ---------------------------------------------------------------------------

pick(
  "courier",
  "ACT II — THE QUANTUM COURIER\n\n" +
    "Your phone rings. The courier says, ‘I am outside.’ You are outside. He is not.\n\n" +
    "In Bulgaria, ‘outside’ is not a location. It is the beginning of negotiations.",
  [
    opt(
      "courier",
      "say_location",
      "State your exact address, which is printed on his screen",
      "courier_quantum",
      { effects: [dec("patience")] },
    ),
    opt(
      "courier",
      "run_outside",
      "Run around the building looking for a white van",
      "courier_street",
      { effects: [inc("absurdity")] },
    ),
    opt("courier", "ask_landmark", "Ask what he can see", "courier_landmark", {
      effects: [inc("connections")],
    }),
  ],
);

pick(
  "courier_quantum",
  "You repeat the address. He repeats ‘I am outside,’ now with the wounded patience of a man forced to explain geography to its inventor. A dog barks through the phone from somewhere that is definitely not your street.",
  [
    opt(
      "courier_quantum",
      "accept_quantum",
      "Accept that both of you are outside in different realities",
      "courier_result",
      { effects: [put("courier_found", true)] },
    ),
    opt(
      "courier_quantum",
      "request_office",
      "Redirect the parcel to an office and request documentary proof of surrender",
      "courier_result",
      { effects: [inc("documents")] },
    ),
  ],
);

fork(
  "courier_street",
  "You locate three white vans. One sells bread, one contains plumbing equipment, and one leaves exactly as you approach. The universe chooses which one mattered.",
  [
    {
      weight: 1,
      effects: [put("courier_found", true)],
      goto: "courier_result",
    },
    { weight: 1, effects: [inc("absurdity", 2)], goto: "courier_result" },
  ],
);

pick(
  "courier_landmark",
  "He can see the old shop. You ask which old shop. He says, ‘The old one.’ This is immediately understood by a passing pensioner, who points two streets east without slowing down.",
  [
    opt(
      "courier_landmark",
      "decode_landmark",
      "Trust the national landmark protocol",
      "courier_result",
      { effects: [put("courier_found", true), inc("connections")] },
    ),
  ],
);

pick(
  "courier_result",
  "The parcel is finally transferred. The courier asks for exact change, produces exact change when you do not have it, and leaves before causality can inspect the transaction.",
  [
    opt(
      "courier_result",
      "open_package",
      "Open the parcel immediately",
      "master",
    ),
    opt(
      "courier_result",
      "preserve_package",
      "Keep every label and receipt in case the parcel later denies existing",
      "master",
      { effects: [inc("documents")] },
    ),
  ],
);

// ---------------------------------------------------------------------------
// Act III — The immortal майстор
// ---------------------------------------------------------------------------

pick(
  "master",
  "ACT III — THE IMMORTAL МАЙСТОР\n\n" +
    "The parcel contains the valve your майстор said was impossible to find. The leaking pipe has been waiting for him since ‘Monday.’ No date was attached to Monday.\n\n" +
    "You call. He answers with, ‘I was just about to call you.’",
  [
    opt("master", "call_master", "Ask when he is coming", "master_time", {
      effects: [dec("patience")],
    }),
    opt(
      "master",
      "call_friend",
      "Call the friend of the person you now know",
      "master_arrival",
      {
        requirements: atLeast("connections", 2),
        requirementFail:
          "You do not yet know enough people who know people. This is not a skills problem. It is an infrastructure problem.",
        effects: [inc("connections")],
      },
    ),
    opt(
      "master",
      "watch_video",
      "Watch a nine-minute repair video and become temporarily licensed",
      "master_diy",
      { effects: [inc("absurdity", 2)] },
    ),
  ],
);

pick(
  "master_time",
  "He says Monday. You point out that today is Monday. He pauses, not because he is confused, but because you have introduced an irrelevant level of precision.",
  [
    opt(
      "master_time",
      "ask_which_monday",
      "Ask which Monday",
      "master_arrival",
      {
        effects: [inc("absurdity")],
      },
    ),
    opt(
      "master_time",
      "accept_monday",
      "Accept Monday as a philosophy rather than a date",
      "master_arrival",
    ),
  ],
);

fork(
  "master_diy",
  "The video says ‘simply remove the old fitting.’ The fitting has spent forty years becoming structurally and emotionally part of the building.",
  [
    { weight: 1, effects: [inc("documents")], goto: "master_result" },
    {
      weight: 1,
      effects: [dec("patience", 2), inc("absurdity", 2)],
      goto: "master_arrival",
    },
  ],
);

pick(
  "master_arrival",
  "The майстор arrives. This is statistically significant. He examines the valve, the pipe, the wall, and your decision to buy the valve yourself. The original price is no longer available because the problem has now been seen in person.",
  [
    opt(
      "master_arrival",
      "accept_new_price",
      "Accept the new price as the cost of witnessing a miracle",
      "master_result",
      { effects: [put("master_arrived", true), inc("connections")] },
    ),
    opt(
      "master_arrival",
      "mention_original_price",
      "Mention the original price and watch economics become folklore",
      "master_result",
      { effects: [inc("absurdity", 2), put("master_arrived", true)] },
    ),
  ],
);

pick(
  "master_result",
  "He fixes the leak in eleven minutes using your valve, two washers from his pocket, and a tool that appears handmade from former Yugoslavia. He tells you the entire installation is wrong. It will now outlive you.",
  [
    opt(
      "master_result",
      "to_village",
      "Continue with your completely ordinary day",
      "village",
    ),
  ],
);

// ---------------------------------------------------------------------------
// Act IV — The village API
// ---------------------------------------------------------------------------

pick(
  "village",
  "ACT IV — THE VILLAGE API\n\n" +
    "You arrive at the village. Before you close the gate, a neighbour asks whether the pipe is fixed, why the courier was late, and whether the man from the city is still angry about the chair.\n\n" +
    "You told none of this to anyone here.",
  [
    opt(
      "village",
      "deny_news",
      "Deny everything and attempt to preserve the concept of privacy",
      "baba_network",
      { effects: [inc("absurdity", 2)] },
    ),
    opt("village", "ask_source", "Ask how she knows", "baba_source", {
      effects: [inc("connections")],
    }),
    opt(
      "village",
      "offer_coffee",
      "Make coffee and request full access to the intelligence network",
      "baba_alliance",
      { effects: [put("baba_allied", true), inc("connections", 2)] },
    ),
  ],
);

pick(
  "baba_network",
  "By the time your denial reaches the next house, it has become confirmation, included a secret engagement, and acquired a German car. The network corrects for missing data by improving it.",
  [
    opt(
      "baba_network",
      "surrender_privacy",
      "Accept the terms of service",
      "village_feast",
      { effects: [put("baba_allied", true)] },
    ),
    opt(
      "baba_network",
      "issue_correction",
      "Issue a factual correction to the village internet",
      "village_feast",
      { effects: [inc("absurdity", 2)] },
    ),
  ],
);

pick(
  "baba_source",
  "She says her sister heard it from the pharmacist's daughter, whose husband saw your car near the courier office. You point out that you never went to the courier office. She nods. That explains why the courier was late.",
  [
    opt(
      "baba_source",
      "accept_source",
      "Accept the source as independently peer-reviewed",
      "village_feast",
      { effects: [put("baba_allied", true)] },
    ),
  ],
);

pick(
  "baba_alliance",
  "Coffee is served. Within six minutes you receive the mayor's schedule, the clerk's maiden name, the correct office number, two medical diagnoses, and a warning that the municipality has run out of blue pens.",
  [
    opt(
      "baba_alliance",
      "receive_intelligence",
      "Memorize the useful parts and abandon epistemology",
      "village_feast",
      { effects: [inc("documents")] },
    ),
  ],
);

pick(
  "village_feast",
  "You stand to leave. Food appears. Refusing food would imply illness, hostility, or foreign influence. A bottle without a label is placed beside your plate. Your host calls it ‘one rakia,’ a unit with no standardized upper bound.",
  [
    opt(
      "village_feast",
      "one_rakia",
      "Accept one rakia in the ordinary non-Euclidean sense",
      "municipality",
      { effects: [inc("rakia"), inc("patience")] },
    ),
    opt(
      "village_feast",
      "refuse_rakia",
      "Refuse politely and trigger a medical inquiry",
      "municipality",
      { effects: [inc("absurdity", 2)] },
    ),
    opt(
      "village_feast",
      "define_one",
      "Ask how large ‘one’ is",
      "municipality",
      {
        effects: [inc("rakia", 2), inc("connections")],
      },
    ),
  ],
);

// ---------------------------------------------------------------------------
// Act V — The final document
// ---------------------------------------------------------------------------

pick(
  "municipality",
  "ACT V — THE FINAL DOCUMENT\n\n" +
    "At 15:42 you reach the municipality. Room 12 requires one document to confirm a fact already visible in three government databases. A note on Room 12 says Room 12 has moved to Room 7. Room 7 says Room 12 has not moved.",
  [
    opt(
      "municipality",
      "present_folder",
      "Present the folder before anyone can invent another requirement",
      "clerk",
      {
        requirements: atLeast("documents", 2),
        requirementFail:
          "Your folder lacks the minimum density required to intimidate an institution.",
        effects: [inc("patience")],
      },
    ),
    opt(
      "municipality",
      "ask_which_document",
      "Ask which document is actually required",
      "clerk",
      { effects: [inc("absurdity", 2)] },
    ),
    opt(
      "municipality",
      "call_connection",
      "Call the person who knows the person",
      "clerk_connection",
      {
        requirements: atLeast("connections", 3),
        requirementFail:
          "Your social graph does not yet reach this department.",
        effects: [dec("connections")],
      },
    ),
  ],
);

pick(
  "clerk",
  "The clerk examines your documents and finds them correct. Silence follows. Then she notices the application is signed in black ink. The regulation does not require blue ink. The regulation is not in this room.",
  [
    opt(
      "clerk",
      "use_blue_pen",
      "Produce the blue pen you brought at 08:07",
      "final_counter",
      { showWhen: flag("has_blue_pen", true), effects: [inc("documents")] },
    ),
    opt(
      "clerk",
      "find_blue_pen",
      "Go find a blue pen before the office discovers lunch again",
      "pen_shop",
      { effects: [dec("patience"), inc("absurdity")] },
    ),
  ],
);

pick(
  "clerk_connection",
  "Your connection does not bypass the rules. That would be improper. Instead, a woman enters from the next room, applies the same rules in the correct order, and solves the problem in forty seconds.",
  [
    opt(
      "clerk_connection",
      "accept_help",
      "Accept this entirely procedural miracle",
      "final_counter",
      { effects: [inc("documents")] },
    ),
  ],
);

pick(
  "pen_shop",
  "The nearest shop sells pens, lottery tickets, coffee, phone cases, icons, batteries, and one tomato. The blue pens are behind the counter because apparently they are controlled equipment.",
  [
    opt(
      "pen_shop",
      "buy_pen",
      "Buy three blue pens so this cannot happen again",
      "final_counter",
      { effects: [put("has_blue_pen", true), inc("documents")] },
    ),
    opt(
      "pen_shop",
      "borrow_pen",
      "Borrow a pen from the next person in line and become temporary family",
      "final_counter",
      { effects: [inc("connections")] },
    ),
  ],
);

pick(
  "final_counter",
  "You return at 16:51. The form is blue. The copies are stamped. The clerk studies the complete file with the expression of someone whose final defensive perimeter has fallen.\n\n" +
    "There is still time for one last thing to be wrong.",
  [
    opt(
      "final_counter",
      "submit_normally",
      "Submit the document and permit fate one final move",
      "final_event",
      { effects: [dec("patience")] },
    ),
    opt(
      "final_counter",
      "deploy_baba",
      "Mention the clerk's aunt by name",
      "ending_local_protocol",
      { showWhen: flag("baba_allied", true), effects: [inc("connections", 2)] },
    ),
    opt(
      "final_counter",
      "declare_victory",
      "Declare that absurdity itself is now your supporting document",
      "ending_became_system",
      {
        requirements: atLeast("absurdity", 8),
        requirementFail:
          "You have not documented enough absurdity to establish standing.",
      },
    ),
  ],
);

fork("final_event", "The stamp rises. The universe rolls for jurisdiction.", [
  { weight: 2, goto: "ending_document_received" },
  { weight: 1, goto: "ending_lunch_break" },
  {
    weight: 1,
    effects: [inc("absurdity", 2)],
    goto: "ending_wrong_municipality",
  },
]);

// ---------------------------------------------------------------------------
// Endings
// ---------------------------------------------------------------------------

finish(
  "document_received",
  "document_received",
  "THE DOCUMENT",
  "The stamp lands. Your application is accepted. Nobody applauds because everyone in the room understands that attracting attention at this stage would be reckless.\n\n" +
    "You completed five errands in one Bulgarian day. This is not officially recognized as a national record, but only because the correct office is closed.",
  "win",
);

finish(
  "local_protocol",
  "local_protocol",
  "THE LOCAL PROTOCOL",
  "The clerk hears the aunt's name, asks how you know her, and discovers you ate banitsa in the same village fifteen years apart. The document is accepted through no corruption whatsoever—only an emergency restoration of social context.\n\n" +
    "You did not defeat the system. You authenticated through it.",
  "win",
);

finish(
  "became_system",
  "became_the_system",
  "YOU BECAME THE SYSTEM",
  "You place every receipt, rumour, parking grievance, courier coordinate, and blue-ink signature on the counter. The file has achieved bureaucratic mass. The clerk stamps it to prevent further growth.\n\n" +
    "Outside, somebody asks where Room 12 is. You point to Room 7 and say, ‘It depends.’",
  "neutral",
);

finish(
  "lunch_break",
  "lunch_break",
  "THE SECOND LUNCH",
  "At 16:53 the clerk announces a seven-minute technical break. At 17:00 the office closes. Your application remains perfectly complete on the wrong side of the glass.\n\n" +
    "Tomorrow, you will arrive at 07:30. A note will say the office opens at 09:00 due to summer hours.",
  "neutral",
);

finish(
  "wrong_municipality",
  "wrong_municipality",
  "THE WRONG MUNICIPALITY",
  "The stamp stops one centimetre above the paper. The clerk asks why you came here. Your address, she explains, belongs to the municipality next door. It did not yesterday. The boundary changed online this morning.\n\n" +
    "Every document is correct. You are simply correct in the wrong jurisdiction.",
  "loss",
);

// ---------------------------------------------------------------------------
// Achievements
//
// Declared inline rather than through the shared `achievement()` helper: that helper hard-
// codes `hidden: true`, and four of these six are meant to be visible in the catalog before
// they are earned. Only the two that would spoil a surprise are hidden.
// ---------------------------------------------------------------------------

const achievements: AchievementDefinitionSource[] = [
  {
    id: "chair_diplomat",
    name: text("achievement_chair_diplomat", "name", "Chairman of Diplomacy"),
    description: text(
      "achievement_chair_diplomat",
      "description",
      "Recognize a plastic chair as a sovereign parking authority.",
    ),
    hidden: false,
    condition: flag("chair_respected", true),
  },
  {
    id: "quantum_courier",
    name: text("achievement_quantum_courier", "name", "Observed the Courier"),
    description: text(
      "achievement_quantum_courier",
      "description",
      "Collapse the courier's location into a deliverable state.",
    ),
    hidden: false,
    condition: flag("courier_found", true),
  },
  {
    id: "the_master_came",
    name: text("achievement_the_master_came", "name", "Monday Has Arrived"),
    description: text(
      "achievement_the_master_came",
      "description",
      "Witness a майстор appear on a day that can legally be described as Monday.",
    ),
    hidden: true,
    condition: flag("master_arrived", true),
  },
  {
    id: "village_api",
    name: text("achievement_village_api", "name", "Village API Access"),
    description: text(
      "achievement_village_api",
      "description",
      "Authenticate with the oldest distributed intelligence network in Bulgaria.",
    ),
    hidden: false,
    condition: flag("baba_allied", true),
  },
  {
    id: "the_document",
    name: text("achievement_the_document", "name", "Five Errands, One Day"),
    description: text(
      "achievement_the_document",
      "description",
      "Obtain the final document before another requirement can spawn.",
    ),
    hidden: false,
    condition: {
      field: "ending",
      operator: "equals",
      value: "document_received",
    },
  },
  {
    id: "wrong_municipality",
    name: text(
      "achievement_wrong_municipality",
      "name",
      "Correct in the Wrong Place",
    ),
    description: text(
      "achievement_wrong_municipality",
      "description",
      "Bring every correct document to the newly incorrect municipality.",
    ),
    hidden: true,
    condition: {
      field: "ending",
      operator: "equals",
      value: "wrong_municipality",
    },
  },
];

// ---------------------------------------------------------------------------

const TITLE: AuthoredText = {
  key: "bgadv.campaign.title",
  text: "Bulgarian Adventures: Everything Is Fine",
};

export const bulgarianAdventuresSource: StoryGraphCampaignSource = {
  description: {
    key: "bgadv.campaign.description",
    text:
      "One ordinary day. Five minor tasks. A nation-sized escape room where every clue is " +
      "delivered verbally by somebody's aunt.",
  },
  variables: {
    patience: {
      type: "int",
      initial: 5,
      min: 0,
      max: 12,
      visible: true,
      label: text("var_patience", "label", "Patience Remaining"),
    },
    connections: {
      type: "int",
      initial: 0,
      min: 0,
      max: 12,
      visible: true,
      label: text("var_connections", "label", "People Who Know A Person"),
    },
    absurdity: {
      type: "int",
      initial: 0,
      min: 0,
      max: 20,
      visible: true,
      label: text("var_absurdity", "label", "Documented Absurdity"),
    },
    documents: {
      type: "int",
      initial: 0,
      min: 0,
      max: 8,
      visible: true,
      label: text("var_documents", "label", "Potentially Correct Documents"),
    },
    rakia: {
      type: "int",
      initial: 0,
      min: 0,
      max: 6,
      visible: true,
      label: text("var_rakia", "label", "One Rakia"),
    },
    chair_respected: { type: "bool", initial: false },
    courier_found: { type: "bool", initial: false },
    master_arrived: { type: "bool", initial: false },
    baba_allied: { type: "bool", initial: false },
    has_blue_pen: { type: "bool", initial: false },
  },
  startNodeId: "prologue",
  nodes,
  achievements,
};

export function buildBulgarianAdventuresCampaign(
  source: StoryGraphCampaignSource = bulgarianAdventuresSource,
): CommandResult<BuiltCampaign> {
  const { content, authoredText } = buildStoryGraphCampaign(source);
  const campaign: Campaign = {
    id: BULGARIAN_ADVENTURES_CAMPAIGN_ID,
    kindId: "story-graph",
    version: "1.0.0",
    titleKey: TITLE.key,
    content,
  };
  return buildCampaign(campaign, [TITLE, ...authoredText]);
}

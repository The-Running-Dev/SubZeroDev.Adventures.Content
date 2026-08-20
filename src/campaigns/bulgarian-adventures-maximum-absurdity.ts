/**
 * Bulgarian Adventures: Maximum Absurdity Cut.
 *
 * A sibling of `bulgarian-adventures.ts`, not a replacement — same five-errand day, a
 * distinct campaign id, its own narrative pass on every beat (more absurd, more nodes
 * folded together), and its own string table. Authored directly against the raw
 * `StoryGraphCampaignSource` shape (`text(key, value)` object literals) rather than through
 * `_shared/story-graph-helpers.ts`'s `pick`/`opt` combinators, because the source content
 * arrived as already-built portable JSON with its own key naming (e.g.
 * `bgadv.prologue.optimistic`, not the helpers' `bgadv.prologue.begin_optimistic`
 * derivation) — transcribing it through the helpers would have meant either renaming every
 * key or fighting the helpers' auto-derivation, both riskier than preserving the authored
 * keys verbatim. `what-would-lucifer-do-engineers-cut.ts` sets the sibling-campaign
 * precedent; this campaign reuses the `bgadv` key prefix, which is safe because each
 * campaign's `strings` table is independent.
 */
import type {
  AchievementDefinitionSource,
  AuthoredText,
  BuiltCampaign,
  Campaign,
  CommandResult,
  PortableCatalog,
  StoryGraphCampaignSource,
} from "@the-running-dev/game-engine/authoring";
import {
  buildCampaign,
  buildStoryGraphCampaign,
} from "@the-running-dev/game-engine/authoring";

export const BULGARIAN_ADVENTURES_MAXIMUM_ABSURDITY_CAMPAIGN_ID =
  "bulgarian-adventures-maximum-absurdity";

export const bulgarianAdventuresMaximumAbsurdityCatalog: PortableCatalog = {
  title: "Bulgarian Adventures: Everything Is Extremely Fine",
  description:
    "Survive one completely ordinary Bulgarian day involving a parking chair with diplomatic immunity, a courier trapped in a parallel dimension, a майстор who may be immortal, a village with better surveillance than a national intelligence agency, and one final document that has opinions about ink.",
  duration: "15–25 min",
  contentNotice:
    "Satire about everyday bureaucracy, driving, neighbours, tradespeople, family logistics, folk magic, and the national ability to solve impossible problems entirely off the books.",
  featured: true,
};

function text(key: string, value: string): AuthoredText {
  return { key, text: value };
}

const TITLE = text(
  "bgadv.campaign.title",
  "Bulgarian Adventures: Everything Is Extremely Fine",
);

const bulgarianAdventuresMaximumAbsurditySource: StoryGraphCampaignSource = {
  description: text(
    "bgadv.campaign.description",
    "One ordinary day. Five minor tasks. A nation-sized escape room where every clue is delivered verbally, at volume, by somebody's aunt who was not present for any of it.",
  ),
  variables: {
    patience: {
      type: "int",
      initial: 5,
      min: 0,
      max: 12,
      visible: true,
      label: text("bgadv.var.patience", "Patience Remaining (Theoretical)"),
    },
    connections: {
      type: "int",
      initial: 0,
      min: 0,
      max: 12,
      visible: true,
      label: text(
        "bgadv.var.connections",
        "People Who Know A Person Who Knows God",
      ),
    },
    absurdity: {
      type: "int",
      initial: 0,
      min: 0,
      max: 20,
      visible: true,
      label: text("bgadv.var.absurdity", "Documented Absurdity (Notarized)"),
    },
    documents: {
      type: "int",
      initial: 0,
      min: 0,
      max: 8,
      visible: true,
      label: text("bgadv.var.documents", "Potentially Correct Documents"),
    },
    rakia: {
      type: "int",
      initial: 0,
      min: 0,
      max: 6,
      visible: true,
      label: text("bgadv.var.rakia", "One Rakia (Undefined Unit)"),
    },
    chair_respected: {
      type: "bool",
      initial: false,
    },
    courier_found: {
      type: "bool",
      initial: false,
    },
    master_arrived: {
      type: "bool",
      initial: false,
    },
    baba_allied: {
      type: "bool",
      initial: false,
    },
    has_blue_pen: {
      type: "bool",
      initial: false,
    },
  },
  startNodeId: "prologue",
  nodes: {
    prologue: {
      kind: "choice",
      text: text(
        "bgadv.prologue.text",
        "BULGARIAN ADVENTURES: EVERYTHING IS EXTREMELY FINE\n\nIt is 08:07. The sun has not yet decided how hot it intends to be, which is also true of the municipal government. Your objectives are modest: park the car, receive a parcel from a courier who exists in a superposition of locations, let a майстор who has outlived three regimes fix one pipe, visit a village with a surveillance apparatus that would make several intelligence agencies request a meeting, and submit one document before the municipality closes.\n\nThe municipality closes at 17:00, except when it closes at 14:30 for a wedding nobody official was invited to. You have brought optimism, a Thermos, and a single blue pen wrapped in a sock for protection. This was, historically speaking, not enough.",
      ),
      choices: [
        {
          id: "begin_optimistic",
          label: text(
            "bgadv.prologue.optimistic",
            "Begin with confidence. Surely five errands, one country, and one immortal tradesman fit inside a single Tuesday",
          ),
          effects: [
            {
              op: "increment",
              var: "patience",
              by: 1,
            },
          ],
          goto: "parking",
        },
        {
          id: "begin_prepared",
          label: text(
            "bgadv.prologue.prepared",
            "Bring a folder of documents, a spare folder in case the first folder is deemed insufficiently thick, and the sacred blue pen",
          ),
          effects: [
            {
              op: "increment",
              var: "documents",
              by: 1,
            },
            {
              op: "set",
              var: "has_blue_pen",
              value: true,
            },
          ],
          goto: "parking",
        },
        {
          id: "begin_local",
          label: text(
            "bgadv.prologue.local",
            "Call one person who knows one person who allegedly knows the mayor's cousin's dentist, before anything has gone wrong, purely as a hedge",
          ),
          effects: [
            {
              op: "increment",
              var: "connections",
              by: 1,
            },
          ],
          goto: "parking",
        },
      ],
    },
    parking: {
      kind: "choice",
      text: text(
        "bgadv.parking.text",
        "ACT I — THE CHAIR OF ABSOLUTE SOVEREIGNTY\n\nYou find the last open parking space in the entire municipality, possibly the entire Balkan peninsula. It is occupied by a single plastic chair, weathered to the exact shade of ancestral authority. The chair has no licence plate, no owner, no visible legal standing, and considerably more territorial jurisdiction than your car, the traffic police, and arguably the constitution.\n\nThree balconies are watching. A fourth balcony has gone inside specifically to get a better vantage point. Somewhere, a dog has begun narrating your indecision to the street.",
      ),
      choices: [
        {
          id: "respect_chair",
          label: text(
            "bgadv.parking.respect",
            "Bow slightly and recognize the chair as a sovereign micro-state with full diplomatic immunity",
          ),
          effects: [
            {
              op: "set",
              var: "chair_respected",
              value: true,
            },
            {
              op: "increment",
              var: "connections",
              by: 1,
            },
          ],
          goto: "parking_result_good",
        },
        {
          id: "move_chair",
          label: text(
            "bgadv.parking.move",
            "Move the chair. It is, technically, still just a chair, a fact you will come to regret believing",
          ),
          effects: [
            {
              op: "decrement",
              var: "patience",
              by: 1,
            },
            {
              op: "increment",
              var: "absurdity",
              by: 2,
            },
          ],
          goto: "parking_council",
        },
        {
          id: "ask_whose_chair",
          label: text(
            "bgadv.parking.ask",
            "Ask whose chair it is, thereby triggering an oral inquiry that will outlast several governments",
          ),
          effects: [
            {
              op: "increment",
              var: "absurdity",
              by: 1,
            },
          ],
          goto: "parking_witnesses",
        },
      ],
    },
    parking_council: {
      kind: "choice",
      text: text(
        "bgadv.parking_council.text",
        "Before the chair's plastic feet have finished sliding across the asphalt, a man materializes from a shop that has been visibly, definitively, triple-padlocked closed since March. He explains, with the calm of prophecy, that his cousin will be back in five minutes to reclaim the space. A woman leans from the second floor to announce that this cousin has been living in Germany since 2019, has a German wife, and possibly a German dog. Neither statement is treated as weakening the original claim. If anything, the claim has gained institutional weight.",
      ),
      choices: [
        {
          id: "cite_law",
          label: text(
            "bgadv.parking_council.law",
            "Cite the specific municipal parking ordinance, chapter and verse, to the assembled balcony tribunal, who are unmoved because the ordinance is not oral",
          ),
          effects: [
            {
              op: "increment",
              var: "absurdity",
              by: 2,
            },
          ],
          goto: "parking_result_bad",
        },
        {
          id: "apologize_to_chair",
          label: text(
            "bgadv.parking_council.apologize",
            "Return the chair to its exact original coordinates, plus a small bow, and formally apologize for the international incident",
          ),
          effects: [
            {
              op: "set",
              var: "chair_respected",
              value: true,
            },
            {
              op: "increment",
              var: "connections",
              by: 1,
            },
          ],
          goto: "parking_result_good",
        },
      ],
    },
    parking_witnesses: {
      kind: "random",
      text: text(
        "bgadv.parking_witnesses.text",
        "The balconies confer amongst themselves in a dialect reserved entirely for property disputes. Somewhere a grandmother produces a folding chair of her own, purely to observe the proceedings in comfort. Bulgarian oral law enters formal deliberation, quorum achieved by shouting distance.",
      ),
      transitions: [
        {
          weight: 1,
          effects: [
            {
              op: "increment",
              var: "connections",
              by: 1,
            },
          ],
          goto: "parking_result_good",
        },
        {
          weight: 1,
          effects: [
            {
              op: "increment",
              var: "absurdity",
              by: 2,
            },
          ],
          goto: "parking_result_bad",
        },
      ],
    },
    parking_result_good: {
      kind: "choice",
      text: text(
        "bgadv.parking_result_good.text",
        "The chair's custodian, moved by your restraint, personally escorts you to a legal parking space behind the pharmacy that does not appear on any map, official or otherwise. You have not parked faster. You have, however, acquired a person who knows a person, three new nicknames, and an open invitation to a wedding you cannot identify the couple for.",
      ),
      choices: [
        {
          id: "to_courier_good",
          label: text(
            "bgadv.continue",
            "Continue with your completely ordinary day",
          ),
          goto: "courier",
        },
      ],
    },
    parking_result_bad: {
      kind: "choice",
      text: text(
        "bgadv.parking_result_bad.text",
        "You park successfully. Astonishingly, nobody blocks you in. This is, on reflection, much worse: the vehicles on either side leave exactly eleven centimetres of clearance at each bumper, a margin so precise it can only be read as both a threat and a compliment, executed by someone who did not need to look while doing it.",
      ),
      choices: [
        {
          id: "to_courier_bad",
          label: text(
            "bgadv.continue",
            "Continue with your completely ordinary day",
          ),
          goto: "courier",
        },
      ],
    },
    courier: {
      kind: "choice",
      text: text(
        "bgadv.courier.text",
        "ACT II — THE QUANTUM COURIER\n\nYour phone rings. The courier announces, with total conviction, ‘I am outside.’ You are, in fact, outside. He is not. You can see the entire street. There is no van, no motorcycle, no visible human matching the voice on the phone, and yet the call continues as though this were a minor and expected inconsistency.\n\nIn Bulgaria, ‘outside’ is not a location. It is a metaphysical claim, the opening move in a negotiation whose rules were established before either of you was born.",
      ),
      choices: [
        {
          id: "say_location",
          label: text(
            "bgadv.courier.location",
            "Read him your exact address, street number, and floor, all of which are already displayed, unread, on his own screen",
          ),
          effects: [
            {
              op: "decrement",
              var: "patience",
              by: 1,
            },
          ],
          goto: "courier_quantum",
        },
        {
          id: "run_outside",
          label: text(
            "bgadv.courier.run",
            "Abandon the phone call and sprint around the building perimeter, hunting for a white van that may not exist in this timeline",
          ),
          effects: [
            {
              op: "increment",
              var: "absurdity",
              by: 1,
            },
          ],
          goto: "courier_street",
        },
        {
          id: "ask_landmark",
          label: text(
            "bgadv.courier.landmark",
            "Ask what he can currently see with his own eyes, initiating the national landmark-based location protocol",
          ),
          effects: [
            {
              op: "increment",
              var: "connections",
              by: 1,
            },
          ],
          goto: "courier_landmark",
        },
      ],
    },
    courier_quantum: {
      kind: "choice",
      text: text(
        "bgadv.courier_quantum.text",
        "You repeat the address, syllable by syllable, as though teaching a foreign language to a skeptical parrot. He repeats ‘I am outside,’ now delivered with the wounded patience of a man forced, yet again, to explain geography to the person who apparently invented it and then forgot how it works. A dog barks through the phone from somewhere that is, provably, not your street, possibly not your city, possibly not this decade.",
      ),
      choices: [
        {
          id: "accept_quantum",
          label: text(
            "bgadv.courier.accept",
            "Accept, spiritually, that you are both outside, in adjacent but non-overlapping realities, and that this is fine",
          ),
          effects: [
            {
              op: "set",
              var: "courier_found",
              value: true,
            },
          ],
          goto: "courier_result",
        },
        {
          id: "request_office",
          label: text(
            "bgadv.courier.office",
            "Redirect the parcel to the regional depot and formally request documentary proof that the surrender of the package occurred at all",
          ),
          effects: [
            {
              op: "increment",
              var: "documents",
              by: 1,
            },
          ],
          goto: "courier_result",
        },
      ],
    },
    courier_street: {
      kind: "random",
      text: text(
        "bgadv.courier_street.text",
        "You locate three white vans within thirty seconds. One sells bread out the side door. One is entirely full of plumbing fittings and a sleeping cat. One pulls away the instant you make eye contact, with the unmistakable body language of a van that has somewhere else to be. The universe, silently and without appeal, selects which one mattered.",
      ),
      transitions: [
        {
          weight: 1,
          effects: [
            {
              op: "set",
              var: "courier_found",
              value: true,
            },
          ],
          goto: "courier_result",
        },
        {
          weight: 1,
          effects: [
            {
              op: "increment",
              var: "absurdity",
              by: 2,
            },
          ],
          goto: "courier_result",
        },
      ],
    },
    courier_landmark: {
      kind: "choice",
      text: text(
        "bgadv.courier_landmark.text",
        "He can see, he reports, the old shop. You ask, reasonably, which old shop, given that there are at minimum four candidates within a two-block radius, all closed, all ancestral. He says, with the finality of scripture, ‘The old one.’ This is instantly and completely understood by a passing pensioner, who, without breaking stride or making eye contact, points two streets east and continues about her day, mission accomplished.",
      ),
      choices: [
        {
          id: "decode_landmark",
          label: text(
            "bgadv.courier.decode",
            "Trust the National Landmark Protocol completely and unquestioningly, as generations have before you",
          ),
          effects: [
            {
              op: "set",
              var: "courier_found",
              value: true,
            },
            {
              op: "increment",
              var: "connections",
              by: 1,
            },
          ],
          goto: "courier_result",
        },
      ],
    },
    courier_result: {
      kind: "choice",
      text: text(
        "bgadv.courier_result.text",
        "The parcel is, against all odds and several laws of physics, finally transferred. The courier requests exact change for a delivery fee that was never mentioned before this exact moment, produces exact change himself when you cannot, and vanishes on his invisible vehicle before causality has finished processing the transaction.",
      ),
      choices: [
        {
          id: "open_package",
          label: text(
            "bgadv.courier.open",
            "Open the parcel immediately, right there on the pavement, audience included",
          ),
          goto: "master",
        },
        {
          id: "preserve_package",
          label: text(
            "bgadv.courier.preserve",
            "Preserve every label, receipt, and stray fragment of packing tape, in case the parcel is later formally accused of not existing",
          ),
          effects: [
            {
              op: "increment",
              var: "documents",
              by: 1,
            },
          ],
          goto: "master",
        },
      ],
    },
    master: {
      kind: "choice",
      text: text(
        "bgadv.master.text",
        "ACT III — THE IMMORTAL МАЙСТОР\n\nThe parcel contains the valve your майстор swore, on his mother's health, was impossible to source anywhere on the Balkan peninsula, possibly the continent. The leaking pipe has been patiently waiting for him since ‘Monday’ — a Monday with no attached calendar date, existing outside conventional chronology, referenced the way other cultures reference the apocalypse.\n\nYou call. He answers on the first ring with, ‘I was just about to call you,’ a sentence he has said, verifiably, every single time, for eleven years, possibly longer, possibly since before you owned this apartment.",
      ),
      choices: [
        {
          id: "call_master",
          label: text(
            "bgadv.master.call",
            "Ask, directly and perhaps naively, when precisely he intends to arrive",
          ),
          effects: [
            {
              op: "decrement",
              var: "patience",
              by: 1,
            },
          ],
          goto: "master_time",
        },
        {
          id: "call_friend",
          label: text(
            "bgadv.master.friend",
            "Call the friend of the person you now know, invoking the full weight of the social graph you have been quietly building since 08:07",
          ),
          requirements: {
            field: "var.connections",
            operator: "greater_or_equal",
            value: 2,
          },
          requirementFail: text(
            "bgadv.master.friend_fail",
            "You do not yet know enough people who know people who know the majstor's cousin's godfather. This is not, the universe clarifies, a skills problem. It is an infrastructure problem, and infrastructure takes generations.",
          ),
          effects: [
            {
              op: "increment",
              var: "connections",
              by: 1,
            },
          ],
          goto: "master_arrival",
        },
        {
          id: "watch_video",
          label: text(
            "bgadv.master.video",
            "Watch a nine-minute plumbing tutorial at 1.5x speed and become, for legal and emotional purposes, a temporarily licensed tradesman",
          ),
          effects: [
            {
              op: "increment",
              var: "absurdity",
              by: 2,
            },
          ],
          goto: "master_diy",
        },
      ],
    },
    master_time: {
      kind: "choice",
      text: text(
        "bgadv.master_time.text",
        "He confirms: Monday. You gently point out that today is, in fact, currently, actively Monday. He pauses — not out of confusion, you understand, but because you have introduced an entirely unwelcome and frankly rude level of temporal precision into what was previously a comfortable, ambient arrangement.",
      ),
      choices: [
        {
          id: "ask_which_monday",
          label: text(
            "bgadv.master.which_monday",
            "Ask, with rising existential dread, which Monday specifically he originally meant",
          ),
          effects: [
            {
              op: "increment",
              var: "absurdity",
              by: 1,
            },
          ],
          goto: "master_arrival",
        },
        {
          id: "accept_monday",
          label: text(
            "bgadv.master.accept_monday",
            "Accept 'Monday' not as a date but as a philosophical stance on the nature of obligation itself",
          ),
          goto: "master_arrival",
        },
      ],
    },
    master_diy: {
      kind: "random",
      text: text(
        "bgadv.master_diy.text",
        "The video insists you must ‘simply remove the old fitting.’ The fitting, for its part, has spent forty years quietly and thoroughly becoming both structurally load-bearing and, somehow, emotionally attached to the building, and to you personally.",
      ),
      transitions: [
        {
          weight: 1,
          effects: [
            {
              op: "increment",
              var: "documents",
              by: 1,
            },
          ],
          goto: "master_result",
        },
        {
          weight: 1,
          effects: [
            {
              op: "decrement",
              var: "patience",
              by: 2,
            },
            {
              op: "increment",
              var: "absurdity",
              by: 2,
            },
          ],
          goto: "master_arrival",
        },
      ],
    },
    master_arrival: {
      kind: "choice",
      text: text(
        "bgadv.master_arrival.text",
        "The майстор arrives. Multiple neighbours step onto their balconies specifically to witness this, treating it as a minor but confirmed miracle. He examines the valve, the pipe, the wall, the building's foundation, your life choices, and your decision to purchase the valve yourself rather than through his cousin, who, he notes, would have gotten you a better one. The original quoted price is no longer available, on account of the problem now having been seen in person, with his own two eyes, which changes everything, spiritually and financially.",
      ),
      choices: [
        {
          id: "accept_new_price",
          label: text(
            "bgadv.master.price",
            "Accept the revised price without complaint, as the appropriate cost of witnessing a genuine miracle in your own bathroom",
          ),
          effects: [
            {
              op: "set",
              var: "master_arrived",
              value: true,
            },
            {
              op: "increment",
              var: "connections",
              by: 1,
            },
          ],
          goto: "master_result",
        },
        {
          id: "mention_original_price",
          label: text(
            "bgadv.master.original",
            "Gently mention the original quoted price and watch, in real time, as basic economics is reclassified as regional folklore",
          ),
          effects: [
            {
              op: "increment",
              var: "absurdity",
              by: 2,
            },
            {
              op: "set",
              var: "master_arrived",
              value: true,
            },
          ],
          goto: "master_result",
        },
      ],
    },
    master_result: {
      kind: "choice",
      text: text(
        "bgadv.master_result.text",
        "He fixes the leak in eleven minutes flat, using your valve, two mismatched washers extracted from somewhere deep in his jacket pocket, and a tool that appears to have been hand-forged during the Yugoslav era for a completely different purpose. He informs you, with total serenity, that the entire original installation was wrong, has always been wrong, and will now, thanks to him, outlive both you and your grandchildren.",
      ),
      choices: [
        {
          id: "to_village",
          label: text(
            "bgadv.continue",
            "Continue with your completely ordinary day",
          ),
          goto: "village",
        },
      ],
    },
    village: {
      kind: "choice",
      text: text(
        "bgadv.village.text",
        "ACT IV — THE VILLAGE API\n\nYou arrive at the village. Before you have finished closing the gate, a neighbour materializes to ask, in a single uninterrupted breath, whether the pipe is fixed, why the courier was so late, whether the man from the city is still upset about the chair incident, and whether it's true you're getting a dog.\n\nYou told absolutely none of this to anyone here. You have not, in fact, spoken to a single soul in this village since Easter.",
      ),
      choices: [
        {
          id: "deny_news",
          label: text(
            "bgadv.village.deny",
            "Deny everything, calmly and completely, in a last, doomed attempt to preserve the concept of privacy as an institution",
          ),
          effects: [
            {
              op: "increment",
              var: "absurdity",
              by: 2,
            },
          ],
          goto: "baba_network",
        },
        {
          id: "ask_source",
          label: text(
            "bgadv.village.source",
            "Ask, purely for research purposes, how she possibly knows any of this",
          ),
          effects: [
            {
              op: "increment",
              var: "connections",
              by: 1,
            },
          ],
          goto: "baba_source",
        },
        {
          id: "offer_coffee",
          label: text(
            "bgadv.village.coffee",
            "Put the coffee on immediately and formally request full read-access to the intelligence network",
          ),
          effects: [
            {
              op: "set",
              var: "baba_allied",
              value: true,
            },
            {
              op: "increment",
              var: "connections",
              by: 2,
            },
          ],
          goto: "baba_alliance",
        },
      ],
    },
    baba_network: {
      kind: "choice",
      text: text(
        "bgadv.baba_network.text",
        "By the time your denial has propagated to the next house over, it has transformed into an enthusiastic confirmation, acquired a secret engagement you were apparently not informed of, and somehow gained a German car. The network, true to its design, corrects for missing data not by discarding it but by generously improving it.",
      ),
      choices: [
        {
          id: "surrender_privacy",
          label: text(
            "bgadv.village.surrender",
            "Accept the Terms of Service, unread, as one does",
          ),
          effects: [
            {
              op: "set",
              var: "baba_allied",
              value: true,
            },
          ],
          goto: "village_feast",
        },
        {
          id: "issue_correction",
          label: text(
            "bgadv.village.correct",
            "Attempt to issue a formal factual correction to the village's oral internet, a request logged and instantly ignored",
          ),
          effects: [
            {
              op: "increment",
              var: "absurdity",
              by: 2,
            },
          ],
          goto: "village_feast",
        },
      ],
    },
    baba_source: {
      kind: "choice",
      text: text(
        "bgadv.baba_source.text",
        "She explains, patiently, that her sister heard it from the pharmacist's daughter, whose husband personally saw your car parked suspiciously near the courier's regional office. You point out, with what you believe is an unassailable logical advantage, that you never actually went to the courier's office. She nods, satisfied, as though you have just confirmed rather than refuted the theory. That, she says, explains why the courier was so late.",
      ),
      choices: [
        {
          id: "accept_source",
          label: text(
            "bgadv.village.accept_source",
            "Accept the source as fully, independently peer-reviewed by a village council of one grandmother and her landline",
          ),
          effects: [
            {
              op: "set",
              var: "baba_allied",
              value: true,
            },
          ],
          goto: "village_feast",
        },
      ],
    },
    baba_alliance: {
      kind: "choice",
      text: text(
        "bgadv.baba_alliance.text",
        "Coffee is served, black, unbidden, and non-negotiable. Within six minutes you have received the mayor's full weekly schedule, the municipal clerk's maiden name and shoe size, the correct office number nobody official will tell you, two unsolicited medical diagnoses regarding your posture, and an urgent, unverified warning that the municipality has run out of blue pens entirely, possibly permanently.",
      ),
      choices: [
        {
          id: "receive_intelligence",
          label: text(
            "bgadv.village.intelligence",
            "Memorize only the operationally useful parts and quietly abandon your commitment to epistemology for the day",
          ),
          effects: [
            {
              op: "increment",
              var: "documents",
              by: 1,
            },
          ],
          goto: "village_feast",
        },
      ],
    },
    village_feast: {
      kind: "choice",
      text: text(
        "bgadv.village_feast.text",
        "You attempt to stand and leave. Food materializes on the table with the speed and inevitability of a natural law. Refusing the food, you understand instinctively, would imply illness, personal hostility, or susceptibility to foreign influence. A bottle bearing no label whatsoever is placed, without comment, beside your plate. Your host refers to its contents as ‘one rakia,’ a unit of measurement with a well-documented lower bound and, as far as anyone has determined, no upper one.",
      ),
      choices: [
        {
          id: "one_rakia",
          label: text(
            "bgadv.village.one",
            "Accept precisely one rakia, understood in the traditional, non-Euclidean, load-bearing sense of the word ‘one’",
          ),
          effects: [
            {
              op: "increment",
              var: "rakia",
              by: 1,
            },
            {
              op: "increment",
              var: "patience",
              by: 1,
            },
          ],
          goto: "municipality",
        },
        {
          id: "refuse_rakia",
          label: text(
            "bgadv.village.refuse",
            "Politely refuse, thereby triggering an immediate, informal, and deeply concerned village medical inquiry into your health",
          ),
          effects: [
            {
              op: "increment",
              var: "absurdity",
              by: 2,
            },
          ],
          goto: "municipality",
        },
        {
          id: "define_one",
          label: text(
            "bgadv.village.define",
            "Ask, bravely, exactly how large this particular ‘one’ is intended to be, a question no one has ever successfully answered",
          ),
          effects: [
            {
              op: "increment",
              var: "rakia",
              by: 2,
            },
            {
              op: "increment",
              var: "connections",
              by: 1,
            },
          ],
          goto: "municipality",
        },
      ],
    },
    municipality: {
      kind: "choice",
      text: text(
        "bgadv.municipality.text",
        "ACT V — THE FINAL DOCUMENT\n\nAt 15:42 you reach the municipality, slightly rakia-adjacent and radiating documented absurdity. Room 12 requires exactly one document to confirm a fact that is already, provably, visible in no fewer than three separate government databases. A handwritten note taped to Room 12's door states that Room 12 has permanently relocated to Room 7. A second, older, more confident note on Room 7's door states, with equal conviction, that Room 12 has not moved, has never moved, and will not be moving.",
      ),
      choices: [
        {
          id: "present_folder",
          label: text(
            "bgadv.municipality.folder",
            "Slam the folder onto the counter before anyone in the building has the opportunity to invent an additional requirement",
          ),
          requirements: {
            field: "var.documents",
            operator: "greater_or_equal",
            value: 2,
          },
          requirementFail: text(
            "bgadv.municipality.folder_fail",
            "Your folder, while technically complete, lacks the minimum ceremonial density required to properly intimidate a state institution into swift action.",
          ),
          effects: [
            {
              op: "increment",
              var: "patience",
              by: 1,
            },
          ],
          goto: "clerk",
        },
        {
          id: "ask_which_document",
          label: text(
            "bgadv.municipality.ask",
            "Ask, with the calm of someone who has already lost, which document is in fact actually, truly required",
          ),
          effects: [
            {
              op: "increment",
              var: "absurdity",
              by: 2,
            },
          ],
          goto: "clerk",
        },
        {
          id: "call_connection",
          label: text(
            "bgadv.municipality.connection",
            "Call the person who knows the person, cashing in the single largest favor accumulated so far today",
          ),
          requirements: {
            field: "var.connections",
            operator: "greater_or_equal",
            value: 3,
          },
          requirementFail: text(
            "bgadv.municipality.connection_fail",
            "Your social graph, vast and well-earned though it is, does not yet extend into this particular department's jurisdiction.",
          ),
          effects: [
            {
              op: "decrement",
              var: "connections",
              by: 1,
            },
          ],
          goto: "clerk_connection",
        },
      ],
    },
    clerk: {
      kind: "choice",
      text: text(
        "bgadv.clerk.text",
        "The clerk examines your documents with the focused intensity of a jeweler appraising a suspicious diamond, and finds them, remarkably, entirely correct. A long silence follows, heavy with dread. Then she notices the application has been signed in black ink. The regulation, she informs you, does not technically require blue ink. The regulation, she also informs you, is not currently located in this room, this floor, or possibly this building.",
      ),
      choices: [
        {
          id: "use_blue_pen",
          label: text(
            "bgadv.clerk.blue",
            "Triumphantly produce the sacred blue pen you have been protecting, in its sock, since 08:07",
          ),
          showWhen: {
            field: "var.has_blue_pen",
            operator: "equals",
            value: true,
          },
          effects: [
            {
              op: "increment",
              var: "documents",
              by: 1,
            },
          ],
          goto: "final_counter",
        },
        {
          id: "find_blue_pen",
          label: text(
            "bgadv.clerk.find",
            "Rush out to find a working blue pen before the office rediscovers the concept of lunch and disappears for ninety minutes",
          ),
          effects: [
            {
              op: "decrement",
              var: "patience",
              by: 1,
            },
            {
              op: "increment",
              var: "absurdity",
              by: 1,
            },
          ],
          goto: "pen_shop",
        },
      ],
    },
    clerk_connection: {
      kind: "choice",
      text: text(
        "bgadv.clerk_connection.text",
        "Your connection, it is made very clear, does not bypass any rules whatsoever. That would be improper, and everyone involved wants that understood. Instead, entirely coincidentally, a second woman enters from the adjoining room, applies the exact same rules in the exact correct order, and resolves the entire matter in just under forty seconds.",
      ),
      choices: [
        {
          id: "accept_help",
          label: text(
            "bgadv.clerk.accept",
            "Accept this entirely procedural, entirely coincidental, thoroughly unremarkable miracle without further comment",
          ),
          effects: [
            {
              op: "increment",
              var: "documents",
              by: 1,
            },
          ],
          goto: "final_counter",
        },
      ],
    },
    pen_shop: {
      kind: "choice",
      text: text(
        "bgadv.pen_shop.text",
        "The nearest shop sells pens, lottery tickets, artisanal coffee, phone cases of debatable provenance, small religious icons, batteries in four different voltages, and exactly one tomato, alone, on its own shelf, for reasons nobody working there can or will explain. The blue pens themselves are kept behind the counter, under lock, as though they are controlled municipal equipment, which, functionally, today, they are.",
      ),
      choices: [
        {
          id: "buy_pen",
          label: text(
            "bgadv.pen_shop.buy",
            "Buy three blue pens on principle, so this exact humiliation can never happen to you again",
          ),
          effects: [
            {
              op: "set",
              var: "has_blue_pen",
              value: true,
            },
            {
              op: "increment",
              var: "documents",
              by: 1,
            },
          ],
          goto: "final_counter",
        },
        {
          id: "borrow_pen",
          label: text(
            "bgadv.pen_shop.borrow",
            "Borrow a pen from the next person in the queue and, in the process, become temporary, honorary family",
          ),
          effects: [
            {
              op: "increment",
              var: "connections",
              by: 1,
            },
          ],
          goto: "final_counter",
        },
      ],
    },
    final_counter: {
      kind: "choice",
      text: text(
        "bgadv.final_counter.text",
        "You return at 16:51 with nine minutes to spare and the thousand-yard stare of a war veteran. The form is blue. The copies are stamped, restamped, and stamped once more for luck. The clerk studies the now-complete file with the specific expression of someone whose final line of defensive bureaucracy has, at long last, fallen.\n\nThere is, everyone in the room silently agrees, still exactly enough time left for one last thing to go catastrophically, gloriously wrong.",
      ),
      choices: [
        {
          id: "submit_normally",
          label: text(
            "bgadv.final_counter.submit",
            "Submit the document plainly, quietly, and permit fate exactly one final, uncontested move",
          ),
          effects: [
            {
              op: "decrement",
              var: "patience",
              by: 1,
            },
          ],
          goto: "final_event",
        },
        {
          id: "deploy_baba",
          label: text(
            "bgadv.final_counter.baba",
            "Casually mention the clerk's aunt by her full first name, deploying your entire village intelligence network in a single decisive strike",
          ),
          showWhen: {
            field: "var.baba_allied",
            operator: "equals",
            value: true,
          },
          effects: [
            {
              op: "increment",
              var: "connections",
              by: 2,
            },
          ],
          goto: "ending_local_protocol",
        },
        {
          id: "declare_victory",
          label: text(
            "bgadv.final_counter.victory",
            "Formally declare that Documented Absurdity itself, at this quantity, now legally constitutes your supporting documentation",
          ),
          requirements: {
            field: "var.absurdity",
            operator: "greater_or_equal",
            value: 8,
          },
          requirementFail: text(
            "bgadv.final_counter.victory_fail",
            "You have not, this session, generated sufficient absurdity to establish proper legal standing for this particular gambit.",
          ),
          goto: "ending_became_system",
        },
      ],
    },
    final_event: {
      kind: "random",
      text: text(
        "bgadv.final_event.text",
        "The stamp rises into the air, hovers with theatrical menace, and begins its descent. Somewhere unseen, the universe rolls dice for jurisdiction, ink supply, and lunch-break timing, all simultaneously.",
      ),
      transitions: [
        {
          weight: 2,
          goto: "ending_document_received",
        },
        {
          weight: 1,
          goto: "ending_lunch_break",
        },
        {
          weight: 1,
          effects: [
            {
              op: "increment",
              var: "absurdity",
              by: 2,
            },
          ],
          goto: "ending_wrong_municipality",
        },
      ],
    },
    ending_document_received: {
      kind: "ending",
      text: text(
        "bgadv.ending.document.text",
        "THE DOCUMENT, ACQUIRED\n\nThe stamp lands, true and clean. Your application is accepted, in full, on the first attempt. Nobody applauds, because everyone present understands, on an ancestral level, that drawing attention to a successful bureaucratic outcome at this exact stage would be recklessly, catastrophically premature.\n\nYou have completed five errands in one single Bulgarian day, survived a parking chair's sovereign court, an interdimensional courier, an immortal tradesman, and an entire village's surveillance apparatus. This is not officially recognized as a national record, and it never will be, purely because the office that would record it closes at exactly the wrong time every single day, on purpose, possibly out of self-preservation.",
      ),
      endingId: "document_received",
      outcome: "win",
    },
    ending_local_protocol: {
      kind: "ending",
      text: text(
        "bgadv.ending.local.text",
        "THE LOCAL PROTOCOL, INVOKED\n\nThe clerk hears the aunt's name spoken aloud, freezes, asks how you possibly know her, and within ninety seconds discovers that the two of you ate banitsa in the exact same village fifteen years apart, at the exact same bakery, possibly baked by the exact same grandmother. The document is accepted through absolutely no corruption whatsoever — merely an emergency, fully deserved restoration of proper social context.\n\nYou did not defeat the system today. You authenticated through it, using credentials older than the system itself.",
      ),
      endingId: "local_protocol",
      outcome: "win",
    },
    ending_became_system: {
      kind: "ending",
      text: text(
        "bgadv.ending.system.text",
        "YOU HAVE BECOME THE SYSTEM\n\nYou place every receipt, every rumour, every parking grievance, every impossible courier coordinate, and every blue-ink signature you have accumulated today onto the counter, all at once, in a single towering stack. The file has, by any reasonable measure, achieved genuine bureaucratic mass. The clerk stamps it immediately, not out of approval, but purely to prevent it from growing any further.\n\nOutside, a stranger stops you to ask, urgently, where Room 12 actually is. You look at them, look at Room 7, and say, with total and hard-won authority, ‘It depends.’ They thank you and walk away satisfied. You are now, unofficially, part of the institution.",
      ),
      endingId: "became_the_system",
      outcome: "neutral",
    },
    ending_lunch_break: {
      kind: "ending",
      text: text(
        "bgadv.ending.lunch.text",
        "THE SECOND LUNCH\n\nAt 16:53, with seven minutes remaining on the clock and the document one signature from complete, the clerk announces an unscheduled seven-minute technical break. At 17:00 sharp, on the dot, with genuine punctuality that has been absent from every other part of this day, the office closes. Your application remains perfectly, tragically complete, sitting on the wrong side of the glass.\n\nTomorrow, you resolve, you will arrive at 07:30 sharp. A small, new, freshly printed note will inform you that the office now opens at 09:00 due to summer hours, which began, apparently, this morning.",
      ),
      endingId: "lunch_break",
      outcome: "neutral",
    },
    ending_wrong_municipality: {
      kind: "ending",
      text: text(
        "bgadv.ending.wrong.text",
        "THE WRONG MUNICIPALITY\n\nThe stamp stops, hovering, exactly one centimetre above the paper, and does not descend. The clerk asks, not unkindly, why you have come here at all. Your home address, she explains, gesturing at a map that did not exist yesterday, now belongs to the neighbouring municipality. It did not, she confirms, belong there yesterday morning. The administrative boundary was quietly redrawn online sometime between your coffee and your second rakia.\n\nEvery single document you are holding is, technically, completely correct. You are simply, through no fault of your own, correct in entirely the wrong jurisdiction, a condition for which there is, as of yet, no known cure and no known office.",
      ),
      endingId: "wrong_municipality",
      outcome: "loss",
    },
  },
  achievements: [
    {
      id: "chair_diplomat",
      name: text("bgadv.achievement.chair.name", "Ambassador to the Chair"),
      description: text(
        "bgadv.achievement.chair.description",
        "Formally recognize a single plastic chair as a sovereign, immunity-holding parking authority.",
      ),
      hidden: false,
      condition: {
        field: "var.chair_respected",
        operator: "equals",
        value: true,
      },
    },
    {
      id: "quantum_courier",
      name: text("bgadv.achievement.courier.name", "Wavefunction Observed"),
      description: text(
        "bgadv.achievement.courier.description",
        "Successfully collapse the courier's ambiguous location into a single, deliverable reality.",
      ),
      hidden: false,
      condition: {
        field: "var.courier_found",
        operator: "equals",
        value: true,
      },
    },
    {
      id: "the_master_came",
      name: text(
        "bgadv.achievement.master.name",
        "Monday Has, In Fact, Arrived",
      ),
      description: text(
        "bgadv.achievement.master.description",
        "Witness a майстор personally appear on a calendar date that can be legally and spiritually described as Monday.",
      ),
      hidden: true,
      condition: {
        field: "var.master_arrived",
        operator: "equals",
        value: true,
      },
    },
    {
      id: "village_api",
      name: text("bgadv.achievement.baba.name", "Root Access: Village"),
      description: text(
        "bgadv.achievement.baba.description",
        "Authenticate successfully with the oldest, fastest, and most accurate distributed intelligence network in the Balkans.",
      ),
      hidden: false,
      condition: {
        field: "var.baba_allied",
        operator: "equals",
        value: true,
      },
    },
    {
      id: "the_document",
      name: text(
        "bgadv.achievement.document.name",
        "Five Errands, One Legendary Day",
      ),
      description: text(
        "bgadv.achievement.document.description",
        "Obtain the final stamped document before a sixth requirement has the chance to spontaneously generate.",
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
        "bgadv.achievement.wrong.name",
        "Correct in Entirely the Wrong Place",
      ),
      description: text(
        "bgadv.achievement.wrong.description",
        "Arrive with a flawless folder of correct documents at a municipality that redrew its own borders this morning.",
      ),
      hidden: true,
      condition: {
        field: "ending",
        operator: "equals",
        value: "wrong_municipality",
      },
    },
  ] as AchievementDefinitionSource[],
};

export function buildBulgarianAdventuresMaximumAbsurdityCampaign(
  source: StoryGraphCampaignSource = bulgarianAdventuresMaximumAbsurditySource,
): CommandResult<BuiltCampaign> {
  const { content, authoredText } = buildStoryGraphCampaign(source);
  const campaign: Campaign = {
    id: BULGARIAN_ADVENTURES_MAXIMUM_ABSURDITY_CAMPAIGN_ID,
    kindId: "story-graph",
    version: "1.0.0",
    titleKey: TITLE.key,
    content,
  };
  return buildCampaign(campaign, [TITLE, ...authoredText]);
}

/**
 * Authoring combinators for hand-built `StoryGraphCampaignSource` campaigns — shared by
 * what-would-lucifer-do.ts, what-would-lucifer-do-engineers-cut.ts, and
 * saki-quest-for-redemption.ts, which each authored an identical copy of this set
 * independently. Every campaign gets its own `nodes` registry via `createStoryGraphHelpers`,
 * so two campaigns calling it never share mutable state.
 */
import type {
  AchievementDefinitionSource,
  AuthoredText,
  ChoiceSource,
  Condition,
  Consequence,
  NodeSource,
  RandomTransition,
  VarValue,
} from "@the-running-dev/game-engine/authoring";

export interface OptionExtras {
  readonly effects?: Consequence[];
  readonly showWhen?: Condition;
  readonly requirements?: Condition;
  readonly requirementFail?: string;
}

/** `keyPrefix` namespaces every authored text key (`{keyPrefix}.{id}.{field}`) so campaigns
 *  that reuse the same node/choice ids don't collide in the published strings table. */
export function createStoryGraphHelpers(keyPrefix: string) {
  const text = (id: string, field: string, value: string): AuthoredText => ({
    key: `${keyPrefix}.${id}.${field}`,
    text: value,
  });

  const inc = (name: string, by = 1): Consequence => ({
    op: "increment",
    var: name,
    by,
  });
  const dec = (name: string, by = 1): Consequence => ({
    op: "decrement",
    var: name,
    by,
  });
  const put = (name: string, value: VarValue): Consequence => ({
    op: "set",
    var: name,
    value,
  });

  const atLeast = (name: string, value: number): Condition => ({
    field: `var.${name}`,
    operator: "greater_or_equal",
    value,
  });
  const atMost = (name: string, value: number): Condition => ({
    field: `var.${name}`,
    operator: "less_or_equal",
    value,
  });
  const visited = (nodeId: string): Condition => ({
    field: `visited.${nodeId}`,
    operator: "greater_or_equal",
    value: 1,
  });
  const unvisited = (nodeId: string): Condition => ({
    field: `visited.${nodeId}`,
    operator: "equals",
    value: 0,
  });
  const flag = (name: string, value: boolean): Condition => ({
    field: `var.${name}`,
    operator: "equals",
    value,
  });
  const between = (name: string, low: number, high: number): Condition => ({
    all: [atLeast(name, low), atMost(name, high)],
  });

  /** One choice on `nodeId`; its label key is derived from the node and choice ids together. */
  function opt(
    nodeId: string,
    id: string,
    label: string,
    goto: string,
    extras: OptionExtras = {},
  ): ChoiceSource {
    const { effects, showWhen, requirements, requirementFail } = extras;
    return {
      id,
      label: text(nodeId, id, label),
      ...(showWhen !== undefined ? { showWhen } : {}),
      ...(requirements !== undefined ? { requirements } : {}),
      ...(requirementFail !== undefined
        ? { requirementFail: text(nodeId, `${id}_fail`, requirementFail) }
        : {}),
      ...(effects !== undefined ? { effects } : {}),
      goto,
    };
  }

  const nodes: Record<string, NodeSource> = Object.create(null) as Record<
    string,
    NodeSource
  >;

  function pick(id: string, body: string, choices: ChoiceSource[]): void {
    nodes[id] = { kind: "choice", text: text(id, "text", body), choices };
  }

  /** A page with one way forward — a beat, not a decision. */
  function page(
    id: string,
    body: string,
    label: string,
    goto: string,
    effects?: Consequence[],
  ): void {
    pick(id, body, [
      opt(
        id,
        `${id}_next`,
        label,
        goto,
        effects === undefined ? {} : { effects },
      ),
    ]);
  }

  function say(id: string, body: string, goto: string): void {
    nodes[id] = { kind: "auto", text: text(id, "text", body), goto };
  }

  function fork(
    id: string,
    body: string,
    transitions: RandomTransition[],
  ): void {
    nodes[id] = { kind: "random", text: text(id, "text", body), transitions };
  }

  function finish(
    id: string,
    endingId: string,
    title: string,
    body: string,
    outcome: "win" | "loss" | "neutral",
  ): void {
    nodes[`ending_${id}`] = {
      kind: "ending",
      text: text(`ending_${id}`, "text", `${title}\n\n${body}`),
      endingId,
      outcome,
    };
  }

  function achievement(
    id: string,
    name: string,
    description: string,
    condition: Condition,
  ): AchievementDefinitionSource {
    return {
      id,
      name: text(`achievement_${id}`, "name", name),
      description: text(`achievement_${id}`, "description", description),
      hidden: true,
      condition,
    };
  }

  return {
    text,
    inc,
    dec,
    put,
    atLeast,
    atMost,
    visited,
    unvisited,
    flag,
    between,
    opt,
    nodes,
    pick,
    page,
    say,
    fork,
    finish,
    achievement,
  };
}

/**
 * Exercises the same schema `scripts/validate-content.mjs` compiles against — the exact
 * check that gates a deploy. A validator that has never rejected anything is not known to
 * constrain anything, so this asserts both a real published document passes and a
 * deliberately malformed one fails, with the error naming the field it caught.
 */

import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import Ajv2020 from "ajv/dist/2020.js";
import { describe, expect, it } from "vitest";

const repoRoot = fileURLToPath(new URL("..", import.meta.url));
const contractPath = join(
  repoRoot,
  "contracts",
  "dist",
  "content-contract.json",
);

async function compileCampaignValidator() {
  const contract = JSON.parse(await readFile(contractPath, "utf8"));
  const campaignSchema = contract.schemas.find((s: { $id: string }) =>
    s.$id.endsWith("/campaign.json"),
  );
  const ajv = new Ajv2020({ strict: false });
  return ajv.compile(campaignSchema);
}

describe("the content contract's campaign schema", () => {
  it("accepts a real published campaign document", async () => {
    const validate = await compileCampaignValidator();
    const campaign = JSON.parse(
      await readFile(join(repoRoot, "bulgaria-bureaucracy.json"), "utf8"),
    );
    expect(validate(campaign)).toBe(true);
  });

  it("rejects a document missing the required catalog field", async () => {
    const validate = await compileCampaignValidator();
    const campaign = JSON.parse(
      await readFile(join(repoRoot, "bulgaria-bureaucracy.json"), "utf8"),
    );
    delete (campaign as { catalog?: unknown }).catalog;

    expect(validate(campaign)).toBe(false);
    expect(
      validate.errors?.some(
        (e: { message?: string; params?: { missingProperty?: string } }) =>
          e.message?.includes("catalog") ||
          e.params?.missingProperty === "catalog",
      ),
    ).toBe(true);
  });
});

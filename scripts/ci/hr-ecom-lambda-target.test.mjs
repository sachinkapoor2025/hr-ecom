import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { assertHrEcomLambdaTarget } from "./hr-ecom-lambda-target.mjs";

const workflowPath = fileURLToPath(new URL("../../.github/workflows/deploy.yml", import.meta.url));
const workflow = readFileSync(workflowPath, "utf8");

describe("assertHrEcomLambdaTarget", () => {
  it("accepts the two explicit hr-ecom DEV functions", () => {
    assert.equal(assertHrEcomLambdaTarget("hr-ecom-api-dev"), "hr-ecom-api-dev");
    assert.equal(assertHrEcomLambdaTarget("hr-ecom-ses-email-dev"), "hr-ecom-ses-email-dev");
  });

  it("rejects blank, ambiguous, BlossomPot, and other names", () => {
    for (const name of [
      "",
      "   ",
      " hr-ecom-api-dev",
      "hr-ecom-api-dev ",
      "hr-ecom-api-dev blossompot-api-dev",
      "hr-ecom-api-dev,hr-ecom-ses-email-dev",
      "blossompot-api-dev",
      "BlossomPot-api-dev",
      "blossompot-ses-email-prod",
      "hr-ecom-api-prod",
      "hr-ecom-api-dev/extra",
      "not-a-function",
    ]) {
      assert.throws(() => assertHrEcomLambdaTarget(name), Error, name);
    }
  });
});

describe("deploy workflow", () => {
  it("does not discover or update a BlossomPot function", () => {
    const lowered = workflow.toLowerCase();
    assert.equal(lowered.includes("0iwn6h2ds8"), false);
    assert.equal(lowered.includes("get-integrations"), false);
    assert.equal(lowered.includes("list-functions"), false);
    assert.equal(lowered.includes("blossompot"), false);
    assert.equal(lowered.includes("apigatewayv2"), false);
  });

  it("publishes code only after the explicit DEV name passes the guard", () => {
    const codeStep = workflow.slice(
      workflow.indexOf("Publish API code to hr-ecom-api-dev"),
      workflow.indexOf("Set Mailercloud credentials on hr-ecom DEV functions")
    );
    const guardAt = codeStep.indexOf("hr-ecom-lambda-target.mjs");
    const updateAt = codeStep.indexOf("aws lambda update-function-code");
    assert.ok(guardAt >= 0 && updateAt > guardAt);
    assert.match(codeStep, /DEV_API_FUNCTION: hr-ecom-api-dev/);
    assert.match(codeStep, /--function-name "\$DEV_API_FUNCTION"/);
    assert.equal(codeStep.includes("$func"), false);
  });

  it("configures only the named hr-ecom DEV functions", () => {
    const configStep = workflow.slice(workflow.indexOf("Set Mailercloud credentials on hr-ecom DEV functions"));
    assert.match(configStep, /DEV_API_FUNCTION: hr-ecom-api-dev/);
    assert.match(configStep, /DEV_SES_FUNCTION: hr-ecom-ses-email-dev/);
    assert.match(configStep, /hr-ecom-lambda-target\.mjs" "\$DEV_API_FUNCTION" "\$DEV_SES_FUNCTION"/);
    assert.equal(configStep.includes("for name in"), false);
  });

  it("creates the production change set in Stage A and executes it separately", () => {
    const stageA = workflow.slice(workflow.indexOf("  deploy-api:"), workflow.indexOf("  deploy-dev-api:"));
    const execution = workflow.slice(workflow.indexOf("  execute-prod-changeset:"));
    assert.match(stageA, /sam deploy --no-execute-changeset --config-env prod/);
    assert.equal(stageA.includes("--no-confirm-changeset"), false);
    assert.equal(stageA.includes("aws cloudformation execute-change-set"), false);
    assert.equal(stageA.includes("update-function-code"), false);
    assert.match(
      execution,
      /aws cloudformation execute-change-set --stack-name hr-ecom-prod --change-set-name "\$CHANGE_SET_ARN"/
    );
  });
});

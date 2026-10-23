import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import {
  EXPECTED_STACK,
  FUNCTION_ALLOWLIST,
  GENERATED_APIS,
  GENERATED_PERMISSIONS,
  GENERATED_RULES,
  reviewProdChangeSet,
} from "./hr-ecom-prod-changeset-review.mjs";

const FUNCTIONS = [
  "ApiFunction",
  "VendorApiFunction",
  "ReviewEmailsCronFunction",
  "SesEmailCronFunction",
  "BounceSyncFunction",
  "ImageOptimizeFunction",
];
const RULES = {
  BounceSyncFunctionHourlyBounceSync: "BounceSyncFunction",
  ImageOptimizeFunctionObjectCreated: "ImageOptimizeFunction",
  ReviewEmailsCronFunctionEmailJobsEvery15Minutes: "ReviewEmailsCronFunction",
  ReviewEmailsCronFunctionRazorpayReconcileHourly: "ReviewEmailsCronFunction",
  ReviewEmailsCronFunctionTrackingSyncEvery15Minutes: "ReviewEmailsCronFunction",
  SesEmailCronFunctionEveryMinuteSesQueue: "SesEmailCronFunction",
};
const PERMISSIONS = {
  BounceSyncFunctionHourlyBounceSyncPermission: "BounceSyncFunctionHourlyBounceSync",
  ImageOptimizeFunctionObjectCreatedPermission: "ImageOptimizeFunctionObjectCreated",
  ReviewEmailsCronFunctionEmailJobsEvery15MinutesPermission: "ReviewEmailsCronFunctionEmailJobsEvery15Minutes",
  ReviewEmailsCronFunctionRazorpayReconcileHourlyPermission: "ReviewEmailsCronFunctionRazorpayReconcileHourly",
  ReviewEmailsCronFunctionTrackingSyncEvery15MinutesPermission: "ReviewEmailsCronFunctionTrackingSyncEvery15Minutes",
  SesEmailCronFunctionEveryMinuteSesQueuePermission: "SesEmailCronFunctionEveryMinuteSesQueue",
};
const APIS = {
  HttpApi: "ApiFunction",
  VendorHttpApi: "VendorApiFunction",
};

const workflow = readFileSync(fileURLToPath(new URL("../../.github/workflows/deploy.yml", import.meta.url)), "utf8");
const ARN = "arn:aws:cloudformation:us-east-1:796174527529:changeSet/samcli-deploy1792766066/27e72962-93f6-412f-bd12-4130a3c791d6";

const FUNCTION_DETAIL = {
  Attribute: "Properties",
  CausingEntity: null,
  ChangeSource: "DirectModification",
  Evaluation: "Static",
  Name: "Code",
  RequiresRecreation: "Never",
};

function detail(name, recreation, causingEntity) {
  return {
    Attribute: "Properties",
    CausingEntity: causingEntity,
    ChangeSource: "ResourceAttribute",
    Evaluation: "Dynamic",
    Name: name,
    RequiresRecreation: recreation,
  };
}

function change(logicalId, resourceType, replacement, details) {
  return {
    Action: "Modify",
    Details: details,
    LogicalResourceId: logicalId,
    Replacement: replacement,
    ResourceType: resourceType,
  };
}

function functionChange(logicalId, replacement = "False") {
  return change(logicalId, "AWS::Lambda::Function", replacement, [{ ...FUNCTION_DETAIL }]);
}

function ruleChange(logicalId, replacement = "False", causingEntity = `${RULES[logicalId]}.Arn`) {
  return change(logicalId, "AWS::Events::Rule", replacement, [detail("Targets", "Never", causingEntity)]);
}

function permissionChange(logicalId, replacement = "Conditional", causingEntity = `${PERMISSIONS[logicalId]}.Arn`) {
  return change(logicalId, "AWS::Lambda::Permission", replacement, [detail("SourceArn", "Always", causingEntity)]);
}

function apiChange(logicalId, replacement = "False", causingEntity = `${APIS[logicalId]}.Arn`) {
  return change(logicalId, "AWS::ApiGatewayV2::Api", replacement, [detail("Body", "Never", causingEntity)]);
}

function resource(logicalId, properties = { marker: logicalId }) {
  return { Type: "AWS::CloudFormation::WaitConditionHandle", Properties: properties };
}

function templatesFor(changes, mutate) {
  const stack = { Resources: {} };
  const proposed = { Resources: {} };
  for (const item of changes) {
    stack.Resources[item.LogicalResourceId] = resource(item.LogicalResourceId);
    proposed.Resources[item.LogicalResourceId] = resource(item.LogicalResourceId);
    if (item.ResourceType === "AWS::Lambda::Function") {
      stack.Resources[item.LogicalResourceId].Properties = { Code: { S3Key: "old" }, Timeout: 30 };
      proposed.Resources[item.LogicalResourceId].Properties = { Code: { S3Key: "new" }, Timeout: 30 };
    }
      if (item.ResourceType === "AWS::ApiGatewayV2::Api") {
      const body = { openapi: "3.0.1", paths: { "/health": { get: { "x-amazon-apigateway-integration": { type: "aws_proxy", uri: { "Fn::Sub": `\${${APIS[item.LogicalResourceId]}.Arn}` } } } } } };
      stack.Resources[item.LogicalResourceId].Properties = { Body: body };
      proposed.Resources[item.LogicalResourceId].Properties = { Body: JSON.parse(JSON.stringify(body)) };
    }
  }
  if (mutate) mutate(stack, proposed);
  return { stackTemplate: stack, changeSetTemplate: proposed };
}

function review(changes, mutate) {
  const templates = templatesFor(Array.isArray(changes) ? changes : [changes], mutate);
  return reviewProdChangeSet({
    pages: [{
      ChangeSetId: ARN,
      Changes: Array.isArray(changes) ? changes : [changes],
      ExecutionStatus: "AVAILABLE",
      NextToken: null,
      StackId: EXPECTED_STACK,
      Status: "CREATE_COMPLETE",
    }],
    expectedArn: ARN,
    ...templates,
  });
}

describe("production change-set review", () => {
  it("keeps the reviewed function and generated-resource allowlists", () => {
    assert.deepEqual([...FUNCTION_ALLOWLIST], FUNCTIONS);
    assert.deepEqual(GENERATED_RULES, RULES);
    assert.deepEqual(GENERATED_PERMISSIONS, PERMISSIONS);
    assert.deepEqual(GENERATED_APIS, APIS);
  });

  it("accepts every reviewed function, rule, permission, and API pattern", () => {
    const changes = [
      ...FUNCTIONS.map((id) => functionChange(id)),
      ...Object.keys(RULES).map((id) => ruleChange(id)),
      ...Object.keys(PERMISSIONS).map((id) => permissionChange(id)),
      ...Object.keys(APIS).map((id) => apiChange(id)),
    ];
    assert.equal(changes.length, 20);
    for (const row of changes) {
      assert.equal(review(row).ok, true, row.LogicalResourceId);
    }
    const result = review(changes);
    assert.equal(result.ok, true, result.message);
    const reordered = review(changes, (_stack, proposed) => {
      for (const id of Object.keys(proposed.Resources)) {
        const resource = proposed.Resources[id];
        proposed.Resources[id] = { Properties: resource.Properties, Type: resource.Type };
      }
    });
    assert.equal(reordered.ok, true, reordered.message);
  });

  it("accepts a lowercase function replacement false", () => {
    assert.equal(review(functionChange("ApiFunction", "false")).ok, true);
  });

  it("rejects a wrong type, wrong logical ID, and unlisted resource", () => {
    assert.equal(review(change("BounceSyncFunctionHourlyBounceSync", "AWS::Lambda::Permission", "False", ruleChange("BounceSyncFunctionHourlyBounceSync").Details)).ok, false);
    assert.equal(review(permissionChange("NotAReviewedPermission")).ok, false);
    assert.equal(review(functionChange("SomeOtherFunction")).ok, false);
  });

  it("rejects unexpected replacement values", () => {
    assert.equal(review(functionChange("ApiFunction", "True")).ok, false);
    assert.equal(review(ruleChange("BounceSyncFunctionHourlyBounceSync", "Conditional")).ok, false);
    assert.equal(review(permissionChange("BounceSyncFunctionHourlyBounceSyncPermission", "False")).ok, false);
    assert.equal(review(apiChange("HttpApi", "Conditional")).ok, false);
  });

  it("does not accept a permission merely because replacement is conditional", () => {
    const row = permissionChange("BounceSyncFunctionHourlyBounceSyncPermission");
    row.Details = [detail("Principal", "Always", "BounceSyncFunctionHourlyBounceSync.Arn")];
    assert.equal(review(row).ok, false);
  });

  it("rejects an extra detail and a detail that does not match the reviewed pattern", () => {
    const row = ruleChange("BounceSyncFunctionHourlyBounceSync");
    row.Details.push(detail("State", "Never", "BounceSyncFunction.Arn"));
    assert.equal(review(row).ok, false);
    const staticRule = ruleChange("BounceSyncFunctionHourlyBounceSync");
    staticRule.Details[0].Evaluation = "Static";
    assert.equal(review(staticRule).ok, false);
    const functionDrift = functionChange("ApiFunction");
    functionDrift.Details.push({ ...FUNCTION_DETAIL, Name: "Environment" });
    assert.equal(review(functionDrift).ok, false);
  });

  it("rejects the wrong dependency for a rule, permission, and API", () => {
    assert.equal(review(ruleChange("BounceSyncFunctionHourlyBounceSync", "False", "ApiFunction.Arn")).ok, false);
    assert.equal(review(permissionChange("BounceSyncFunctionHourlyBounceSyncPermission", "Conditional", "BounceSyncFunction.Arn")).ok, false);
    assert.equal(review(apiChange("HttpApi", "False", "VendorApiFunction.Arn")).ok, false);
  });

  it("rejects a changed generated property and a changed API body", () => {
    const rule = review(ruleChange("ImageOptimizeFunctionObjectCreated"), (_stack, proposed) => {
      proposed.Resources.ImageOptimizeFunctionObjectCreated.Properties.ScheduleExpression = "rate(1 minute)";
    });
    assert.equal(rule.ok, false);
    const api = review(apiChange("VendorHttpApi"), (_stack, proposed) => {
      proposed.Resources.VendorHttpApi.Properties.Body.paths["/new"] = { post: {} };
    });
    assert.equal(api.ok, false);
    assert.equal(api.rejectedId, "VendorHttpApi");
  });

  it("rejects a function when a non-code property changes", () => {
    const result = review(functionChange("SesEmailCronFunction"), (_stack, proposed) => {
      proposed.Resources.SesEmailCronFunction.Properties.Timeout = 9;
    });
    assert.equal(result.ok, false);
  });

  it("rejects missing template evidence", () => {
    const row = functionChange("ApiFunction");
    const missingDocument = reviewProdChangeSet({
      pages: [{
        ChangeSetId: ARN,
        Changes: [row],
        ExecutionStatus: "AVAILABLE",
        NextToken: null,
        StackId: EXPECTED_STACK,
        Status: "CREATE_COMPLETE",
      }],
      expectedArn: ARN,
      stackTemplate: "AWSTemplateFormatVersion: '2010-09-09'\n",
      changeSetTemplate: { Resources: { ApiFunction: resource("ApiFunction") } },
    });
    assert.equal(missingDocument.ok, false);
    assert.equal(missingDocument.message, "Processed template comparison is unavailable.");
    const missingResource = review(row, (stack) => {
      delete stack.Resources.ApiFunction;
    });
    assert.equal(missingResource.ok, false);
    assert.equal(missingResource.rejectedId, "ApiFunction");
  });

  it("accepts processed TemplateBody objects and exact JSON strings", () => {
    const row = apiChange("HttpApi");
    const templates = templatesFor([row]);
    const page = {
      ChangeSetId: ARN,
      Changes: [row],
      ExecutionStatus: "AVAILABLE",
      NextToken: null,
      StackId: EXPECTED_STACK,
      Status: "CREATE_COMPLETE",
    };
    const result = reviewProdChangeSet({
      pages: [page],
      expectedArn: ARN,
      stackTemplate: { TemplateBody: templates.stackTemplate },
      changeSetTemplate: { TemplateBody: JSON.stringify(templates.changeSetTemplate) },
    });
    assert.equal(result.ok, true, result.message);
  });

  it("preserves stack, account, region, and change-set validation", () => {
    const row = functionChange("ApiFunction");
    const base = {
      ChangeSetId: ARN,
      Changes: [row],
      ExecutionStatus: "AVAILABLE",
      NextToken: null,
      StackId: EXPECTED_STACK,
      Status: "CREATE_COMPLETE",
    };
    const templates = templatesFor([row]);
    const check = (page, pages = [page]) => reviewProdChangeSet({ pages, expectedArn: ARN, ...templates });
    assert.equal(check({ ...base, StackId: EXPECTED_STACK.replace("796174527529", "000000000000") }).message, "Change set identity or status is not acceptable.");
    assert.equal(check({ ...base, Status: "FAILED" }).message, "Change set identity or status is not acceptable.");
    assert.equal(check({ ...base, ChangeSetId: `${ARN}-other` }).message, "Change set identity or status is not acceptable.");
    assert.equal(check({ ...base, Unexpected: true }).message, "describe-change-set returned an unexpected field set.");
    assert.equal(check({ ...base, Changes: [] }).message, "Rejected resource change none.");
    assert.equal(check({ ...base, NextToken: "more" }).message, "The final change-set page still has NextToken.");
    assert.equal(check({ ...base, NextToken: null }, [{ ...base, NextToken: null }, base]).message, "Change-set pagination stopped before the final page.");
  });

  it("rejects added and deleted resources", () => {
    const added = functionChange("ApiFunction");
    added.Action = "Add";
    assert.equal(review(added).ok, false);
    const removed = permissionChange("SesEmailCronFunctionEveryMinuteSesQueuePermission");
    removed.Action = "Remove";
    assert.equal(review(removed).ok, false);
  });

  it("keeps the workflow review fail-closed and Stage A non-executing", () => {
    const stageA = workflow.slice(workflow.indexOf("  deploy-api:"), workflow.indexOf("  deploy-dev-api:"));
    const verify = workflow.slice(workflow.indexOf("  verify-prod-changeset:"), workflow.indexOf("  execute-prod-changeset:"));
    const execute = workflow.slice(workflow.indexOf("  execute-prod-changeset:"));
    assert.equal(workflow.split("hr-ecom-prod-changeset-review.mjs").length - 1, 3);
    assert.match(stageA, /sam deploy --no-execute-changeset --config-env prod/);
    assert.equal(stageA.includes("aws cloudformation execute-change-set"), false);
    assert.match(verify, /hr-ecom-prod-changeset-review\.mjs/);
    assert.match(execute, /environment: hr-ecom-prod-changeset/);
    assert.match(execute, /aws cloudformation execute-change-set --stack-name hr-ecom-prod --change-set-name "\$CHANGE_SET_ARN"/);
    assert.equal(workflow.toLowerCase().includes("apigatewayv2"), false);
    const queries = workflow.match(/QUERY='[^']*'/g);
    assert.equal(queries.length, 3);
    for (const query of queries) {
      assert.equal(query.includes("Parameter"), false);
      assert.match(query, /Details:Details\[\]\.\{Attribute:Target\.Attribute/);
    }
  });

  it("accepts JSON template bodies and rejects YAML, malformed JSON, and mismatched properties", () => {
    const row = functionChange("ApiFunction");
    const templates = templatesFor([row]);
    const page = {
      ChangeSetId: ARN,
      Changes: [row],
      ExecutionStatus: "AVAILABLE",
      NextToken: null,
      StackId: EXPECTED_STACK,
      Status: "CREATE_COMPLETE",
    };
    const jsonString = reviewProdChangeSet({
      pages: [page],
      expectedArn: ARN,
      stackTemplate: { StagesAvailable: ["Original", "Processed"], TemplateBody: JSON.stringify(templates.stackTemplate) },
      changeSetTemplate: { StagesAvailable: ["Original", "Processed"], TemplateBody: JSON.stringify(templates.changeSetTemplate) },
    });
    assert.equal(jsonString.ok, true, jsonString.message);
    const changed = JSON.parse(JSON.stringify(templates.changeSetTemplate));
    changed.Resources.ApiFunction.Properties.Timeout = 9;
    const mismatched = reviewProdChangeSet({
      pages: [page],
      expectedArn: ARN,
      stackTemplate: { TemplateBody: JSON.stringify(templates.stackTemplate) },
      changeSetTemplate: { TemplateBody: JSON.stringify(changed) },
    });
    assert.equal(mismatched.ok, false);
    assert.equal(mismatched.rejectedId, "ApiFunction");
    const yaml = [
      "AWSTemplateFormatVersion: '2010-09-09'",
      "Resources:",
      "  ApiFunction:",
      "    Type: AWS::Lambda::Function",
      "    Properties:",
      "      Timeout: 30",
      "      Code:",
      "        S3Key: old",
    ].join("\n");
    const yamlBody = reviewProdChangeSet({
      pages: [page],
      expectedArn: ARN,
      stackTemplate: { StagesAvailable: ["Original", "Processed"], TemplateBody: yaml },
      changeSetTemplate: { StagesAvailable: ["Original", "Processed"], TemplateBody: yaml },
    });
    assert.equal(yamlBody.ok, false);
    assert.equal(yamlBody.message, "Processed template comparison is unavailable.");
    const malformed = reviewProdChangeSet({
      pages: [page],
      expectedArn: ARN,
      stackTemplate: { TemplateBody: "{not-json" },
      changeSetTemplate: { TemplateBody: templates.changeSetTemplate },
    });
    assert.equal(malformed.ok, false);
    assert.equal(malformed.message, "Processed template comparison is unavailable.");
    const missingResources = reviewProdChangeSet({
      pages: [page],
      expectedArn: ARN,
      stackTemplate: { TemplateBody: { AWSTemplateFormatVersion: "2010-09-09" } },
      changeSetTemplate: templates.changeSetTemplate,
    });
    assert.equal(missingResources.ok, false);
    assert.equal(missingResources.message, "Processed template comparison is unavailable.");
  });

  it("rejects from the CLI when a processed template file is missing", () => {
    const dir = mkdtempSync(path.join(tmpdir(), "hr-ecom-review-"));
    writeFileSync(path.join(dir, "page-count"), "1");
    writeFileSync(path.join(dir, "page-1.json"), JSON.stringify({
      ChangeSetId: ARN,
      Changes: [functionChange("ApiFunction")],
      ExecutionStatus: "AVAILABLE",
      NextToken: null,
      StackId: EXPECTED_STACK,
      Status: "CREATE_COMPLETE",
    }));
    const result = spawnSync(process.execPath, [fileURLToPath(new URL("./hr-ecom-prod-changeset-review.mjs", import.meta.url)), dir], { encoding: "utf8" });
    assert.equal(result.status, 1);
    assert.match(result.stderr, /Processed template comparison is unavailable/);
    assert.equal(result.stderr.includes("Timeout"), false);
  });

  it("reads the JSON get-template wrapper and rejects YAML or malformed files", () => {
    const script = fileURLToPath(new URL("./hr-ecom-prod-changeset-review.mjs", import.meta.url));
    const row = functionChange("BounceSyncFunction");
    const templates = templatesFor([row]);
    const page = {
      ChangeSetId: ARN,
      Changes: [row],
      ExecutionStatus: "AVAILABLE",
      NextToken: null,
      StackId: EXPECTED_STACK,
      Status: "CREATE_COMPLETE",
    };
    const run = (stackDocument, changeDocument) => {
      const dir = mkdtempSync(path.join(tmpdir(), "hr-ecom-template-"));
      writeFileSync(path.join(dir, "page-count"), "1");
      writeFileSync(path.join(dir, "page-1.json"), JSON.stringify(page));
      writeFileSync(path.join(dir, "stack-template.json"), stackDocument);
      writeFileSync(path.join(dir, "change-template.json"), changeDocument);
      return spawnSync(process.execPath, [script, dir], {
        encoding: "utf8",
        env: { ...process.env, CHANGE_SET_ARN: ARN },
      });
    };
    const accepted = run(
      JSON.stringify({ StagesAvailable: ["Original", "Processed"], TemplateBody: templates.stackTemplate }),
      JSON.stringify({ StagesAvailable: ["Original", "Processed"], TemplateBody: JSON.stringify(templates.changeSetTemplate) }),
    );
    assert.equal(accepted.status, 0, accepted.stderr);
    const yamlFile = run(
      "AWSTemplateFormatVersion: '2010-09-09'\nResources:\n  BounceSyncFunction:\n    Type: AWS::Lambda::Function\n",
      JSON.stringify({ TemplateBody: templates.changeSetTemplate }),
    );
    assert.equal(yamlFile.status, 1);
    assert.match(yamlFile.stderr, /Processed template comparison is unavailable/);
    const malformedFile = run("{", "{");
    assert.equal(malformedFile.status, 1);
    assert.match(malformedFile.stderr, /Processed template comparison is unavailable/);
    assert.equal((workflow.match(/aws cloudformation get-template --stack-name hr-ecom-prod --template-stage Processed --output json/g) || []).length, 3);
    assert.equal((workflow.match(/aws cloudformation get-template --stack-name hr-ecom-prod --change-set-name "\$CHANGE_SET_ARN" --template-stage Processed --output json/g) || []).length, 3);
  });

  it("removes processed templates after success and failure", () => {
    const trapLines = workflow.split(/\r?\n/).filter((line) => line.includes("trap 'rm -f") && line.includes("change-template.json\"' EXIT"));
    const rmLines = workflow.split(/\r?\n/).filter((line) => line.includes("rm -f ") && line.includes("change-template.json") && !line.includes("trap "));
    assert.equal(trapLines.length, 3);
    assert.equal(rmLines.length, 3);
    assert.equal(new Set(trapLines).size, 1);
    assert.equal(new Set(rmLines).size, 1);
    const windowsBash = "C:\\Program Files\\Git\\bin\\bash.exe";
    const bash = process.platform === "win32" && existsSync(windowsBash) ? windowsBash : "bash";
    const toBash = (value) => value.replace(/\\/g, "/").replace(/^([A-Za-z]):/, (_, drive) => `/${drive.toLowerCase()}`);
    const run = (mode) => {
      const dir = mkdtempSync(path.join(tmpdir(), "hr-ecom-clean-"));
      const scriptPath = path.join(dir, "cleanup.sh");
      const script = [
        "set -euo pipefail",
        "RUNNER_TEMP=\"$1\"",
        "export RUNNER_TEMP",
        "mkdir -p \"$RUNNER_TEMP/changeset-pages\"",
        "printf '%s\\n' page > \"$RUNNER_TEMP/changeset-pages/page-1.json\"",
        "printf '%s\\n' 1 > \"$RUNNER_TEMP/changeset-pages/page-count\"",
        "printf '%s\\n' tok > \"$RUNNER_TEMP/changeset-pages/seen-tokens\"",
        "printf '%s\\n' stack > \"$RUNNER_TEMP/changeset-pages/stack-template.json\"",
        "printf '%s\\n' change > \"$RUNNER_TEMP/changeset-pages/change-template.json\"",
        trapLines[0].trim(),
        "if [ \"$2\" = success ]; then",
        rmLines[0].trim(),
        "  exit 0",
        "fi",
        "printf '%s\\n' partial > \"$RUNNER_TEMP/changeset-pages/stack-template.json\"",
        "false",
        "",
      ].join("\n");
      writeFileSync(scriptPath, script);
      const result = spawnSync(bash, [toBash(scriptPath), toBash(dir), mode], { encoding: "utf8" });
      return { result, leftovers: readdirSync(path.join(dir, "changeset-pages")) };
    };
    const success = run("success");
    assert.equal(success.result.status, 0, success.result.stderr);
    assert.deepEqual(success.leftovers, []);
    const failure = run("failure");
    assert.equal(failure.result.status, 1, failure.result.stderr);
    assert.deepEqual(failure.leftovers, []);
  });
});

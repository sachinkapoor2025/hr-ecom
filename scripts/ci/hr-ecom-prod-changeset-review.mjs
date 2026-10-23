import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const EXPECTED_STACK = "arn:aws:cloudformation:us-east-1:796174527529:stack/hr-ecom-prod/2a108a70-6fef-11f1-b9cd-0ecd986e35d1";

export const FUNCTION_ALLOWLIST = Object.freeze([
  "ApiFunction",
  "VendorApiFunction",
  "ReviewEmailsCronFunction",
  "SesEmailCronFunction",
  "BounceSyncFunction",
  "ImageOptimizeFunction",
]);

/** Generated rule logical ID -> paired function logical ID. */
export const GENERATED_RULES = Object.freeze({
  BounceSyncFunctionHourlyBounceSync: "BounceSyncFunction",
  ImageOptimizeFunctionObjectCreated: "ImageOptimizeFunction",
  ReviewEmailsCronFunctionEmailJobsEvery15Minutes: "ReviewEmailsCronFunction",
  ReviewEmailsCronFunctionRazorpayReconcileHourly: "ReviewEmailsCronFunction",
  ReviewEmailsCronFunctionTrackingSyncEvery15Minutes: "ReviewEmailsCronFunction",
  SesEmailCronFunctionEveryMinuteSesQueue: "SesEmailCronFunction",
});

/** Generated permission logical ID -> paired rule logical ID. */
export const GENERATED_PERMISSIONS = Object.freeze({
  BounceSyncFunctionHourlyBounceSyncPermission: "BounceSyncFunctionHourlyBounceSync",
  ImageOptimizeFunctionObjectCreatedPermission: "ImageOptimizeFunctionObjectCreated",
  ReviewEmailsCronFunctionEmailJobsEvery15MinutesPermission: "ReviewEmailsCronFunctionEmailJobsEvery15Minutes",
  ReviewEmailsCronFunctionRazorpayReconcileHourlyPermission: "ReviewEmailsCronFunctionRazorpayReconcileHourly",
  ReviewEmailsCronFunctionTrackingSyncEvery15MinutesPermission: "ReviewEmailsCronFunctionTrackingSyncEvery15Minutes",
  SesEmailCronFunctionEveryMinuteSesQueuePermission: "SesEmailCronFunctionEveryMinuteSesQueue",
});

/** Generated API logical ID -> paired function logical ID. */
export const GENERATED_APIS = Object.freeze({
  HttpApi: "ApiFunction",
  VendorHttpApi: "VendorApiFunction",
});

const CHANGE_FIELDS = ["Action", "Details", "LogicalResourceId", "Replacement", "ResourceType"];
const DETAIL_FIELDS = ["Attribute", "CausingEntity", "ChangeSource", "Evaluation", "Name", "RequiresRecreation"];
const PAGE_FIELDS = ["ChangeSetId", "Changes", "ExecutionStatus", "NextToken", "StackId", "Status"];

const FUNCTION_DETAIL = Object.freeze({
  Attribute: "Properties",
  CausingEntity: null,
  ChangeSource: "DirectModification",
  Evaluation: "Static",
  Name: "Code",
  RequiresRecreation: "Never",
});

function exactKeys(value, keys) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const actual = Object.keys(value).sort();
  const expected = [...keys].sort();
  return actual.length === expected.length && actual.every((key, index) => key === expected[index]);
}

function stable(value) {
  return JSON.stringify(value, (_key, nested) => {
    if (!nested || typeof nested !== "object" || Array.isArray(nested)) return nested;
    return Object.fromEntries(Object.keys(nested).sort().map((key) => [key, nested[key]]));
  });
}

function detailMatches(detail, expected) {
  return exactKeys(detail, DETAIL_FIELDS) && DETAIL_FIELDS.every((key) => detail[key] === expected[key]);
}

function oneDetail(change, expected) {
  return Array.isArray(change.Details) && change.Details.length === 1 && detailMatches(change.Details[0], expected);
}

export function templateResources(document) {
  if (!document || typeof document !== "object") {
    throw new Error("Processed template comparison is unavailable.");
  }
  const body = Object.prototype.hasOwnProperty.call(document, "TemplateBody") ? document.TemplateBody : document;
  let template = body;
  if (typeof body === "string") {
    // Processed SAM templates are JSON. The review jobs do not have a CloudFormation-aware YAML parser.
    const trimmed = body.trim();
    if (!trimmed.startsWith("{")) {
      throw new Error("Processed template comparison is unavailable.");
    }
    template = JSON.parse(trimmed);
  }
  if (!template || typeof template !== "object" || !template.Resources || typeof template.Resources !== "object" || Array.isArray(template.Resources)) {
    throw new Error("Processed template comparison is unavailable.");
  }
  return template.Resources;
}

function withoutCode(resource) {
  const copy = JSON.parse(JSON.stringify(resource));
  if (copy?.Properties && Object.prototype.hasOwnProperty.call(copy.Properties, "Code")) {
    delete copy.Properties.Code;
  }
  return copy;
}

function resourcesMatch(stackResources, proposedResources, logicalId, { ignoreCode = false } = {}) {
  if (!Object.prototype.hasOwnProperty.call(stackResources, logicalId)) return false;
  if (!Object.prototype.hasOwnProperty.call(proposedResources, logicalId)) return false;
  const left = stackResources[logicalId];
  const right = proposedResources[logicalId];
  if (ignoreCode) return stable(withoutCode(left)) === stable(withoutCode(right));
  return stable(left) === stable(right);
}

function isApprovedFunction(change) {
  return exactKeys(change, CHANGE_FIELDS)
    && change.Action === "Modify"
    && change.ResourceType === "AWS::Lambda::Function"
    && FUNCTION_ALLOWLIST.includes(change.LogicalResourceId)
    && String(change.Replacement).toLowerCase() === "false"
    && oneDetail(change, FUNCTION_DETAIL);
}

function dependencyDetail(name, requiresRecreation) {
  return {
    Attribute: "Properties",
    CausingEntity: null,
    ChangeSource: "ResourceAttribute",
    Evaluation: "Dynamic",
    Name: name,
    RequiresRecreation: requiresRecreation,
  };
}

function isApprovedRule(change) {
  const paired = GENERATED_RULES[change.LogicalResourceId];
  if (!paired) return false;
  const expected = dependencyDetail("Targets", "Never");
  expected.CausingEntity = `${paired}.Arn`;
  return exactKeys(change, CHANGE_FIELDS)
    && change.Action === "Modify"
    && change.ResourceType === "AWS::Events::Rule"
    && change.Replacement === "False"
    && oneDetail(change, expected);
}

function isApprovedPermission(change) {
  const paired = GENERATED_PERMISSIONS[change.LogicalResourceId];
  if (!paired) return false;
  const expected = dependencyDetail("SourceArn", "Always");
  expected.CausingEntity = `${paired}.Arn`;
  return exactKeys(change, CHANGE_FIELDS)
    && change.Action === "Modify"
    && change.ResourceType === "AWS::Lambda::Permission"
    && change.Replacement === "Conditional"
    && oneDetail(change, expected);
}

function isApprovedApi(change) {
  const paired = GENERATED_APIS[change.LogicalResourceId];
  if (!paired) return false;
  const expected = dependencyDetail("Body", "Never");
  expected.CausingEntity = `${paired}.Arn`;
  return exactKeys(change, CHANGE_FIELDS)
    && change.Action === "Modify"
    && change.ResourceType === "AWS::ApiGatewayV2::Api"
    && change.Replacement === "False"
    && oneDetail(change, expected);
}

function acceptChange(change, stackResources, proposedResources) {
  if (isApprovedFunction(change)) {
    return resourcesMatch(stackResources, proposedResources, change.LogicalResourceId, { ignoreCode: true });
  }
  if (isApprovedRule(change) || isApprovedPermission(change) || isApprovedApi(change)) {
    return resourcesMatch(stackResources, proposedResources, change.LogicalResourceId);
  }
  return false;
}

/**
 * Fail closed unless every row is an approved function code update or a reviewed
 * generated dependency whose processed template resource is unchanged.
 */
export function reviewProdChangeSet({ pages, expectedArn, stackTemplate, changeSetTemplate }) {
  if (!Array.isArray(pages) || pages.length < 1 || !pages.every((page) => page && typeof page === "object")) {
    return { ok: false, rejectedId: "none", message: "No change-set pages were collected." };
  }
  const changes = [];
  for (let index = 0; index < pages.length; index += 1) {
    const page = pages[index];
    if (!exactKeys(page, PAGE_FIELDS)) {
      return { ok: false, rejectedId: "none", message: "describe-change-set returned an unexpected field set." };
    }
    if (page.ChangeSetId !== expectedArn || page.StackId !== EXPECTED_STACK || page.Status !== "CREATE_COMPLETE" || page.ExecutionStatus !== "AVAILABLE") {
      return { ok: false, rejectedId: "none", message: "Change set identity or status is not acceptable." };
    }
    if (!Array.isArray(page.Changes)) {
      return { ok: false, rejectedId: "none", message: "Change set page did not contain a resource-change list." };
    }
    const hasNext = typeof page.NextToken === "string" && page.NextToken !== "";
    if (index < pages.length - 1 && !hasNext) {
      return { ok: false, rejectedId: "none", message: "Change-set pagination stopped before the final page." };
    }
    if (index === pages.length - 1 && page.NextToken) {
      return { ok: false, rejectedId: "none", message: "The final change-set page still has NextToken." };
    }
    changes.push(...page.Changes);
  }
  if (changes.length === 0) {
    return { ok: false, rejectedId: "none", message: "Rejected resource change none.", changes };
  }
  let stackResources;
  let proposedResources;
  try {
    stackResources = templateResources(stackTemplate);
    proposedResources = templateResources(changeSetTemplate);
  } catch {
    return { ok: false, rejectedId: "none", message: "Processed template comparison is unavailable." };
  }
  const rejected = changes.filter((change) => !acceptChange(change, stackResources, proposedResources));
  if (rejected.length !== 0) {
    const rejectedId = rejected[0] && rejected[0].LogicalResourceId ? rejected[0].LogicalResourceId : "none";
    return { ok: false, rejectedId, message: `Rejected resource change ${rejectedId}.`, changes };
  }
  return { ok: true, rejectedId: null, message: "", changes };
}

function isDirectRun() {
  const entry = process.argv[1];
  if (!entry) return false;
  return fileURLToPath(import.meta.url) === entry;
}

function writeSummary(pageCount, changes, passed) {
  if (process.env.WRITE_SUMMARY !== "1" || !process.env.GITHUB_STEP_SUMMARY) return;
  const stageA = process.env.SUMMARY_KIND === "stage-a";
  const lines = [
    stageA ? "### Stage A change set" : "### Reviewed production change set",
    "",
    stageA
      ? "This change-set ARN is unapproved for execution outside Stage B."
      : "This review does not execute the change set. Environment approval is still required.",
    "",
    "Executing this change set permanently associates `arn:aws:iam::796174527529:role/hr-ecom-prod-cloudformation-exec` with `hr-ecom-prod`. That association cannot be removed.",
    "",
    `- change_set_arn=\`${process.env.CHANGE_SET_ARN}\``,
    "- execution_approval=unapproved-outside-stage-b",
    `- StackId: \`${EXPECTED_STACK}\``,
    "- Status: CREATE_COMPLETE",
    "- ExecutionStatus: AVAILABLE",
    `- Pages: ${pageCount}`,
    `- review_result=${passed ? "allowlist-passed" : "rejected"}`,
    "",
    "| Action | Logical ID | Resource type | Replacement |",
    "| --- | --- | --- | --- |",
    ...changes.map((change) => `| ${change.Action || ""} | ${change.LogicalResourceId || ""} | ${change.ResourceType || ""} | ${change.Replacement ?? ""} |`),
    "",
  ];
  fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${lines.join("\n")}\n`);
}

if (isDirectRun()) {
  let pages = [];
  let result;
  try {
    const pageDir = process.argv[2];
    const pageCount = Number(fs.readFileSync(path.join(pageDir, "page-count"), "utf8"));
    if (!Number.isInteger(pageCount) || pageCount < 1) {
      throw new Error("pages");
    }
    pages = [];
    for (let index = 1; index <= pageCount; index += 1) {
      pages.push(JSON.parse(fs.readFileSync(path.join(pageDir, `page-${index}.json`), "utf8")));
    }
    const stackTemplate = JSON.parse(fs.readFileSync(path.join(pageDir, "stack-template.json"), "utf8"));
    const changeSetTemplate = JSON.parse(fs.readFileSync(path.join(pageDir, "change-template.json"), "utf8"));
    result = reviewProdChangeSet({
      pages,
      expectedArn: process.env.CHANGE_SET_ARN,
      stackTemplate,
      changeSetTemplate,
    });
  } catch {
    console.error("::error::Processed template comparison is unavailable.");
    process.exit(1);
  }
  if (Array.isArray(result.changes)) writeSummary(pages.length, result.changes, result.ok);
  if (!result.ok) {
    console.error(`::error::${result.message}`);
    process.exit(1);
  }
  if (process.env.GITHUB_OUTPUT) {
    fs.appendFileSync(process.env.GITHUB_OUTPUT, `change_set_arn=${process.env.CHANGE_SET_ARN}\n`);
  }
}

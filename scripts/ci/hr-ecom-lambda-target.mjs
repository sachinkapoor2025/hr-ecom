import { fileURLToPath } from "node:url";

/** Explicit DEV functions from infrastructure/template.yaml with Environment=dev. */
export const HR_ECOM_DEV_FUNCTIONS = Object.freeze([
  "hr-ecom-api-dev",
  "hr-ecom-ses-email-dev",
]);

/**
 * Fail closed unless the name is one explicit hr-ecom DEV function.
 * Blank, multi-value, and any BlossomPot name are rejected.
 */
export function assertHrEcomLambdaTarget(name) {
  if (typeof name !== "string" || name.trim() === "") {
    throw new Error("Lambda function name is blank.");
  }
  if (name !== name.trim() || /[\s,]/.test(name)) {
    throw new Error("Lambda function name is ambiguous.");
  }
  const lower = name.toLowerCase();
  if (lower.startsWith("blossompot-") || lower.includes("blossompot")) {
    throw new Error("Refusing BlossomPot Lambda target.");
  }
  if (!/^hr-ecom-[a-z0-9-]+$/.test(name)) {
    throw new Error("Lambda function name is not an hr-ecom function.");
  }
  if (!HR_ECOM_DEV_FUNCTIONS.includes(name)) {
    throw new Error("Lambda function name is not an explicit hr-ecom DEV target.");
  }
  return name;
}

function isDirectRun() {
  const entry = process.argv[1];
  if (!entry) return false;
  return fileURLToPath(import.meta.url) === entry;
}

if (isDirectRun()) {
  const names = process.argv.slice(2);
  if (names.length === 0) {
    console.error("No Lambda function name was provided.");
    process.exit(1);
  }
  try {
    for (const name of names) assertHrEcomLambdaTarget(name);
  } catch (err) {
    console.error(err instanceof Error ? err.message : "Lambda target rejected.");
    process.exit(1);
  }
}

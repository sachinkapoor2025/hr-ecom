/** Normalize Cognito `cognito:groups` (array or single string). */
export function cognitoGroupList(groups: unknown): string[] {
  if (Array.isArray(groups)) return groups.map((g) => String(g));
  if (typeof groups === "string" && groups.trim()) return [groups];
  return [];
}

export function cognitoHasGroup(groups: unknown, name: string): boolean {
  const want = name.trim().toLowerCase();
  if (!want) return false;
  return cognitoGroupList(groups).some((g) => g.trim().toLowerCase() === want);
}

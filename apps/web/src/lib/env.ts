function readEnv(name: string, fallback: string): string {
  const value = process.env[name]?.trim();
  return value ? value : fallback;
}

export const siteUrl = readEnv("NEXT_PUBLIC_SITE_URL", "http://localhost:3000");
export const apiUrl = readEnv("NEXT_PUBLIC_API_URL", "http://localhost:3001");

const tokens = new Set<string>();

export function createToken(): string {
  const token = crypto.randomUUID();
  tokens.add(token);
  return token;
}

export function isValidToken(token: string | undefined): boolean {
  if (!token) return false;
  return tokens.has(token);
}

export function removeToken(token: string): void {
  tokens.delete(token);
}

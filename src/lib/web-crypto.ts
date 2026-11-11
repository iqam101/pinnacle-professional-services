const PBKDF2_ITERATIONS = 100000;
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

export const ADMIN_SESSION_COOKIE_NAME = "pinnacle_admin_session";
export const ADMIN_SESSION_MAX_AGE_SECONDS = SESSION_MAX_AGE_SECONDS;

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

function hexToBytes(hex: string): Uint8Array {
  const clean = hex.trim();
  const out = new Uint8Array(clean.length / 2);
  for (let i = 0; i < out.length; i++) {
    out[i] = Number.parseInt(clean.slice(i * 2, i * 2 + 2), 16);
  }
  return out;
}

function encodeBase64Url(input: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < input.length; i++) {
    binary += String.fromCharCode(input[i]);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function decodeBase64Url(input: string): Uint8Array {
  const padded = input.replace(/-/g, "+").replace(/_/g, "/");
  const mod = padded.length % 4;
  const full = mod === 0 ? padded : padded + "=".repeat(4 - mod);
  const binary = atob(full);
  const out = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    out[i] = binary.charCodeAt(i);
  }
  return out;
}

export function timingSafeEqualBytes(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a[i] ^ b[i];
  }
  return diff === 0;
}

export function randomHex(byteCount: number): string {
  const buf = new Uint8Array(byteCount);
  globalThis.crypto.getRandomValues(buf);
  return bytesToHex(buf);
}

export async function hashPasswordPbkdf2(
  password: string,
  saltHex?: string
): Promise<string> {
  const usedSalt = saltHex || randomHex(16);
  const encoder = new TextEncoder();
  const key = await globalThis.crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );
  const bits = await globalThis.crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: hexToBytes(usedSalt) as BufferSource,
      iterations: PBKDF2_ITERATIONS,
      hash: "SHA-256",
    },
    key,
    256
  );
  return `pbkdf2$${PBKDF2_ITERATIONS}$${usedSalt}$${bytesToHex(new Uint8Array(bits))}`;
}

export async function verifyPasswordPbkdf2(
  password: string,
  stored: string
): Promise<boolean> {
  if (!stored.startsWith("pbkdf2$")) return false;
  const parts = stored.split("$");
  if (parts.length !== 4) return false;
  const iterations = Number(parts[1]);
  const saltHex = parts[2];
  const hashHex = parts[3];
  if (!Number.isFinite(iterations) || iterations < 1000 || !saltHex || !hashHex) {
    return false;
  }
  const encoder = new TextEncoder();
  const key = await globalThis.crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );
  const bits = await globalThis.crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: hexToBytes(saltHex) as BufferSource,
      iterations,
      hash: "SHA-256",
    },
    key,
    (hashHex.length / 2) * 8
  );
  return timingSafeEqualBytes(new Uint8Array(bits), hexToBytes(hashHex));
}

async function importHmacKey(secret: string): Promise<CryptoKey> {
  return globalThis.crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

export async function createWebSessionToken(
  username: string,
  secret: string
): Promise<string> {
  const exp = Math.floor(Date.now() / 1000) + SESSION_MAX_AGE_SECONDS;
  const payloadBytes = new TextEncoder().encode(
    JSON.stringify({ u: username, exp })
  );
  const payloadB64 = encodeBase64Url(payloadBytes);
  const key = await importHmacKey(secret);
  const sigBuf = await globalThis.crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(payloadB64)
  );
  const sigB64 = encodeBase64Url(new Uint8Array(sigBuf));
  return `${payloadB64}.${sigB64}`;
}

export async function verifyWebSessionToken(
  token: string | undefined,
  secret: string
): Promise<{ username: string } | null> {
  if (!token || !secret) return null;
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [payloadB64, sigB64] = parts;
  if (!payloadB64 || !sigB64) return null;
  try {
    const key = await importHmacKey(secret);
    const sigBytes = decodeBase64Url(sigB64);
    const valid = await globalThis.crypto.subtle.verify(
      "HMAC",
      key,
      sigBytes as BufferSource,
      new TextEncoder().encode(payloadB64)
    );
    if (!valid) return null;
    const payloadJson = new TextDecoder().decode(decodeBase64Url(payloadB64));
    const payload = JSON.parse(payloadJson) as { u?: string; exp?: number };
    if (!payload.u || !payload.exp) return null;
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return { username: payload.u };
  } catch {
    return null;
  }
}

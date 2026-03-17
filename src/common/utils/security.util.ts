import { randomInt, timingSafeEqual, randomUUID, createHash, createHmac } from 'crypto';

export function generateOtp(): string {
  const otp = randomInt(0, 1000000);
  return otp.toString().padStart(6, '0');
}

export function compareOtp(provided: string, stored: string): boolean {
  try {
    const providedBuffer = Buffer.from(provided.padStart(6, '0'));
    const storedBuffer = Buffer.from(stored.padStart(6, '0'));
    if (providedBuffer.length !== storedBuffer.length) return false;
    return timingSafeEqual(providedBuffer, storedBuffer);
  } catch {
    return false;
  }
}

export function generateToken(): string {
  return randomUUID();
}

export function hashRefreshToken(token: string, secret: string): string {
  return createHmac('sha256', secret).update(token).digest('hex');
}

export function verifyRefreshToken(rawToken: string, storedHash: string, secret: string): boolean {
  try {
    const incomingHash = hashRefreshToken(rawToken, secret);
    const a = Buffer.from(incomingHash);
    const b = Buffer.from(storedHash);
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

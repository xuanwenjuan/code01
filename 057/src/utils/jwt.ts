import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { createHash } from 'crypto';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';
const JWT_REFRESH_EXPIRES_IN = '7d';

const tokenBlacklist = new Set<string>();

export interface TokenPayload {
  userId: number;
  username: string;
  role: string;
  employeeId?: number;
  tokenVersion: number;
}

export interface LoginTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

const getTokenHash = (token: string): string => {
  return createHash('sha256').update(token).digest('hex');
};

export const generateToken = (payload: Omit<TokenPayload, 'tokenVersion'>): string => {
  const fullPayload: TokenPayload = { ...payload, tokenVersion: 1 };
  return jwt.sign(fullPayload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

export const generateLoginTokens = (payload: Omit<TokenPayload, 'tokenVersion'>): LoginTokens => {
  const fullPayload: TokenPayload = { ...payload, tokenVersion: 1 };
  const accessToken = jwt.sign(fullPayload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  const refreshToken = jwt.sign(fullPayload, JWT_SECRET, { expiresIn: JWT_REFRESH_EXPIRES_IN });
  
  const decoded = jwt.decode(accessToken) as { exp: number };
  const expiresIn = decoded.exp - Math.floor(Date.now() / 1000);
  
  return { accessToken, refreshToken, expiresIn };
};

export const verifyToken = (token: string): TokenPayload => {
  const tokenHash = getTokenHash(token);
  if (tokenBlacklist.has(tokenHash)) {
    throw new Error('Token已被注销');
  }
  
  return jwt.verify(token, JWT_SECRET) as TokenPayload;
};

export const refreshAccessToken = (refreshToken: string): LoginTokens => {
  const tokenHash = getTokenHash(refreshToken);
  if (tokenBlacklist.has(tokenHash)) {
    throw new Error('Refresh Token已被注销');
  }
  
  const decoded = jwt.verify(refreshToken, JWT_SECRET) as TokenPayload;
  
  const newPayload: Omit<TokenPayload, 'tokenVersion'> = {
    userId: decoded.userId,
    username: decoded.username,
    role: decoded.role,
    employeeId: decoded.employeeId,
  };
  
  return generateLoginTokens(newPayload);
};

export const revokeToken = (token: string): void => {
  const tokenHash = getTokenHash(token);
  tokenBlacklist.add(tokenHash);
};

export const isTokenExpired = (token: string): boolean => {
  try {
    const decoded = jwt.decode(token) as { exp: number };
    if (!decoded || !decoded.exp) {
      return true;
    }
    return Date.now() >= decoded.exp * 1000;
  } catch {
    return true;
  }
};

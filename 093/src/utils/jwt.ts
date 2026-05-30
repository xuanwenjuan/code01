import jwt from 'jsonwebtoken';
import { env } from '../config/environment';
import { JwtPayload, UserRole } from '../types';

export class JwtUtil {
  static generateToken(userId: number, username: string, role: UserRole): string {
    const payload: JwtPayload = { userId, username, role };
    return jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN,
    });
  }

  static verifyToken(token: string): JwtPayload {
    try {
      return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    } catch (error) {
      throw new Error('无效的令牌');
    }
  }
}

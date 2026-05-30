import jwt from 'jsonwebtoken';
import { jwtConfig } from '../config/jwt';
import { JwtPayload, UserRole } from '../types';

export class JwtUtil {
  static generateToken(userId: number, username: string, role: UserRole): string {
    const payload: JwtPayload = { userId, username, role };
    return jwt.sign(payload, jwtConfig.secret, {
      expiresIn: jwtConfig.expiresIn,
    });
  }

  static verifyToken(token: string): JwtPayload {
    try {
      return jwt.verify(token, jwtConfig.secret) as JwtPayload;
    } catch (error) {
      throw new Error('无效的令牌');
    }
  }

  static decodeToken(token: string): JwtPayload | null {
    try {
      return jwt.decode(token) as JwtPayload;
    } catch (error) {
      return null;
    }
  }
}

export default JwtUtil;

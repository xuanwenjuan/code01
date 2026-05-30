import jwt from 'jsonwebtoken';
import { config } from '../config';
import { IUserPayload, UserRole } from '../types/common';

export const generateToken = (payload: IUserPayload): string => {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });
};

export const verifyToken = (token: string): IUserPayload => {
  return jwt.verify(token, config.jwt.secret) as IUserPayload;
};

export const hashPassword = async (password: string): Promise<string> => {
  const bcrypt = require('bcryptjs');
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

export const comparePassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  const bcrypt = require('bcryptjs');
  return bcrypt.compare(password, hashedPassword);
};

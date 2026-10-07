import jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const SECRET = process.env.JWT_SECRET || 'fallback-secret';

export const signToken = (payload: object, expiresIn: string = '24h') => {
  return jwt.sign(payload, SECRET, { expiresIn });
};

export const verifyToken = (token: string) => {
  return jwt.verify(token, SECRET);
};

import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';

export interface AuthRequest extends Request {
  user?: any;
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};

export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  authenticate(req, res, () => {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }
    next();
  });
};

export const requireParticipant = (req: AuthRequest, res: Response, next: NextFunction) => {
  authenticate(req, res, () => {
    if (req.user?.role !== 'participant') {
      return res.status(403).json({ error: 'Forbidden: Participant access required' });
    }
    next();
  });
};

export const requireVoter = (req: AuthRequest, res: Response, next: NextFunction) => {
  authenticate(req, res, () => {
    if (req.user?.role !== 'voter') {
      return res.status(403).json({ error: 'Forbidden: Voter access required' });
    }
    next();
  });
};

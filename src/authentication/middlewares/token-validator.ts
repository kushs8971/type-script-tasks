import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { MissingTokenResponse, ExpiredTokenResponse, InvalidTokenResponse } from '../../response/token-response';

const JWT_SECRET = process.env.JWT_SECRET;

export const validateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(MissingTokenResponse.statusCode).json(MissingTokenResponse);
  }

  const token = authHeader.split(' ')[1];

  try {
    jwt.verify(token, JWT_SECRET);
    next();
  } catch (err: any) {
    if (err.name === 'TokenExpiredError') {
      return res.status(ExpiredTokenResponse.statusCode).json(ExpiredTokenResponse);
    }
    return res.status(InvalidTokenResponse.statusCode).json(InvalidTokenResponse);
  }
};
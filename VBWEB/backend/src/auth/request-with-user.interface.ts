// src/auth/request-with-user.interface.ts
import { Request } from 'express';

// Extend Express Request to include `user` from JwtAuthGuard
export interface RequestWithUser extends Request {
  user: {
    userid: string;
    email: string;
    tokenType: string;
  };
}

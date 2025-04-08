// src/auth/auth.service.ts

import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { SupabaseService } from '../supabase/supabase.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Register a new user
   */
  async registerUser(email: string, password: string) {
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
      return await this.supabaseService.createUser(email, hashedPassword);
    } catch (error) {
      // If supabase throws a "duplicate key value" for the "users_gmail_key" ...
      if (
        error.message?.includes('duplicate key value') &&
        error.message?.includes('"users_gmail_key"')
      ) {
        throw new ConflictException(`Email ${email} has already been registered`);
      }
      throw error;
    }
  }

  /**
   * Login an existing user and return JWT
   */
  async loginUser(email: string, password: string) {
    // 1) Check if user exists
    const users = await this.supabaseService.getUserByEmail(email);
    if (!users || users.length === 0) {
      throw new Error('User not found');
    }
    const user = users[0];

    // 2) Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    // 3) Sign a JWT with user info
    const payload = { userID: user.userID, email: user.gmail };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '1h' });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    return { accessToken, refreshToken };
  }

  /**
  * refresh the access token and refresh token
  */
  async refreshAccessToken(refreshToken: string) {
    try {
      const payload = await this.jwtService.verifyAsync(refreshToken);
  
      const user = await this.supabaseService.getUserByEmail(payload.email);
      if (!user || user.length === 0) {
        throw new UnauthorizedException('User no longer exists');
      }
  
      const newPayload = { userID: user[0].userID, email: user[0].gmail };
      const newAccessToken = this.jwtService.sign(newPayload, { expiresIn: '1h' });
      const newRefreshToken = this.jwtService.sign(newPayload, { expiresIn: '7d' });
  
      return { accessToken: newAccessToken, refreshToken: newRefreshToken };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }  
}

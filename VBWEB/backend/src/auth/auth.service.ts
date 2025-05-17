// src/auth/auth.service.ts

import { Injectable, ConflictException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { SupabaseService } from '../supabase/supabase.service';
import { JwtService } from '@nestjs/jwt';
import { OAuth2Client } from 'google-auth-library';

@Injectable()
export class AuthService {
  private googleClient: OAuth2Client;

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly jwtService: JwtService,
  ) {
    this.googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  }

  private signTokens(userID: string, email: string) {
    const accessPayload = { userID, email, tokenType: 'access' };
    const refreshPayload = { userID, email, tokenType: 'refresh' };

    const accessToken = this.jwtService.sign(accessPayload, { expiresIn: '1h' });
    const refreshToken = this.jwtService.sign(refreshPayload, { expiresIn: '7d' });

    return { accessToken, refreshToken, userID };
  }

  async registerUser(email: string, password: string) {
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
      return await this.supabaseService.createUser(email, hashedPassword, 'email');
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
    if (users[0].login_method !== 'email') {
      throw new ConflictException(
        'This account should be login with google'
      );
    }
    // 3) Sign a JWT with user info
    return this.signTokens(user.userid, user.gmail);
  }

  /**
   * Handle Google Sign-In with an ID token (from GSI)
   */
  async googleLogin(idToken: string) {
    if (!idToken) {
      throw new BadRequestException('No Google ID token provided');
    }

    // Verify the token with Google
    let payload;
    try {
      const ticket = await this.googleClient.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      payload = ticket.getPayload();
    } catch (err) {
      throw new UnauthorizedException('Invalid Google ID token');
    }

    const email = payload?.email;
    if (!email) {
      throw new UnauthorizedException('Google token did not contain an email');
    }

    // Lookup or create the user
    let users = await this.supabaseService.getUserByEmail(email);
    if (!users?.length) {
      // First-time Google login
      await this.supabaseService.createUser(email, '', 'google');
      users = await this.supabaseService.getUserByEmail(email);
    } else if (users[0].login_method !== 'google') {
      throw new ConflictException(
        'This email is already registered with a password. Please log in with your password.'
      );
    }

    return this.signTokens(users[0].userid, users[0].gmail);
  }

  /**
  * refresh the access token and refresh token
  */
  async refreshAccessToken(refreshToken: string) {
    try {
      const payload = await this.jwtService.verifyAsync(refreshToken);
      const users = await this.supabaseService.getUserByEmail(payload.email);
      if (!users?.length) {
        throw new UnauthorizedException('User no longer exists');
      }
      return this.signTokens(users[0].userid, users[0].gmail);
    } catch (err) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}

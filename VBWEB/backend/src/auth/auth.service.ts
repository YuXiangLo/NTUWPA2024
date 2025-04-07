// src/auth/auth.service.ts

import { Injectable, ConflictException } from '@nestjs/common';
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
    const accessToken = this.jwtService.sign(payload);

    return { accessToken };
  }

  /**
   * Used by JwtStrategy to validate a user by email (or any ID).
   */
  async findByEmail(email: string): Promise<any> {
    const users = await this.supabaseService.getUserByEmail(email);
    return users && users.length > 0 ? users[0] : undefined;
  }
}

// src/user/user.service.ts
import { Injectable, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { SupabaseService } from '../supabase/supabase.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UserService {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async registerUser(email: string, password: string) {
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
      return await this.supabaseService.createUser(email, hashedPassword);
    } catch (error) {
      if (
        error.message?.includes('duplicate key value') &&
        error.message?.includes('"users_gmail_key"')
      ) {
        throw new ConflictException(`Email ${email} has already been registered`);
      }

      throw error; // let the controller handle other errors
    }
  }

  async loginUser(email: string, password: string) {
    // Get user from Supabase
    const users = await this.supabaseService.getUserByEmail(email);
    if (!users || users.length === 0) {
      throw new Error('User not found');
    }

    const user = users[0];

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    // Create and return JWT
    const payload = { userID: user.userID, email: user.gmail };

    // Use ConfigService to get the JWT_SECRET from .env file
    const secret = this.configService.get<string>('JWT_SECRET');  // Access JWT_SECRET from .env file
    if (!secret) {
      throw new Error('JWT_SECRET is not defined in the environment variables');
    }

    const accessToken = this.jwtService.sign(payload, { secret });  // Pass secret to the sign method

    return { accessToken };
  }
}


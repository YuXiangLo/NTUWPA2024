// src/user/user.service.ts
import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { SupabaseService } from '../supabase/supabase.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';  // Import ConfigService

@Injectable()
export class UserService {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly jwtService: JwtService,  // Inject JwtService here
    private readonly configService: ConfigService  // Inject ConfigService to get JWT_SECRET
  ) {}

  async registerUser(email: string, password: string) {
    const hashedPassword = await bcrypt.hash(password, 10);
    return this.supabaseService.createUser(email, hashedPassword);
  }

  // Implement login logic
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

    console.log('Generated JWT:', accessToken);  // Log the token to verify

    return {
      accessToken,
    };
  }
}

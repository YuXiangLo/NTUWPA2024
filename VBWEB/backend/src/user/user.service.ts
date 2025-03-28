// src/user/user.service.ts
import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { SupabaseService } from '../supabase/supabase.service';
import { JwtService } from '@nestjs/jwt';  // Ensure JwtService is imported

@Injectable()
export class UserService {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly jwtService: JwtService,  // Inject JwtService here
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
    const accessToken = this.jwtService.sign(payload);  // Now you can use jwtService here
    return {
      accessToken,
    };
  }
}

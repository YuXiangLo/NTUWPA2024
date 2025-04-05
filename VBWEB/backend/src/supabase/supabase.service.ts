// src/supabase/supabase.service.ts
import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { createClient } from '@supabase/supabase-js';
import { ConfigService } from '@nestjs/config';
import { UpdateUserDto } from 'src/user/dto/update-user.dto';

@Injectable()
export class SupabaseService {
  private supabase;

  constructor(private readonly configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabasePublicKey = this.configService.get<string>('SUPABASE_PUBLIC_KEY');
    if (!supabaseUrl || !supabasePublicKey) {
      throw new Error('Supabase URL or Public Key is not defined in the environment variables');
    }
    this.supabase = createClient(supabaseUrl, supabasePublicKey);
  }

  async createUser(email: string, password: string) {
    const { data, error } = await this.supabase
      .from('users')
      .insert([{ gmail: email, password }]);
    if (error) throw new Error(error.message);
    return data;
  }

  async getUserByEmail(email: string) {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('gmail', email);
    if (error) throw new Error(error.message);
    return data;
  }

  async getUserInfoByUserID(userId: string): Promise<any> {
    const { data, error } = await this.supabase
      .from('users')
      .select(`
        userid,
        gmail,
        lastname,
        firstname,
        nickname,
        phone,
        birthday,
        location,
        level,
        photo,
        created_at,
        updated_at
      `)
      .eq('userid', userId)
      .maybeSingle(); // Retrieves a single row or null

    if (error) {
      throw new Error(`Failed to fetch user info: ${error.message}`);
    }
    return data;
  }

  async updateUserProfile(userId: string, updateData: Partial<UpdateUserDto>): Promise<any> {
    const { data, error } = await this.supabase
      .from('users')
      .update(updateData)
      .eq('userid', userId)
      .select('*') 
      .single(); // Returns the updated record

      if (error) {
        throw new BadRequestException(`Failed to update user profile: ${error.message}`);
      }
      if (!data) {
        throw new NotFoundException('User not found.');
      }
    return data;
  }

  async getAllEmails(): Promise<string[]> {
    const { data, error } = await this.supabase
      .from('users')
      .select('gmail');
  
    if (error) {
      throw new Error(`Failed to fetch emails: ${error.message}`);
    }
  
    return data.map((user) => user.gmail);
  }
  
}

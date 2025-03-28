// src/supabase/supabase.service.ts
import { Injectable } from '@nestjs/common';
import { createClient } from '@supabase/supabase-js';
import { ConfigService } from '@nestjs/config';

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
}

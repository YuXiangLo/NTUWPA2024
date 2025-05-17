// src/supabase/supabase.service.ts
import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { createClient } from '@supabase/supabase-js';
import { ConfigService } from '@nestjs/config';
import { UpdateUserDto } from 'src/user/dto/update-user.dto';

@Injectable()
export class SupabaseService {
  protected supabase;

  constructor(private readonly configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabasePublicKey = this.configService.get<string>('SUPABASE_PUBLIC_KEY');
    const supabaseServiceRoleKey = this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY');
    if (!supabaseUrl || !supabasePublicKey || !supabaseServiceRoleKey) {
      throw new Error('Supabase URL or Public Key is not defined in the environment variables');
    }
    this.supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
  }

  public get client() {
    return this.supabase;
  }

  async createUser(email: string, password: string, login_method: string) {
    const { data, error } = await this.supabase
      .from('users')
      .insert([{ gmail: email, password, login_method }]);
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

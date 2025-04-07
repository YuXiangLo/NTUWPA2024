// src/user/user.service.ts

import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async getUserProfileById(userId: string): Promise<any> {
    return await this.supabaseService.getUserInfoByUserID(userId);
  }

  async updateUserProfile(userId: string, updateData: Partial<UpdateUserDto>): Promise<any> {
    return await this.supabaseService.updateUserProfile(userId, updateData);
  }
}

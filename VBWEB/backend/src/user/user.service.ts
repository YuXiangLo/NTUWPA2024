// src/user/user.service.ts
import {
  Injectable,
  HttpException,
  HttpStatus,
  NotFoundException,
  BadRequestException
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class UserService {
  private client: SupabaseClient;

  constructor(private readonly supabaseService: SupabaseService) {
    this.client = this.supabaseService.client;
  }

  async getUserInfoByUserID(userId: string): Promise<any> {
    const { data, error } = await this.client
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
      .maybeSingle();

    if (error) {
      throw new HttpException(
        `Failed to fetch user info: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
    if (!data) {
      throw new NotFoundException('User not found');
    }
    return data;
  }

  async updateUserProfile(
    userId: string,
    updateData: Partial<UpdateUserDto>
  ): Promise<any> {
    const { data, error } = await this.client
      .from('users')
      .update(updateData)
      .eq('userid', userId)
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
      .single();

    if (error) {
      throw new BadRequestException(`Failed to update profile: ${error.message}`);
    }
    return data;
  }

  /**
   * Upload user photo, remove old one, update users.photo, then return updated record.
   */
  async uploadUserPhoto(
    userId: string,
    file: Express.Multer.File
  ): Promise<any> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    // 1. 讀取現有 photo 欄位並刪除舊檔
    const { data: cur, error: fetchErr } = await this.client
      .from('users')
      .select('photo')
      .eq('userid', userId)
      .maybeSingle();
    if (fetchErr) {
      throw new HttpException(fetchErr.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    if (cur?.photo) {
      const segments = cur.photo.split('/avatars/');
      if (segments.length === 2) {
        const filename = segments[1];
        await this.client.storage.from('avatars').remove([filename]);
      }
    }

    // 2. 上傳新檔案
    const ext = file.originalname.split('.').pop();
    const filePath = `avatars/${userId}.${ext}`;
    const { error: upErr } = await this.client
      .storage
      .from('avatars')
      .upload(filePath, file.buffer, { upsert: true });
    if (upErr) {
      throw new HttpException(upErr.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    // 3. 取得 publicUrl
    const { data: urlData } = this.client
      .storage
      .from('avatars')
      .getPublicUrl(filePath);
    const publicUrl = urlData.publicUrl;
    if (!publicUrl) {
      throw new HttpException(
        'Failed to get public URL',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }

    // 4. 更新 users.photo
    const { error: dbErr } = await this.client
      .from('users')
      .update({ photo: publicUrl })
      .eq('userid', userId);
    if (dbErr) {
      throw new HttpException(dbErr.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    // 5. 回傳完整更新後的使用者資料
    return this.getUserInfoByUserID(userId);
  }
}

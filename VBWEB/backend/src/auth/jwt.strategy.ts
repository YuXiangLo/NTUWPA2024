// src/auth/jwt.strategy.ts

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET')!,
    });
  }

  async findByEmail(email: string): Promise<any> {
    const users = await this.supabaseService.getUserByEmail(email);
    return users && users.length > 0 ? users[0] : undefined;
  }

  async validate(payload: any) {
    const { email, tokenType } = payload;
    const user = await this.findByEmail(email);

    if (tokenType !== 'access') {
      throw new UnauthorizedException('Invalid token type');
    }

    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}

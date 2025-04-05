// src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { JwtStrategy } from './jwt.strategy';
import { UserService } from '../user/user.service';  // Inject UserService for user validation

@Module({
  providers: [JwtStrategy, UserService],  // Register JwtStrategy and UserService
})
export class AuthModule {}

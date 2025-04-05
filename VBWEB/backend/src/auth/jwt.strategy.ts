// src/auth/jwt.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';
import { UserService } from 'src/user/user.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,  // Access JWT secret from ConfigService
    private userService: UserService,     // Optional: If you want to validate user from DB
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),  // Extract JWT from Authorization header
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET')!,  // Secret key for verification
    });
  }

  // The validate method is called when Passport verifies the JWT.
  // The payload is automatically passed by Passport if it's valid.
  async validate(payload: any) {
    const { userID, email } = payload;
    // You can use the userID (or any other data in the payload) to get the user from the database
    const user = await this.userService.findByEmail(email);
    
    if (!user) {
      throw new UnauthorizedException();
    }
    
    return user;  // You can return any custom user object that you want to attach to the request
  }
}

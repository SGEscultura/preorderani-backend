import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';

export interface JwtPayload {
  sub: number;
  email: string;
  role: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'dev-secret',
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.prisma.users.findUnique({
      where: { user_id: payload.sub },
      include: { role: true },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return {
      user_id: user.user_id,
      user_name: user.user_name,
      user_email: user.user_email,
      role_id: user.role_id,
      role: user.role.role_name,
    };
  }
}
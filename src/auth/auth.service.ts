import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existingUser = await this.prisma.users.findUnique({
      where: { user_email: dto.user_email.toLowerCase().trim() },
    });

    if (existingUser) {
      throw new ConflictException('Email is already registered');
    }

    const role = await this.prisma.roles.findUnique({
      where: { role_id: dto.role_id },
    });

    if (!role) {
      throw new BadRequestException('Invalid role_id');
    }

    const hashedPassword = await bcrypt.hash(dto.user_password, 10);

    const user = await this.prisma.users.create({
      data: {
        role_id: dto.role_id,
        user_name: dto.user_name.trim(),
        user_email: dto.user_email.toLowerCase().trim(),
        user_password: hashedPassword,
        user_phone: dto.user_phone?.trim(),
        user_location: dto.user_location?.trim(),
      },
      include: { role: true },
    });

    return this.buildAuthResponse(user);
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.users.findUnique({
      where: { user_email: dto.user_email.toLowerCase().trim() },
      include: { role: true },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(
      dto.user_password,
      user.user_password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return this.buildAuthResponse(user);
  }

  private buildAuthResponse(user: {
    user_id: number;
    user_name: string;
    user_email: string;
    role_id: number;
    role: { role_name: string };
  }) {
    const payload = {
      sub: user.user_id,
      email: user.user_email,
      role: user.role.role_name,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        user_id: user.user_id,
        user_name: user.user_name,
        user_email: user.user_email,
        role_id: user.role_id,
        role: user.role.role_name,
      },
    };
  }
}
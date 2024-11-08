// src/auth/auth.service.ts
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly supabaseService: SupabaseService,
  ) {}

  async signUp(email: string, password: string) {
    await this.ensureUserDoesNotExist(email);
    const hashedPassword = await this.hashPassword(password);
    const user = await this.createUserInDatabase(email, hashedPassword);

    return { message: 'User registered successfully', user };
  }

  async signIn(email: string, password: string) {
    const user = await this.findUserByEmail(email);

    await this.verifyPassword(password, user.password);

    return this.generateToken(user);
  }

  private async ensureUserDoesNotExist(email: string): Promise<void> {
    const { data: existingUser } = await this.supabaseService
      .getClient()
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
    if (existingUser) {
      throw new HttpException('User already exists', HttpStatus.CONFLICT);
    }
  }

  private async createUserInDatabase(email: string, password: string) {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('users')
      .insert([{ email, password }])
      .single();
    if (error) {
      throw new HttpException(
        'Error creating user',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    return data;
  }

  private async findUserByEmail(email: string) {
    const { data: user, error } = await this.supabaseService
      .getClient()
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
    if (!user || error) {
      throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
    }
    return user;
  }

  private async verifyPassword(password: string, hash: string): Promise<void> {
    const isPasswordValid = await bcrypt.compare(password, hash);
    if (!isPasswordValid) {
      throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
    }
  }

  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  private generateToken(user: any) {
    const payload = { username: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}

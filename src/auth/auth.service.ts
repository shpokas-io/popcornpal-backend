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
    const supabase = this.supabaseService.getClient();

    //Check if the user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (existingUser) {
      throw new HttpException('User already exists', HttpStatus.CONFLICT);
    }

    //Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    //insert the new user into the database
    const { data, error } = await supabase
      .from('users')
      .insert([{ email, password: hashedPassword }])
      .single();

    if (error) {
      throw new HttpException(
        'Error creating user',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    return { message: 'User registered successfully', user: data };
  }

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  async validatePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  async generateToken(user: any) {
    const payload = { username: user.username, sub: user.userId };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}

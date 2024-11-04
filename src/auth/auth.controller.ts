/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async signUp(
    @Body('username') username: string,
    @Body('password') password: string,
  ) {
    const hashedPassword = await this.authService.hashPassword(password);
    //HERE IS USER WITH HASHEDPASSWORD
    // const user = await this.userService.create({
    //   username,
    //   password: hashedPassword,
    // });
    return { message: 'User registered successfully' };
  }

  @Post('login')
  async login(
    @Body('username') username: string,
    @Body('password') password: string,
  ) {
    //HEre retvieve the user from database by userName
    const user = { username: 'testuser', password: 'hashed_password_from_db' };

    const isPasswordValid = await this.authService.validatePassword(
      password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
    }
    return this.authService.generateToken(user);
  }
}

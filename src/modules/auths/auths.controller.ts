import { Body, Controller, Get, Post } from '@nestjs/common';
import { AuthsService } from './auths.service';
import { LoginDto, RegisterDto } from './auths.dto';
import { Public } from './auths.guard';
import { User } from '../users/users.decorator';
import { UserType } from 'src/schemas/user.schema';

@Controller('auths')
export class AuthsController {
  constructor(private readonly authsService: AuthsService) {}

  @Public()
  @Post('register')
  async register(@Body() body: RegisterDto) {
    return this.authsService.register(body);
  }

  @Public()
  @Post('login')
  async login(@Body() body: LoginDto) {
    return this.authsService.login(body);
  }

  @Get('is-admin')
  isAdmin(@User() user: any) {
    return user.role === UserType.ADMIN;
  }
}

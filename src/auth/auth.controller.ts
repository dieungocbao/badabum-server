import {
  Body,
  Req,
  Controller,
  HttpCode,
  Post,
  UseGuards,
  Get,
} from '@nestjs/common'
import { AuthService } from './auth.service'
import { RegisterDto } from './dto/register.dto'
import { RequestWithUser } from './interfaces/requestWithUser.interface'
import { LocalAuthenticationGuard } from './guards/localAuth.guard'
import User from '../users/user.entity'
import { JwtAuthenticationGuard } from './guards/jwtAuth.guard'
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() registrationData: RegisterDto): Promise<User> {
    return this.authService.register(registrationData)
  }

  @HttpCode(200)
  @UseGuards(LocalAuthenticationGuard)
  @Post('login')
  async logIn(@Req() request: RequestWithUser): Promise<User> {
    const { user } = request
    const cookie = this.authService.getCookieWithJwtToken(user.id)
    request.res.setHeader('Set-Cookie', cookie)
    return user
  }

  @UseGuards(JwtAuthenticationGuard)
  @Post('log-out')
  @HttpCode(200)
  async logOut(@Req() request: RequestWithUser) {
    request.res.setHeader('Set-Cookie', this.authService.getCookieForLogOut())
  }

  @UseGuards(JwtAuthenticationGuard)
  @Get()
  authenticate(@Req() request: RequestWithUser) {
    return request.user
  }
}

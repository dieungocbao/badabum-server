import {
  Body,
  Req,
  Controller,
  HttpCode,
  Post,
  UseGuards,
  Res,
  Get,
} from '@nestjs/common'
import { AuthService } from './auth.service'
import { RegisterDto } from './dto/register.dto'
import { RequestWithUser } from './interfaces/requestWithUser.interface'
import { LocalAuthenticationGuard } from './guards/localAuth.guard'
import User from '../users/user.entity'
import { Response } from 'express'
import JwtAuthenticationGuard from './guards/jwtAuth.guard'
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
  async logIn(
    @Req() request: RequestWithUser,
    @Res() response: Response,
  ): Promise<Response<any, Record<string, any>>> {
    const { user } = request
    const cookie = this.authService.getCookieWithJwtToken(user.id)
    response.setHeader('Set-Cookie', cookie)
    user.password = undefined
    return response.send(user)
  }

  @UseGuards(JwtAuthenticationGuard)
  @Post('log-out')
  async logOut(@Res() response: Response) {
    response.setHeader('Set-Cookie', this.authService.getCookieForLogOut())
    return response.sendStatus(200)
  }

  @UseGuards(JwtAuthenticationGuard)
  @Get()
  authenticate(@Req() request: RequestWithUser) {
    const user = request.user
    user.password = undefined
    return user
  }
}

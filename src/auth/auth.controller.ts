import {
  Body,
  Req,
  Controller,
  HttpCode,
  Post,
  UseGuards,
  Get,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common'
import { AuthService } from './auth.service'
import { RegisterDto } from './dto/register.dto'
import { RequestWithUser } from './interfaces/requestWithUser.interface'
import { LocalAuthenticationGuard } from './guards/localAuth.guard'
import User from '../users/user.entity'
import { JwtAuthenticationGuard } from './guards/jwtAuth.guard'
import { UsersService } from '../users/users.service'
import { JwtRefreshGuard } from './guards/jwt-refresh.guard'

@Controller('auth')
@UseInterceptors(ClassSerializerInterceptor)
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Post('register')
  async register(@Body() registrationData: RegisterDto): Promise<User> {
    return this.authService.register(registrationData)
  }

  @HttpCode(200)
  @UseGuards(LocalAuthenticationGuard)
  @Post('log-in')
  async logIn(@Req() request: RequestWithUser) {
    const { user } = request
    const accessTokenCookie = this.authService.getCookieWithJwtAccessToken(
      user.id,
    )
    const { cookie: refreshTokenCookie, token: refreshToken } =
      this.authService.getCookieWithJwtRefreshToken(user.id)

    await this.usersService.setCurrentRefreshToken(refreshToken, user.id)

    request.res.setHeader('Set-Cookie', [accessTokenCookie, refreshTokenCookie])
    return user
  }

  @UseGuards(JwtAuthenticationGuard)
  @Post('log-out')
  @HttpCode(200)
  async logOut(@Req() request: RequestWithUser) {
    await this.usersService.removeRefreshToken(request.user.id)
    request.res.setHeader('Set-Cookie', this.authService.getCookieForLogOut())
  }

  @UseGuards(JwtAuthenticationGuard)
  @Get()
  authenticate(@Req() request: RequestWithUser) {
    return request.user
  }

  @UseGuards(JwtRefreshGuard)
  @Get('refresh')
  refresh(@Req() request: RequestWithUser) {
    const accessTokenCookie = this.authService.getCookieWithJwtAccessToken(
      request.user.id,
    )

    request.res.setHeader('Set-Cookie', accessTokenCookie)
    return request.user
  }
}

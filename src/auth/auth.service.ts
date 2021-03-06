import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { UsersService } from '../users/users.service'
import { RegisterDto } from './dto/register.dto'
import * as bcrypt from 'bcrypt'
import PostgresErrorCode from '../database/postgresErrorCode.enum'
import User from '../users/user.entity'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { TokenPayload } from './interfaces/tokenPayload.interface'

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  public async register(registrationData: RegisterDto): Promise<User> {
    const hashedPassword = await bcrypt.hash(registrationData.password, 10)
    try {
      const createdUser = await this.usersService.create({
        ...registrationData,
        password: hashedPassword,
      })
      createdUser.password = undefined
      return createdUser
    } catch (error) {
      if (error?.code === PostgresErrorCode.UniqueViolation) {
        throw new HttpException(
          'User with that email already exists',
          HttpStatus.BAD_REQUEST,
        )
      }
      throw new HttpException(
        'Something went wrong',
        HttpStatus.INTERNAL_SERVER_ERROR,
      )
    }
  }

  public async getAuthenticatedUser(
    email: string,
    plainTextPassword: string,
  ): Promise<User> {
    try {
      const user = await this.usersService.getByEmail(email)
      await this.verifyPassword(plainTextPassword, user.password)
      user.password = undefined
      return user
    } catch (error) {
      console.log(error)
      throw new HttpException(
        'Wrong credentials provided',
        HttpStatus.BAD_REQUEST,
      )
    }
  }

  private async verifyPassword(
    plainTextPassword: string,
    hashedPassword: string,
  ): Promise<any> {
    const isPasswordMatching = await bcrypt.compare(
      plainTextPassword,
      hashedPassword,
    )
    if (!isPasswordMatching) {
      throw new HttpException(
        'Wrong credentials provided',
        HttpStatus.BAD_REQUEST,
      )
    }
  }

  public getCookieWithJwtAccessToken(userId: number) {
    const payload: TokenPayload = { userId }
    const token = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_ACCESS_TOKEN_SECRET'),
      expiresIn: `${this.configService.get(
        'JWT_ACCESS_TOKEN_EXPIRATION_TIME',
      )}s`,
    })
    return `access-token=${token}; HttpOnly; Path=/; Max-Age=${this.configService.get(
      'JWT_ACCESS_TOKEN_EXPIRATION_TIME',
    )}`
  }

  public getCookieWithJwtRefreshToken(userId: number) {
    const payload: TokenPayload = { userId }
    const token = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESH_TOKEN_SECRET'),
      expiresIn: `${this.configService.get(
        'JWT_REFRESH_TOKEN_EXPIRATION_TIME',
      )}s`,
    })
    const cookie = `refresh-token=${token}; HttpOnly; Path=/; Max-Age=${this.configService.get(
      'JWT_REFRESH_TOKEN_EXPIRATION_TIME',
    )}`
    return {
      cookie,
      token,
    }
  }

  public getCookieForLogOut() {
    return [
      `access-token=; HttpOnly; Path=/; Max-Age=0`,
      `refesh-token=; HttpOnly; Path=/; Max-Age=0`,
    ]
  }
}

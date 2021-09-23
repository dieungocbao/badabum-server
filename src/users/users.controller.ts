import {
  Controller,
  Delete,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { JwtAuthenticationGuard } from '../auth/guards/jwtAuth.guard'
import { RequestWithUser } from '../auth/interfaces/requestWithUser.interface'
import { UsersService } from './users.service'
import { diskStorage } from 'multer'
import { genFileName } from '../files/genFileName'

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('avatar')
  @UseGuards(JwtAuthenticationGuard)
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads',
        filename: genFileName,
      }),
      limits: {
        fileSize: 1 * 1024 * 1024, // 1MB
      },
    }),
  )
  async addAvatar(
    @Req() request: RequestWithUser,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.usersService.addAvatar(
      request.user.id,
      file.filename,
      file.path,
    )
  }

  @Delete('avatar')
  @UseGuards(JwtAuthenticationGuard)
  async deleteAvatar(@Req() request: RequestWithUser) {
    return this.usersService.deleteAvatar(request.user.id)
  }
}

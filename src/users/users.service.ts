import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import User from './user.entity'
import CreateUserDto from './dto/createUse.dto'
import { FilesService } from '../files/files.service'

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private readonly filesService: FilesService,
  ) {}

  async getByEmail(email: string) {
    const user = await this.usersRepository.findOne({ email })
    if (!user) {
      throw new HttpException(
        'User with this email does not exist',
        HttpStatus.NOT_FOUND,
      )
    }
    return user
  }

  async getById(id: number) {
    const user = await this.usersRepository.findOne({ id })
    if (!user) {
      throw new HttpException(
        'User with this id does not exist',
        HttpStatus.NOT_FOUND,
      )
    }
    return user
  }

  async create(userData: CreateUserDto) {
    try {
      const newUser = await this.usersRepository.create(userData)
      await this.usersRepository.save(newUser)
      return newUser
    } catch (error) {
      throw new HttpException(
        'Something went wrong!!!',
        HttpStatus.INTERNAL_SERVER_ERROR,
      )
    }
  }

  async addAvatar(userId: number, fileName: string, filePath: string) {
    const avatar = await this.filesService.uploadPublicFile(fileName, filePath)
    const user = await this.getById(userId)
    await this.usersRepository.update(userId, {
      ...user,
      avatar,
    })
    return avatar
  }

  async deleteAvatar(userId: number) {
    const user = await this.getById(userId)
    const avatar = user.avatar
    if (avatar) {
      await this.usersRepository.update(userId, {
        ...user,
        avatar: null,
      })
      await this.filesService.deletePublicFile(avatar)
    }
  }
}

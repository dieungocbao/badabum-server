import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import User from './user.entity'
import CreateUserDto from './dto/createUse.dto'

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
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
    if (user) {
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
      console.log(error)
      throw new Error('Something went wrong!!!')
    }
  }
}

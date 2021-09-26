import { AuthService } from '../auth.service'
import { Test } from '@nestjs/testing'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { getRepositoryToken } from '@nestjs/typeorm'
import User from '../../users/user.entity'
import { UsersService } from '../../users/users.service'
import { mockedJwtService } from '../../utils/mocks/jwt.service'
import { mockedConfigService } from '../../utils/mocks/config.service'
import * as bcrypt from 'bcrypt'
import { mockedUser } from './user.mock'

jest.mock('bcrypt')

describe('The AuthenticationService', () => {
  let authService: AuthService
  let usersService: UsersService

  let bcryptCompare: jest.Mock
  let userData: User
  let findUser: jest.Mock
  let createUser: jest.Mock
  let saveUser: jest.Mock

  beforeEach(async () => {
    userData = {
      ...mockedUser,
    }

    findUser = jest.fn().mockResolvedValue(userData)
    createUser = jest.fn().mockResolvedValue(userData)
    saveUser = jest.fn().mockResolvedValue(userData)
    const usersRepository = {
      findOne: findUser,
      create: createUser,
      save: saveUser,
    }

    bcryptCompare = jest.fn().mockReturnValue(true)
    ;(bcrypt.compare as jest.Mock) = bcryptCompare

    const module = await Test.createTestingModule({
      providers: [
        UsersService,
        AuthService,
        {
          provide: ConfigService,
          useValue: mockedConfigService,
        },
        {
          provide: JwtService,
          useValue: mockedJwtService,
        },
        {
          provide: getRepositoryToken(User),
          useValue: usersRepository,
        },
      ],
    }).compile()
    authService = await module.get(AuthService)
    usersService = await module.get(UsersService)
  })

  describe('when creating an user', () => {
    describe('and the provided user input is valid', () => {
      it('should return the user data', async () => {
        const user = await authService.register({
          email: mockedUser.email,
          name: mockedUser.name,
          password: mockedUser.password,
        })
        expect(user).toBe(userData)
      })
    })

    describe('and something went wrong error', () => {
      beforeEach(() => {
        saveUser.mockReturnValue(Promise.reject())
      })
      it('should throw an error', async () => {
        await expect(
          authService.register({
            email: mockedUser.email,
            name: mockedUser.name,
            password: mockedUser.password,
          }),
        ).rejects.toThrow()
      })
    })
  })

  describe('when accessing the data of authenticating user', () => {
    describe('and the provided password is not valid', () => {
      beforeEach(() => {
        bcryptCompare.mockReturnValue(false)
      })
      it('should throw an error', async () => {
        await expect(
          authService.getAuthenticatedUser('user@email.com', 'strongPassword'),
        ).rejects.toThrow()
      })
    })
    describe('and the provided password is valid', () => {
      beforeEach(() => {
        bcryptCompare.mockReturnValue(true)
      })
      describe('and the user is found in the database', () => {
        beforeEach(() => {
          findUser.mockResolvedValue(userData)
        })
        it('should return the user data', async () => {
          const user = await authService.getAuthenticatedUser(
            'user@email.com',
            'strongPassword',
          )
          expect(user).toBe(userData)
        })
      })
      describe('and the user is not found in the database', () => {
        beforeEach(() => {
          findUser.mockResolvedValue(undefined)
        })
        it('should throw an error', async () => {
          await expect(
            authService.getAuthenticatedUser(
              'user@email.com',
              'strongPassword',
            ),
          ).rejects.toThrow()
        })
      })
    })
  })

  describe('when creating a cookie', () => {
    it('should return a string', () => {
      const userId = 1
      expect(typeof authService.getCookieWithJwtAccessToken(userId)).toEqual(
        'string',
      )
    })
  })

  describe('when remove a cookie', () => {
    it('should return a string', () => {
      expect(typeof authService.getCookieForLogOut()).toEqual('string')
    })
  })
})

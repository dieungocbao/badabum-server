import { Module } from '@nestjs/common'
import { PostsModule } from './posts/posts.module'
import { ConfigModule } from '@nestjs/config'
import * as Joi from '@hapi/joi'
import { DatabaseModule } from './database/database.module'
import { UsersModule } from './users/users.module'
import { AuthModule } from './auth/auth.module'
import { CategoriesModule } from './categories/categories.module'
import { FilesModule } from './files/files.module'
import { ServeStaticModule } from '@nestjs/serve-static'
import { join } from 'path'

@Module({
  imports: [
    ConfigModule.forRoot({
      validationSchema: Joi.object({
        POSTGRES_HOST: Joi.string().required(),
        POSTGRES_PORT: Joi.number().required(),
        POSTGRES_USER: Joi.string().required(),
        POSTGRES_PASSWORD: Joi.string().required(),
        POSTGRES_DB: Joi.string().required(),
        PORT: Joi.number(),
        JWT_SECRET: Joi.string().required(),
        JWT_EXPIRATION_TIME: Joi.string().required(),
        MULTER_DEST: Joi.string().required(),
      }),
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/assets/',
    }),
    DatabaseModule,
    UsersModule,
    AuthModule,
    PostsModule,
    CategoriesModule,
    FilesModule,
  ],
  providers: [],
  controllers: [],
})
export class AppModule {}

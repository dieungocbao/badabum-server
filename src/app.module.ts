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
import { SearchModule } from './search/search.module'
import { ProductsModule } from './products/products.module'
import { ProductCategoriesModule } from './productCategories/productCategories.module'

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
        JWT_ACCESS_TOKEN_SECRET: Joi.string().required(),
        JWT_ACCESS_TOKEN_EXPIRATION_TIME: Joi.string().required(),
        JWT_REFRESH_TOKEN_SECRET: Joi.string().required(),
        JWT_REFRESH_TOKEN_EXPIRATION_TIME: Joi.string().required(),
        REDIS_HOST: Joi.string().required(),
        REDIS_PORT: Joi.number().required(),
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
    SearchModule,
    ProductsModule,
    ProductCategoriesModule,
  ],
  providers: [],
  controllers: [],
})
export class AppModule {}

import { Module } from '@nestjs/common'
import PostsController from './posts.controller'
import PostsService from './posts.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Post } from './post.entity'
import { SearchModule } from '../search/search.module'
@Module({
  imports: [TypeOrmModule.forFeature([Post]), SearchModule],
  controllers: [PostsController],
  providers: [PostsService],
})
export class PostsModule {}

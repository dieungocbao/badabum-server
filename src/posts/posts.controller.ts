import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Patch,
  UseGuards,
  Req,
  Query,
  UseInterceptors,
  ClassSerializerInterceptor,
  CacheInterceptor,
  CacheKey,
  CacheTTL,
} from '@nestjs/common'
import PostsService from './posts.service'
import { CreatePostDto } from './dto/createPost.dto'
import UpdatePostDto from './dto/updatePost.dto'
import { JwtAuthenticationGuard } from '../auth/guards/jwtAuth.guard'
import { FindOneParams } from '../utils/findOneParams'
import { RequestWithUser } from '../auth/interfaces/requestWithUser.interface'
import { PaginationParams } from '../utils/types/paginationParams'
import { GET_POSTS_CACHE_KEY } from './postsCacheKey.constant'
import { HttpCacheInterceptor } from './httpCache.interceptor'

@Controller('posts')
@UseInterceptors(ClassSerializerInterceptor)
export default class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @CacheKey(GET_POSTS_CACHE_KEY)
  @CacheTTL(120)
  @UseInterceptors(HttpCacheInterceptor)
  @Get()
  async getPosts(
    @Query('search') search: string,
    @Query() { offset, limit, startId }: PaginationParams,
  ) {
    if (search) {
      return await this.postsService.searchForPosts(
        search,
        offset,
        limit,
        startId,
      )
    }
    return await this.postsService.getAllPosts(offset, limit, startId)
  }

  @Get()
  getAllPosts() {
    return this.postsService.getAllPosts()
  }

  @Get(':id')
  getPostById(@Param() { id }: FindOneParams) {
    return this.postsService.getPostById(Number(id))
  }

  @Post()
  @UseGuards(JwtAuthenticationGuard)
  async createPost(@Body() post: CreatePostDto, @Req() req: RequestWithUser) {
    return this.postsService.createPost(post, req.user)
  }

  @Patch(':id')
  async updatePost(
    @Param() { id }: FindOneParams,
    @Body() post: UpdatePostDto,
  ) {
    return this.postsService.updatePost(Number(id), post)
  }

  @Delete(':id')
  async deletePost(@Param() { id }: FindOneParams) {
    return this.postsService.deletePost(Number(id))
  }
}

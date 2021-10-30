import { NestFactory, Reflector } from '@nestjs/core'
import { AppModule } from './app.module'
import * as cookieParser from 'cookie-parser'
import { ValidationPipe, ClassSerializerInterceptor } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { runInCluster } from './utils/runInCluster'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.useGlobalPipes(new ValidationPipe())

  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)))

  app.use(cookieParser())
  await app.listen(app.get(ConfigService).get('PORT') || 4000)
}

// runInCluster(bootstrap)
bootstrap()

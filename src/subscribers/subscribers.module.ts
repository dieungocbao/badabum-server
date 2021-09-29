import { Module } from '@nestjs/common'
import { SubscribersService } from './subscribers.service'
import { SubscribersController } from './subscribers.controller'
import { ConfigService } from '@nestjs/config'
import { ClientProxyFactory, Transport } from '@nestjs/microservices'

@Module({
  providers: [
    {
      provide: 'SUBSCRIBERS_SERVICE',
      useFactory: (configService: ConfigService) =>
        ClientProxyFactory.create({
          transport: Transport.TCP,
          options: {
            host: configService.get('SUBSCRIBERS_SERVICE_HOST'),
            port: configService.get('SUBSCRIBERS_SERVICE_PORT'),
          },
        }),
      inject: [ConfigService],
    },
    SubscribersService,
  ],
  controllers: [SubscribersController],
})
export class SubscribersModule {}

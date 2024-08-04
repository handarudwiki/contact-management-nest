import { Module } from '@nestjs/common';
import { CommonModule } from './common/common.module';
import { UserModule } from './user/user.module';
import { ConfigModule } from '@nestjs/config';
import { ContactModule } from './contact/contact.module';
@Module({
  imports: [CommonModule, UserModule, 
    ConfigModule.forRoot({
      isGlobal:true
    }), ContactModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}

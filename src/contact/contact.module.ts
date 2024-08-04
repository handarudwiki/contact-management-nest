import { Module } from '@nestjs/common';
import { ContactService } from './contact.service';

@Module({
    providers:[ContactService]
})
export class ContactModule {}

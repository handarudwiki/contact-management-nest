import {
  ContactResponse,
  CreateContactRequest,
  SerchContactRequest,
  UpdateContactRequest,
} from './../model/contact.model';
import { HttpException, Inject, Injectable } from '@nestjs/common';
import { Contact, User } from '@prisma/client';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { PrismaService } from 'src/common/prisma.service';
import { ValidationService } from 'src/common/validation.service';
import { Logger } from 'winston';
import { ContactValidation } from './contact.validation';
import { WebResponse } from 'src/model/web.mode.';
import { filter } from 'rxjs';

@Injectable()
export class ContactService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
    private prismaService: PrismaService,
    private validationService: ValidationService,
  ) {}

  async create(
    user: User,
    req: CreateContactRequest,
  ): Promise<ContactResponse> {
    this.logger.debug(
      `ContactService.create(${JSON.stringify(user)}, ${JSON.stringify(req)})`,
    );

    const createRequest: CreateContactRequest = this.validationService.validate(
      ContactValidation.CREATE,
      req,
    );

    const contact = await this.prismaService.contact.create({
      data: {
        first_name: createRequest.first_name,
        last_name: createRequest.last_name,
        email: createRequest.email,
        username: createRequest.email,
        phone: createRequest.phone,
      },
    });

    return this.toContactResponse(contact);
  }

  toContactResponse(contact: Contact): ContactResponse {
    return {
      id: contact.id,
      first_name: contact.first_name,
      last_name: contact.last_name,
      email: contact.email,
      phone: contact.phone,
    };
  }

  async contactMustExist(username: string, id: number): Promise<Contact> {
    const contact = await this.prismaService.contact.findUnique({
      where: {
        username,
        id,
      },
    });

    if (!contact) {
      throw new HttpException('Contact not found', 404);
    }

    return contact;
  }

  async get(user: User, id: number): Promise<ContactResponse> {
    const contact = await this.contactMustExist(user.username, id);

    return this.toContactResponse(contact);
  }

  async update(
    user: User,
    req: UpdateContactRequest,
  ): Promise<ContactResponse> {
    const updateContactRequest: UpdateContactRequest =
      this.validationService.validate(ContactValidation.UPDATE, req);

    let contact = await this.contactMustExist(user.username, req.id);

    contact = await this.prismaService.contact.update({
      where: {
        id: contact.id,
        username: contact.username,
      },
      data: updateContactRequest,
    });

    return this.toContactResponse(contact);
  }

  async delete(user: User, id: number): Promise<ContactResponse> {
    await this.contactMustExist(user.username, id);

    const contact = await this.prismaService.contact.delete({
      where: {
        username: user.username,
        id: id,
      },
    });

    return this.toContactResponse(contact);
  }

  async search(
    user: User,
    req: SerchContactRequest,
  ): Promise<WebResponse<ContactResponse[]>> {
    const searchRequest:SerchContactRequest = this.validationService.validate(ContactValidation.SEARCH, req)

    const filters = []
    if(searchRequest.name){
        //add name filter
        filters.push({
            OR:[
                {
                    first_name :{
                        contains : searchRequest.name
                    },
                    last_name:{
                        contains :searchRequest.name
                    }
                }
            ]
        })
    }

    if(searchRequest.email){
        filters.push({
            //add email filter
            email:{
                contains:searchRequest.email
            }
        })
    }

    if(searchRequest.phone){
        filters.push({
            phone:{
                contains:searchRequest.phone
            }
        })
    }

    const skip = (searchRequest.page -1) *searchRequest.size

    const contacts = await this.prismaService.contact.findMany({
        where:{
            username:user.username,
            AND:filters
        },
        take:searchRequest.size,
        skip:skip
    })

    const total = await this.prismaService.contact.count({
        where:{
            username:user.username,
            AND:filters
        }
    })

    return {
        data:contacts.map((contact)=> this.toContactResponse(contact)),
        pagging:{
            current_page: searchRequest.page,
            size: searchRequest.size,
            total_page: Math.ceil(total/ searchRequest.size)
        }
    }
  }
}

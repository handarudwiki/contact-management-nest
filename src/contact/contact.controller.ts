import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ContactService } from './contact.service';
import {
  ContactResponse,
  CreateContactRequest,
  SerchContactRequest,
  UpdateContactRequest,
} from 'src/model/contact.model';
import { WebResponse } from 'src/model/web.mode.';
import { AuthGuard } from 'src/user/auth.guard';

@Controller('comments')
export class ContactController {
  constructor(private contactService: ContactService) {}

  @Post()
  @HttpCode(200)
  @UseGuards(AuthGuard)
  async create(
    @Request() req,
    @Body() createContactRequest: CreateContactRequest,
  ): Promise<WebResponse<ContactResponse>> {
    const result = await this.contactService.create(
      req.user,
      createContactRequest,
    );
    return {
      data: result,
    };
  }

  @Get('/:id')
  @HttpCode(200)
  @UseGuards(AuthGuard)
  async detail(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<WebResponse<ContactResponse>> {
    const result = await this.contactService.get(req.user, id);

    return {
      data: result,
    };
  }

  @Patch('/:id')
  @HttpCode(200)
  @UseGuards(AuthGuard)
  async update(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRequest: UpdateContactRequest,
  ): Promise<WebResponse<ContactResponse>> {
    updateRequest.id = id;
    const result = await this.contactService.update(req, updateRequest);
    return {
      data: result,
    };
  }

  @Delete('/:id')
  @HttpCode(200)
  @UseGuards(AuthGuard)
  async delete(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<WebResponse<ContactResponse>> {
    const result = await this.contactService.delete(req.user, id);

    return {
      data: result,
    };
  }
  @Get()
  @HttpCode(200)
  async search(
    @Request() req,
    @Query('name') name?: string,
    @Query('email') email?: string,
    @Query('phone') phone?: string,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('size', new ParseIntPipe({ optional: true })) size?: number,
  ): Promise<WebResponse<ContactResponse[]>> {
    const requestSearch:SerchContactRequest = {
        name: name,
        email: email,
        phone: phone,
        page: page || 1,
        size: size || 10,
    }

    return this.contactService.search(req.user, requestSearch)
  }
}

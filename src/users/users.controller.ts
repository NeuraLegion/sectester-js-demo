import { CreateUserDto } from './create-user.dto';
import { User } from './user.entity';
import { UsersService } from './users.service';
import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Req,
  UnauthorizedException
} from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { createHmac, timingSafeEqual } from 'crypto';
import { Request } from 'express';

@Controller('users')
@ApiTags('users')
export class UsersController {
  private static getAuthenticatedUserId(req?: Request): number | null {
    const authorizationHeader = req?.header('authorization');
    const secret = process.env.USER_ID_TOKEN_SECRET;

    if (!authorizationHeader || !secret) {
      return null;
    }

    const match = /^Bearer (\d+)\.([a-f0-9]{64})$/i.exec(
      authorizationHeader.trim()
    );

    if (!match) {
      return null;
    }

    const [, userId, providedSignature] = match;
    const expectedSignature = createHmac('sha256', secret)
      .update(userId)
      .digest('hex');

    if (
      providedSignature.length !== expectedSignature.length ||
      !timingSafeEqual(
        Buffer.from(providedSignature.toLowerCase(), 'utf8'),
        Buffer.from(expectedSignature, 'utf8')
      )
    ) {
      return null;
    }

    return Number(userId);
  }

  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiResponse({
    status: 201,
    type: User,
    description: 'The record has been successfully created.'
  })
  public create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @ApiResponse({ status: 200, type: User, isArray: true })
  public findAll(@Query() query?: Omit<Partial<User>, 'id'>): Promise<User[]> {
    return this.usersService.findAll(query);
  }

  @Get(':id')
  @ApiResponse({ status: 200, type: User })
  @ApiResponse({ status: 401, description: 'Authentication is required.' })
  @ApiResponse({ status: 404, description: 'No such user.' })
  public async findOne(
    @Param('id', ParseIntPipe) id: number,
    @Req() req?: Request
  ): Promise<User> {
    const authenticatedUserId = UsersController.getAuthenticatedUserId(req);

    if (authenticatedUserId === null) {
      throw new UnauthorizedException('Authentication is required.');
    }

    const user = await this.usersService.findOne(id, authenticatedUserId);

    if (!user) {
      throw new NotFoundException('No such user.');
    }

    return user;
  }

  @Delete(':id')
  @ApiResponse({
    status: 204,
    description: 'The record has been successfully removed.'
  })
  public remove(@Param('id') id: number): Promise<void> {
    return this.usersService.remove(id);
  }
}

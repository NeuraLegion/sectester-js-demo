import { CreateUserDto } from './create-user.dto';
import { User } from './user.entity';
import { UsersService } from './users.service';
import {
  Body,
  Controller,
  Delete,
  Get,
  Req,
  Param,
  ParseIntPipe,
  Post,
  Query,
  NotFoundException,
  UseGuards
} from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { UserIdentityGuard } from './user-identity.guard';

type AuthenticatedRequest = Request & {
  user: {
    id: number;
  };
};

@Controller('users')
@ApiTags('users')
export class UsersController {
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
  @UseGuards(UserIdentityGuard)
  @ApiResponse({ status: 200, type: User })
  @ApiResponse({ status: 404, description: 'No such user.' })
  public async findOne(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: AuthenticatedRequest
  ): Promise<User> {
    const user = await this.usersService.findOne(id, req.user.id);

    if (!user) {
      throw new NotFoundException('No such user.');
    }

    return user;
  }

  @Delete(':id')
  @UseGuards(UserIdentityGuard)
  @ApiResponse({
    status: 204,
    description: 'The record has been successfully removed.'
  })
  public async remove(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: AuthenticatedRequest
  ): Promise<void> {
    if (req.user.id !== id) {
      throw new NotFoundException('No such user.');
    }

    await this.usersService.remove(id, req.user.id);
  }
}

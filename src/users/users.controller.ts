import { CreateUserDto } from './create-user.dto';
import { User } from './user.entity';
import { UsersService } from './users.service';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query
} from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';

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
  @ApiResponse({ status: 200, type: User })
  public findOne(@Param('id') id: number): Promise<User | null> {
    return this.usersService.findOne(id);
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

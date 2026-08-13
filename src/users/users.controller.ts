import { CreateUserDto } from './create-user.dto';
import {
  AuthenticatedGuard,
  AuthenticatedRequest
} from './guards/authenticated.guard';
import { User } from './user.entity';
import { UsersService } from './users.service';
import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
  NotFoundException
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
  @UseGuards(AuthenticatedGuard)
  @ApiResponse({ status: 200, type: User })
  @ApiResponse({
    status: 401,
    description: 'Authentication is required to access this resource.'
  })
  @ApiResponse({
    status: 403,
    description: 'You are not allowed to access this user record.'
  })
  @ApiResponse({ status: 404, description: 'No such user.' })
  public async findOne(
    @Param('id') id: number,
    @Req() request?: AuthenticatedRequest
  ): Promise<User> {
    if (request?.user?.id !== Number(id)) {
      throw new ForbiddenException(
        'You are not allowed to access this user record.'
      );
    }

    const user = await this.usersService.findOne(id);

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

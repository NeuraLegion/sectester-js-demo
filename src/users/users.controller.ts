import { CreateUserDto } from './create-user.dto';
import { User } from './user.entity';
import { UsersService } from './users.service';
import {
  ArgumentMetadata,
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  PipeTransform,
  Post,
  Query,
  NotFoundException,
  UseGuards
} from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { UsersAuthGuard } from './users-auth.guard';

class StrictIntPipe implements PipeTransform<string, number> {
  public transform(value: string, _metadata: ArgumentMetadata): number {
    if (!/^[+-]?\d+$/.test(value)) {
      throw new BadRequestException('Validation failed (numeric string is expected)');
    }

    const parsed = Number(value);
    if (!Number.isSafeInteger(parsed)) {
      throw new BadRequestException('Validation failed (integer is out of range)');
    }

    return parsed;
  }
}

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
  @UseGuards(UsersAuthGuard)
  @ApiResponse({ status: 200, type: User, isArray: true })
  public findAll(@Query() query?: Omit<Partial<User>, 'id'>): Promise<User[]> {
    return this.usersService.findAll(query);
  }

  @Get(':id')
  @UseGuards(UsersAuthGuard)
  @ApiResponse({ status: 200, type: User })
  @ApiResponse({ status: 404, description: 'No such user.' })
  public async findOne(
    @Param('id', StrictIntPipe) id: number
  ): Promise<User> {
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

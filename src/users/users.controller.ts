import { CreateUserDto } from './create-user.dto';
import { User } from './user.entity';
import { UsersService } from './users.service';
import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  ParseIntPipe,
  Param,
  Post,
  Query,
  NotFoundException
} from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { createHmac, randomBytes, timingSafeEqual } from 'crypto';

const USER_ACCESS_TOKEN_SECRET =
  process.env.USER_ACCESS_TOKEN_SECRET ?? randomBytes(32).toString('hex');

function hasValidUserAccessToken(id: number, authorization?: string): boolean {
  if (!authorization) {
    return false;
  }

  const [scheme, token] = authorization.split(' ');
  if (scheme !== 'Bearer' || !token) {
    return false;
  }

  const expectedToken = createHmac('sha256', USER_ACCESS_TOKEN_SECRET)
    .update(String(id))
    .digest('hex');
  const providedToken = Buffer.from(token, 'utf8');
  const expectedTokenBuffer = Buffer.from(expectedToken, 'utf8');

  return (
    providedToken.length === expectedTokenBuffer.length &&
    timingSafeEqual(providedToken, expectedTokenBuffer)
  );
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
  @ApiResponse({ status: 200, type: User, isArray: true })
  public findAll(@Query() query?: Omit<Partial<User>, 'id'>): Promise<User[]> {
    return this.usersService.findAll(query);
  }

  @Get(':id')
  @ApiResponse({ status: 200, type: User })
  @ApiResponse({ status: 404, description: 'No such user.' })
  public async findOne(
    @Param('id', ParseIntPipe) id: number,
    @Headers('authorization') authorization?: string
  ): Promise<User> {
    if (!hasValidUserAccessToken(id, authorization)) {
      throw new NotFoundException('No such user.');
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

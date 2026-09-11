import { CreateUserDto } from './create-user.dto';
import { User } from './user.entity';
import { UsersService } from './users.service';
import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  ParseIntPipe,
  Post,
  Query,
  NotFoundException,
  Res
} from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';

@Controller('users')
@ApiTags('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  private setAccessTokenHeader(
    response: { setHeader(name: string, value: string): void } | undefined,
    userId: number
  ): void {
    response?.setHeader(
      'X-User-Access-Token',
      this.usersService.issueAccessToken(userId)
    );
  }

  private extractBearerToken(authorization?: string): string | null {
    if (!authorization) {
      return null;
    }

    const [scheme, token] = authorization.trim().split(/\s+/, 2);

    if (!scheme || scheme.toLowerCase() !== 'bearer' || !token) {
      return null;
    }

    return token;
  }

  @Post()
  @ApiResponse({
    status: 201,
    type: User,
    description: 'The record has been successfully created.'
  })
  public async create(
    @Body() createUserDto: CreateUserDto,
    @Res({ passthrough: true })
    response?: { setHeader(name: string, value: string): void }
  ): Promise<User> {
    const user = await this.usersService.create(createUserDto);

    this.setAccessTokenHeader(response, user.id);

    return user;
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
    @Headers('authorization') authorization?: string,
    @Res({ passthrough: true })
    response?: { setHeader(name: string, value: string): void }
  ): Promise<User> {
    const accessToken = this.extractBearerToken(authorization);

    if (!this.usersService.isAccessTokenValid(id, accessToken)) {
      throw new NotFoundException('No such user.');
    }

    const user = await this.usersService.findOne(id);

    if (!user) {
      throw new NotFoundException('No such user.');
    }

    this.setAccessTokenHeader(response, user.id);

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

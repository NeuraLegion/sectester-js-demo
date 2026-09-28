import { User } from './user.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UsersAuthGuard } from './users-auth.guard';
import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';

@Module({
  imports: [MikroOrmModule.forFeature([User])],
  providers: [UsersService, UsersAuthGuard],
  controllers: [UsersController]
})
export class UsersModule {}

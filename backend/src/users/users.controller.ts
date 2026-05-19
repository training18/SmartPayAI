import { Controller, Get, Patch } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CurrentUser } from '../common/decorators';
import { JwtPayload } from '../common/types';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  getProfile(@CurrentUser() user: JwtPayload) {
    return this.users.findById(user.sub);
  }

  @Patch('me/onboard')
  @ApiOperation({ summary: 'Complete user onboarding' })
  completeOnboarding(@CurrentUser() user: JwtPayload) {
    return this.users.completeOnboarding(user.sub);
  }
}

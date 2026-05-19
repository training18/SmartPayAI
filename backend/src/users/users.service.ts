import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  /** Get user profile by ID (excludes sensitive fields). */
  async findById(id: string) {
    return this.prisma.user.findUniqueOrThrow({
      where: { id },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        isOnboarded: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  /** Mark user onboarding as complete. */
  async completeOnboarding(id: string) {
    return this.prisma.user.update({
      where: { id },
      data: { isOnboarded: true },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        isOnboarded: true,
      },
    });
  }
}

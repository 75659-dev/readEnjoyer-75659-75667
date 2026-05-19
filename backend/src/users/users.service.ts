import { Injectable, NotFoundException } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true, // User may see their own email
        avatar: true,
        role: true,
        createdAt: true,

        // ⚠️ NOTE: We do NOT select password, hashedRt, or googleId here.
        // Prisma will not fetch these from the database.
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updateMe(id: string, updateUserDto: UpdateUserDto) {
    // Check if the new username is already taken (if attempting to change)
    if (updateUserDto.username) {
      const existingUser = await this.prisma.user.findUnique({
        where: { username: updateUserDto.username },
      });
      if (existingUser && existingUser.id !== id) {
        throw new Error('This username is already taken');
      }
    }

    return this.prisma.user.update({
      where: { id: id },
      data: {
        username: updateUserDto.username,
        avatar: updateUserDto.avatar,
      },
      select: {
        id: true,
        username: true,
        email: true,
        avatar: true,
      },
    });
  }

  async searchUsers(query: string) {
    if (!query || query.trim() === '') {
      return [];
    }

    return this.prisma.user.findMany({
      where: {
        username: {
          contains: query,
          mode: 'insensitive',
        },
      },
      select: {
        id: true,
        username: true,
        avatar: true,
        createdAt: true,
        _count: {
          select: {
            library: true,
            reviews: true,
          },
        },
      },
      take: 20,
    });
  }

  async getPublicProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        avatar: true,
        createdAt: true,
        // email is NOT included here (no one should see other users' emails)

        // Prisma magic: count statistics without loading the actual records
        _count: {
          select: {
            library: true, // Number of books on shelves
            reviews: true, // Number of reviews left
          },
        },
        reviews: {
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            rating: true,
            text: true,
            createdAt: true,
            book: {
              select: {
                id: true,
                title: true,
                image: true,
                author: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }
}

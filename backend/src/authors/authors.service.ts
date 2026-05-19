import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAuthorDto } from './dto/create-author.dto';

@Injectable()
export class AuthorsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return await this.prisma.author.findMany({});
  }

  async findOne(id: number) {
    const author = await this.prisma.author.findUnique({
      where: { id },
    });

    if (!author) throw new NotFoundException(`Author with ID ${id} not found`);
    return author;
  }

  async create(dto: CreateAuthorDto) {
    return await this.prisma.author.create({
      data: {
        name: dto.name,
        bio: dto.bio,
        image: dto.image,
      },
    });
  }

  async remove(id: number) {
    return await this.prisma.author.delete({ where: { id } });
  }

  async update(id: number, dto: CreateAuthorDto) {
    return await this.prisma.author.update({
      where: { id },
      data: {
        name: dto.name,
        bio: dto.bio,
        image: dto.image,
      },
    });
  }
}

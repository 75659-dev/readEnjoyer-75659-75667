import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookDto } from './dto/create-book.dto';

@Injectable()
export class BooksService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return await this.prisma.book.findMany({
      include: { author: true, categories: true, reviews: true },
    });
  }

  async findOne(id: number) {
    const book = await this.prisma.book.findUnique({
      where: { id },
      include: { author: true, categories: true, reviews: true },
    });

    if (!book) throw new NotFoundException(`Book with ID ${id} not found`);
    return book;
  }

  async create(dto: CreateBookDto) {
    const author = await this.prisma.author.findUnique({
      where: { id: dto.authorId },
    });
    if (!author) {
      throw new NotFoundException(`Author with ID ${dto.authorId} not found`);
    }

    if (dto.categoryIds && dto.categoryIds.length > 0) {
      const existingCategoriesCount = await this.prisma.category.count({
        where: {
          id: { in: dto.categoryIds },
        },
      });

      if (existingCategoriesCount !== dto.categoryIds.length) {
        throw new NotFoundException(
          'One or more specified categories not found',
        );
      }
    }
    return await this.prisma.book.create({
      data: {
        title: dto.title,
        description: dto.description,
        price: dto.price,
        stock: dto.stock,
        image: dto.image,
        pages: dto.pages,
        publishYear: dto.publishYear,
        authorId: dto.authorId,
        categories: {
          connect: dto.categoryIds?.map((id) => ({ id })),
        },
      },
    });
  }

  async remove(id: number) {
    return await this.prisma.book.delete({ where: { id } });
  }

  async update(id: number, dto: CreateBookDto) {
    const author = await this.prisma.author.findUnique({
      where: { id: dto.authorId },
    });
    if (!author) {
      throw new NotFoundException(`Author with ID ${dto.authorId} not found`);
    }

    if (dto.categoryIds && dto.categoryIds.length > 0) {
      const existingCategoriesCount = await this.prisma.category.count({
        where: {
          id: { in: dto.categoryIds },
        },
      });

      if (existingCategoriesCount !== dto.categoryIds.length) {
        throw new NotFoundException(
          'One or more specified categories not found',
        );
      }
    }

    return await this.prisma.book.update({
      where: { id },
      data: {
        title: dto.title,
        description: dto.description,
        price: dto.price,
        stock: dto.stock,
        image: dto.image,
        pages: dto.pages,
        publishYear: dto.publishYear,
        authorId: dto.authorId,
        categories: {
          set: [],
          connect: dto.categoryIds?.map((id) => ({ id })),
        },
      },
    });
  }
}

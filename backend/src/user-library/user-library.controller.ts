import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { UserLibraryService } from './user-library.service';
import { UpdateUserLibraryDto } from './dto/update-user-library.dto';
import { AtGuard } from '../auth/guards/at.guard';
import { GetCurrentUser } from '../auth/decorators/get-current-user.decorator';
import { ReadingStatus } from '@prisma/client';
import { CreateUserLibraryDto } from './dto/create-user-library.dto';

@ApiTags('User Library (My Shelves)')
@UseGuards(AtGuard)
@Controller('users/me/library') // Correct path
export class UserLibraryController {
  constructor(private readonly libraryService: UserLibraryService) {}

  @Get()
  @ApiOperation({ summary: 'Get all books on the user shelves' })
  @ApiQuery({
    name: 'status',
    enum: ReadingStatus,
    required: false,
    description: 'Filter by status',
  })
  getMyLibrary(
    @GetCurrentUser('sub') userId: string,
    @Query('status') status?: ReadingStatus, // Extract ?status=... from the URL
  ) {
    return this.libraryService.getUserLibrary(userId, status);
  }

  @Post(':bookId')
  @ApiOperation({ summary: 'Add a book to your shelf' })
  addBook(
    @GetCurrentUser('sub') userId: string,
    @Param('bookId', ParseIntPipe) bookId: number,
    @Body() dto: CreateUserLibraryDto,
  ) {
    return this.libraryService.addBookToLibrary(userId, bookId, dto);
  }

  @Patch(':bookId')
  @ApiOperation({ summary: 'Update reading status or progress' })
  updateBook(
    @GetCurrentUser('sub') userId: string,
    @Param('bookId', ParseIntPipe) bookId: number,
    @Body() dto: UpdateUserLibraryDto,
  ) {
    return this.libraryService.updateLibraryBook(userId, bookId, dto);
  }

  @Delete(':bookId')
  @ApiOperation({ summary: 'Remove a book from your library' })
  removeBook(
    @GetCurrentUser('sub') userId: string,
    @Param('bookId', ParseIntPipe) bookId: number,
  ) {
    return this.libraryService.removeFromLibrary(userId, bookId);
  }
}

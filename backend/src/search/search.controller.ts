import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { SearchService } from './search.service';

@ApiTags('Search')
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @ApiOperation({ summary: 'Global search across books and authors' })
  @ApiQuery({
    name: 'q',
    required: true,
    description: 'Search query (book title or author name)',
    example: 'Orwell',
  })
  search(@Query('q') query: string) {
    return this.searchService.searchBooks(query);
  }
}

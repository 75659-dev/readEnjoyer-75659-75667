import { Module } from '@nestjs/common';
import { UserLibraryService } from './user-library.service';
import { UserLibraryController } from './user-library.controller';

@Module({
  controllers: [UserLibraryController],
  providers: [UserLibraryService],
})
export class UserLibraryModule {}

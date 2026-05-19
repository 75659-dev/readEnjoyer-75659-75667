// IMPORTANT: import PartialType from @nestjs/swagger so documentation is generated
import { PartialType } from '@nestjs/swagger';
import { CreateUserLibraryDto } from './create-user-library.dto';
// This is all the code! It will automatically inherit `status` and `pagesRead`,
// and Swagger will understand this DTO is for PATCH requests
export class UpdateUserLibraryDto extends PartialType(CreateUserLibraryDto) {}

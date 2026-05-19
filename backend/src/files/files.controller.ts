// src/files/files.controller.ts
import {
  Controller,
  Post,
  Get,
  Param,
  Res,
  UseInterceptors,
  UploadedFile,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { FilesService } from './files.service';
import { ConfigService } from '@nestjs/config';
import { AtGuard } from '../auth/guards/at.guard';
import {
  ApiTags,
  ApiOperation,
  ApiConsumes,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('Files')
@Controller('files')
export class FilesController {
  constructor(
    private readonly filesService: FilesService,
    private readonly configService: ConfigService,
  ) {}

  @Post('upload')
  @ApiBearerAuth()
  @UseGuards(AtGuard)
  @ApiOperation({ summary: 'Upload a file and get its ID' })
  @UseInterceptors(FileInterceptor('image'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { image: { type: 'string', format: 'binary' } },
    },
  })
  async upload(@UploadedFile() file: Express.Multer.File) {
    const fileId = await this.filesService.uploadFile(file);
    return { fileId }; // Now returning { "fileId": "93818285283" }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get image by ID' })
  async getFile(@Param('id') id: string, @Res() res: Response) {
    const publicUrl = this.configService.get<string>('S3_PUBLIC_URL');
    const bucket = this.configService.get<string>('S3_BUCKET_NAME');

    // Build direct link to MinIO
    const minioUrl = `${publicUrl}/${bucket}/${id}`;

    // Redirect browser to MinIO
    return res.redirect(minioUrl);
  }
}

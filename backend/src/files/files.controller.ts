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
    const { stream, contentType } = await this.filesService.getFileStream(id);

    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=31536000');

    // Pipe the S3/MinIO stream directly to the client
    stream.on('error', (err) => {
      // If streaming fails, ensure the response is ended
      if (!res.headersSent) {
        res.status(500).end();
      } else {
        res.end();
      }
    });

    stream.pipe(res);
  }
}

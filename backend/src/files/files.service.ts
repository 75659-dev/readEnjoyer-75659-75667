// src/files/files.service.ts
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import 'multer';
@Injectable()
export class FilesService {
  private s3Client: S3Client;

  constructor(private configService: ConfigService) {
    this.s3Client = new S3Client({
      endpoint: this.configService.get<string>('S3_ENDPOINT'),
      forcePathStyle: true,
      region: this.configService.get<string>('S3_REGION') || 'us-east-1',
      credentials: {
        accessKeyId: this.configService.get<string>('S3_ACCESS_KEY') as string,
        secretAccessKey: this.configService.get<string>(
          'S3_SECRET_KEY',
        ) as string,
      },
    });
  }

  async uploadFile(file: Express.Multer.File): Promise<string> {
    try {
      const bucket = this.configService.get<string>('S3_BUCKET_NAME') as string;

      // Generate numeric ID (e.g.: 171439... + 3 random digits)
      const fileId = `${Date.now()}${Math.floor(100 + Math.random() * 900)}`;

      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: fileId, // Store the file simply as a numeric ID
          Body: file.buffer,
          ContentType: file.mimetype,
        }),
      );

      // Return only the ID
      return fileId;
    } catch (e: any) {
      throw new InternalServerErrorException('File upload error: ' + e.message);
    }
  }
}

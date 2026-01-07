import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  CreateBucketCommand,
  HeadBucketCommand,
} from '@aws-sdk/client-s3';

@Injectable()
export class S3Service implements OnModuleInit {
  private readonly logger = new Logger(S3Service.name);
  private readonly s3Client: S3Client;
  private readonly bucketName: string;

  constructor(private readonly configService: ConfigService) {
    this.s3Client = new S3Client({
      region: this.configService.get('AWS_REGION', 'us-east-1'),
      endpoint: this.configService.get('AWS_ENDPOINT_URL', 'http://localhost:4566'),
      forcePathStyle: true,
      credentials: {
        accessKeyId: this.configService.get('AWS_ACCESS_KEY_ID', 'test'),
        secretAccessKey: this.configService.get('AWS_SECRET_ACCESS_KEY', 'test'),
      },
    });

    this.bucketName = this.configService.get('S3_BUCKET_NAME', 'parts-monitor-screenshots');
  }

  async onModuleInit() {
    await this.ensureBucketExists();
  }

  private async ensureBucketExists() {
    try {
      await this.s3Client.send(
        new HeadBucketCommand({
          Bucket: this.bucketName,
        }),
      );
      this.logger.log(`S3 bucket ${this.bucketName} already exists`);
    } catch (error) {
      if (error.name === 'NotFound' || error.$metadata?.httpStatusCode === 404) {
        try {
          const region = this.configService.get('AWS_REGION', 'us-east-1');
          const params: any = {
            Bucket: this.bucketName,
          };

          // us-east-1 does not support LocationConstraint
          if (region !== 'us-east-1') {
            params.CreateBucketConfiguration = {
              LocationConstraint: region,
            };
          }

          await this.s3Client.send(new CreateBucketCommand(params));
          this.logger.log(`S3 bucket ${this.bucketName} created`);
        } catch (createError) {
          // Check if bucket already exists (concurrent creation)
          if (createError.name === 'BucketAlreadyExists' || createError.name === 'BucketAlreadyOwnedByYou') {
            this.logger.log(`S3 bucket ${this.bucketName} already exists (concurrent creation)`);
          } else {
            this.logger.error('Failed to create S3 bucket', createError.stack);
            throw createError;
          }
        }
      } else {
        this.logger.error('Failed to check S3 bucket', error.stack);
      }
    }
  }

  async uploadScreenshot(
    productId: string,
    site: string,
    screenshot: Buffer,
  ): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const key = `screenshots/${productId}/${site}/${timestamp}.png`;

    try {
      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.bucketName,
          Key: key,
          Body: screenshot,
          ContentType: 'image/png',
        }),
      );

      this.logger.log(`Screenshot uploaded: ${key}`);
      return key;
    } catch (error) {
      this.logger.error('Failed to upload screenshot', error.stack);
      throw error;
    }
  }
}

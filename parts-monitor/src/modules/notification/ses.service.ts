import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import * as nodemailer from 'nodemailer';

@Injectable()
export class SESService {
  private readonly logger = new Logger(SESService.name);
  private readonly sesClient: SESClient;
  private readonly transporter: nodemailer.Transporter;
  private readonly fromEmail: string;

  constructor(private readonly configService: ConfigService) {
    this.sesClient = new SESClient({
      region: this.configService.get('AWS_REGION', 'ap-northeast-2'),
      endpoint: this.configService.get('AWS_ENDPOINT_URL', 'http://localhost:4566'),
      credentials: {
        accessKeyId: this.configService.get('AWS_ACCESS_KEY_ID', 'test'),
        secretAccessKey: this.configService.get('AWS_SECRET_ACCESS_KEY', 'test'),
      },
    });

    this.fromEmail = this.configService.get('SES_FROM_EMAIL', 'noreply@example.com');

    this.transporter = nodemailer.createTransport({
      SES: { ses: this.sesClient, aws: { require: require } },
    } as any);
  }

  async sendEmail(params: {
    to: string[];
    subject: string;
    html: string;
    text?: string;
    attachments?: Array<{
      filename: string;
      content: Buffer;
      contentType: string;
    }>;
  }) {
    try {
      if (params.attachments && params.attachments.length > 0) {
        await this.transporter.sendMail({
          from: this.fromEmail,
          to: params.to,
          subject: params.subject,
          html: params.html,
          text: params.text,
          attachments: params.attachments,
        });
      } else {
        const command = new SendEmailCommand({
          Source: this.fromEmail,
          Destination: {
            ToAddresses: params.to,
          },
          Message: {
            Subject: {
              Data: params.subject,
              Charset: 'UTF-8',
            },
            Body: {
              Html: {
                Data: params.html,
                Charset: 'UTF-8',
              },
              ...(params.text && {
                Text: {
                  Data: params.text,
                  Charset: 'UTF-8',
                },
              }),
            },
          },
        });

        await this.sesClient.send(command);
      }

      this.logger.log(`Email sent successfully to ${params.to.join(', ')}`);
    } catch (error) {
      this.logger.error('Failed to send email', error.stack);
      throw error;
    }
  }

  async verifyEmail(email: string) {
    this.logger.log(`Email verified (LocalStack): ${email}`);
  }
}

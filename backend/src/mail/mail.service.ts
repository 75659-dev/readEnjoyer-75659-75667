import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config/dist/config.service';
import nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  constructor(private config: ConfigService) {}

  async sendVerifyLink(email: string, verificationToken: string) {
    const verificationLink = `${this.config.get('FRONTEND_URL')}/auth/verify-email?token=${verificationToken}`;
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: this.config.get('MAIL_USER'),
        pass: this.config.get('MAIL_PASS'), // Application-specific password
      },
      port: 465,
      secure: true,
      tls: {
        rejectUnauthorized: false,
      },
    });
    await transporter.sendMail({
      from: this.config.get('MAIL_USER'),
      to: email,
      subject: 'Registration Confirmation',
      text: `Confirm your registration by clicking the following link: ${verificationLink}`,
    });
  }
}

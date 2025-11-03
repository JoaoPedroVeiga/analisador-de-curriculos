// src/resume/resume.module.ts
import { Module } from '@nestjs/common';
import { ResumeService } from './resume.service';
import { ResumeController } from './resume.controller';
import { PrismaModule } from 'prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ResumeController],
  providers: [ResumeService],
})
export class ResumeModule {}

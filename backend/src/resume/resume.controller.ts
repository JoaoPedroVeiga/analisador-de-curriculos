// src/resume/resume.controller.ts
import {
  Controller,
  Post,
  Get,
  Param,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ResumeService } from './resume.service';

@Controller('resume')
export class ResumeController {
  constructor(private readonly resumeService: ResumeService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadResume(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB
          new FileTypeValidator({ fileType: 'application/pdf' }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Nenhum arquivo enviado');
    }

    try {
      console.log(`Processando arquivo: ${file.originalname}`);

      // Extrair texto do PDF
      const text = await this.resumeService.extractTextFromPdf({
        buffer: file.buffer,
        originalname: file.originalname,
        mimetype: file.mimetype,
      });

      console.log('Texto extraído, iniciando análise com IA...');

      // Analisar com IA
      const analysis = await this.resumeService.analyzeResume(text);

      console.log('Salvando análise no banco...');

      // Salvar no banco
      const savedAnalysis = await this.resumeService.createResumeAnalysis(
        {
          buffer: file.buffer,
          originalname: file.originalname,
          mimetype: file.mimetype,
        },
        {
          ...analysis,
          originalText: text.substring(0, 5000), // Salvar apenas parte do texto
        },
      );

      console.log('Análise concluída com sucesso!');

      return {
        success: true,
        id: savedAnalysis.id,
        analysis: {
          summary: analysis.summary,
          strengths: analysis.strengths,
          improvements: analysis.improvements,
        },
      };
    } catch (error) {
      console.error('Erro no upload:', error);
      throw new BadRequestException(error.message);
    }
  }

  @Get()
  async getAllResumes() {
    return this.resumeService.getAllResumes();
  }

  @Get(':id')
  async getResume(@Param('id') id: string) {
    const resume = await this.resumeService.getResumeById(id);

    if (!resume) {
      throw new BadRequestException('Análise não encontrada');
    }

    return {
      ...resume,
      strengths: resume.strengths ? JSON.parse(resume.strengths) : [],
      improvements: resume.improvements ? JSON.parse(resume.improvements) : [],
    };
  }
}

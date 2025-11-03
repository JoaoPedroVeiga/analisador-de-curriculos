// src/resume/resume.service.ts - COM pdfjs-dist
import { Injectable, BadRequestException } from '@nestjs/common';

import { OpenAI } from 'openai';
import { PrismaService } from 'prisma/prisma.service';

// Configurar pdfjs-dist
const pdfjsLib = require('pdfjs-dist/legacy/build/pdf.js');

// Interface para o arquivo
interface ProcessedFile {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
}

@Injectable()
export class ResumeService {
  private openai: OpenAI;

  constructor(private prisma: PrismaService) {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async extractTextFromPdf(file: ProcessedFile): Promise<string> {
    try {
      console.log('Iniciando extração de texto do PDF com pdfjs-dist...');
      console.log(
        `📁 Arquivo: ${file.originalname}, Tamanho: ${file.buffer.length} bytes`,
      );

      // Converter Buffer para Uint8Array
      const uint8Array = new Uint8Array(
        file.buffer.buffer,
        file.buffer.byteOffset,
        file.buffer.byteLength,
      );

      console.log('📄 Carregando documento PDF...');

      // Carregar o PDF
      const loadingTask = pdfjsLib.getDocument(uint8Array);
      const pdf = await loadingTask.promise;

      console.log(`✅ PDF carregado: ${pdf.numPages} páginas`);

      let fullText = '';

      // Extrair texto de cada página
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        console.log(`📖 Processando página ${pageNum}/${pdf.numPages}...`);

        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();

        // Extrair texto dos itens
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ')
          .replace(/\s+/g, ' ')
          .trim();

        fullText += pageText + '\n\n';

        console.log(`📝 Página ${pageNum}: ${pageText.length} caracteres`);

        // Log parcial do conteúdo para debug
        if (pageText.length > 0) {
          console.log(
            `🔍 Amostra página ${pageNum}: "${pageText.substring(0, 100)}..."`,
          );
        }
      }

      console.log(
        `✅ Extração concluída: ${fullText.length} caracteres no total`,
      );

      if (!fullText || fullText.trim().length === 0) {
        console.log('❌ PDF não contém texto extraível');
        throw new Error(
          'PDF vazio ou não contém texto extraível. O PDF pode ser uma imagem ou estar protegido.',
        );
      }

      // Log do texto extraído para verificação
      console.log(
        `🔍 Amostra do texto extraído: "${fullText.substring(0, 200)}..."`,
      );

      return fullText;
    } catch (error) {
      console.error('❌ Erro detalhado na extração do PDF:', error);

      if (error.message.includes('Password')) {
        throw new BadRequestException(
          'PDF protegido por senha. Não é possível extrair texto.',
        );
      } else if (error.message.includes('Invalid')) {
        throw new BadRequestException('Arquivo PDF inválido ou corrompido.');
      } else {
        throw new BadRequestException(
          'Erro ao extrair texto do PDF: ' + error.message,
        );
      }
    }
  }

  async analyzeResume(text: string) {
    // Limitar o tamanho do texto para a API da OpenAI
    const limitedText = text.substring(0, 12000);

    const prompt = `
Você é um recrutador técnico com 10 anos de experiência em tecnologia. 
Analise o currículo abaixo com base em competências técnicas, experiência profissional, formação e soft skills.

Siga os passos mentalmente (não escreva eles, apenas use para raciocinar):
1. Identifique as principais áreas de atuação.
2. Extraia as habilidades técnicas e interpessoais.
3. Avalie a clareza e consistência do texto.
4. Sugira pontos de melhoria focando em empregabilidade e apresentação.

Em seguida, retorne SOMENTE um JSON no formato:
{
  "summary": "Resumo profissional objetivo (máx. 150 palavras)",
  "strengths": ["Ponto forte 1", "Ponto forte 2", "Ponto forte 3", "Ponto forte 4"],
  "improvements": ["Sugestão 1", "Sugestão 2", "Sugestão 3"],
  "score": {
    "technical": 0-100,
    "communication": 0-100,
    "experience": 0-100,
    "overall": 0-100
  }
}

Currículo para análise:
${limitedText}
`;

    try {
      console.log('🤖 Enviando para análise da IA...');
      console.log(
        `📊 Tamanho do texto enviado: ${limitedText.length} caracteres`,
      );

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content:
              'Você é um recrutador especialista em análise de currículos. Seja objetivo, profissional e construtivo. Retorne APENAS o JSON válido, sem markdown ou texto adicional.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.3,
        max_tokens: 1500,
      });

      const content = response.choices[0].message.content;

      if (!content) {
        throw new Error('Resposta vazia da OpenAI');
      }

      console.log('✅ Análise da IA concluída com sucesso');

      const analysis = JSON.parse(content);

      // Validar a estrutura da resposta
      if (!analysis.summary || !analysis.strengths || !analysis.improvements) {
        throw new Error('Resposta da IA incompleta');
      }

      return analysis;
    } catch (error) {
      console.error('❌ Erro na análise com IA:', error);
      throw new BadRequestException('Erro na análise com IA: ' + error.message);
    }
  }

  async createResumeAnalysis(file: ProcessedFile, analysis: any) {
    try {
      console.log('💾 Salvando análise no banco de dados...');

      const savedAnalysis = await this.prisma.resume.create({
        data: {
          fileName: file.originalname,
          originalText: analysis.originalText,
          summary: analysis.summary,
          strengths: JSON.stringify(analysis.strengths),
          improvements: JSON.stringify(analysis.improvements),
        },
      });

      console.log('✅ Análise salva com ID:', savedAnalysis.id);
      return savedAnalysis;
    } catch (error) {
      console.error('❌ Erro ao salvar no banco:', error);
      throw new BadRequestException(
        'Erro ao salvar análise no banco: ' + error.message,
      );
    }
  }

  async getAllResumes() {
    try {
      console.log('📋 Buscando histórico de análises...');

      const resumes = await this.prisma.resume.findMany({
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          fileName: true,
          summary: true,
          strengths: true,
          improvements: true,
          analysisDate: true,
          createdAt: true,
        },
      });

      console.log(`✅ Encontradas ${resumes.length} análises`);
      return resumes;
    } catch (error) {
      console.error('❌ Erro ao buscar análises:', error);
      throw new BadRequestException(
        'Erro ao buscar histórico: ' + error.message,
      );
    }
  }

  async getResumeById(id: string) {
    try {
      console.log(`🔍 Buscando análise com ID: ${id}`);

      const resume = await this.prisma.resume.findUnique({
        where: { id },
      });

      if (!resume) {
        console.log('❌ Análise não encontrada');
        throw new Error('Análise não encontrada');
      }

      console.log('✅ Análise encontrada:', resume.fileName);
      return resume;
    } catch (error) {
      console.error('❌ Erro ao buscar análise:', error);
      throw new BadRequestException('Erro ao buscar análise: ' + error.message);
    }
  }
}

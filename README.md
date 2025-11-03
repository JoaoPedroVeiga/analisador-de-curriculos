# 🧠 Analisador de Currículos com IA 

  

Uma aplicação **Fullstack com Inteligência Artificial** desenvolvida para **analisar currículos em PDF**, gerar um **resumo profissional** e destacar **pontos fortes e áreas de melhoria** — tudo de forma automática, rápida e precisa. 

  

--- 

  

## 🚀 Tecnologias Principais 

  

![Next.js](https://img.shields.io/badge/Next.js-000?style=for-the-badge&logo=nextdotjs) 

![NestJS](https://img.shields.io/badge/NestJS-e0234e?style=for-the-badge&logo=nestjs&logoColor=white) 

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white) 

![PostgreSQL](https://img.shields.io/badge/PostgreSQL-336791?style=for-the-badge&logo=postgresql&logoColor=white) 

![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white) 

![OpenAI](https://img.shields.io/badge/OpenAI-412991?style=for-the-badge&logo=openai&logoColor=white) 

![TailwindCSS](https://img.shields.io/badge/TailwindCSS-38BDF8?style=for-the-badge&logo=tailwindcss&logoColor=white) 

![Framer Motion](https://img.shields.io/badge/FramerMotion-0055FF?style=for-the-badge&logo=framer&logoColor=white) 

  

--- 

  

## 📋 Visão Geral do Projeto 

  

O **Analisador de Currículos com IA** é uma aplicação moderna que utiliza o poder da **OpenAI** para transformar arquivos PDF de currículos em **análises profissionais estruturadas**. 

  

A IA é responsável por: 

- Gerar **um resumo conciso e objetivo** do perfil profissional.   

- Identificar **pontos fortes** e **áreas de destaque** do candidato.   

- Retornar os dados em formato **JSON estruturado**, pronto para exibição. 

  

--- 

  

## 🏗️ Arquitetura e Estrutura 

  

### **Backend (NestJS + Prisma + PostgreSQL + OpenAI API)** 

- API REST construída com **NestJS**. 

- Extração de texto de PDFs usando **pdfjs-dist**. 

- Comunicação com a **API da OpenAI** (modelo GPT-4o-mini) para análise. 

- Banco de dados **PostgreSQL** gerenciado com **Prisma ORM**. 

- Estrutura escalável e pronta para deploy em contêiner Docker. 

  

**Endpoints principais:** 

| Método | Rota | Descrição | 

|--------|------|------------| 

| `POST` | `/resume/upload` | Recebe o PDF e realiza a análise com IA | 

| `GET`  | `/resume/:id`    | Retorna a análise armazenada no banco | 

  

--- 

  

### **Frontend (Next.js + TailwindCSS + Framer Motion)** 

- Interface moderna e responsiva construída com **Next.js 15**.   

- Upload de currículos via **react-dropzone**, com feedback visual dinâmico.   

- Exibição dos resultados com **animações do Framer Motion**.   

- Layout limpo e acessível, priorizando leitura e usabilidade.   

- Exibe: 

  - 🧾 Resumo do candidato   

  - 💪 Pontos fortes destacados   

  - 📊 Análise IA formatada   

  

--- 

  

## 🔁 Fluxo de Funcionamento 

  

1. **Upload do PDF** → O usuário envia seu currículo.   

2. **Extração de texto** → O backend processa o arquivo.   

3. **Análise de IA** → O texto é enviado à API da OpenAI.   

4. **Geração de Resposta** → A IA retorna um JSON com resumo e pontos fortes.   

5. **Persistência no Banco** → Dados são salvos via Prisma.   

6. **Exibição Frontend** → O resultado aparece na interface, com animações e feedback.   

  

--- 

  

## ⚙️ Boas Práticas Implementadas 

  

- ✅ Tipagem total com **TypeScript** 

- ✅ Código limpo e modular (padrões NestJS) 

- ✅ Linting e formatação com **ESLint** + **Prettier** 

- ✅ Integração entre camadas (API ↔ Frontend) 

- ✅ Containers **Docker** para fácil deploy 

- ✅ UX fluida e responsiva (Framer Motion + Tailwind) 

- ✅ Prompt de IA customizado e estruturado em JSON 


} 

 

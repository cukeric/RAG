# Agent Context: RAG Decision Support System (RAG)

## Project Overview

**RAG Decision Support System** is an enterprise-grade AI-powered decision support system designed for manufacturing organizations. It utilizes Retrieval-Augmented Generation (RAG) to analyze production data, quality reports, productivity metrics, and more.

## Key Features

- **RAG Engine**: Semantic search with Self-RAG grading for high-quality, grounded answers.
- **Manufacturing Analytics**: Production efficiency, quality trends, staffing performance, cost analysis.
- **Document Processing**: Supports PDF, DOCX, XLSX, CSV, TXT, images.
- **Quality Assurance**: Automated hallucination detection, relevance scoring, and source reasoning.
- **UI/UX**: Modern glassmorphic design with shadcn/ui and Framer Motion.

## Technology Stack

- **Frontend**: Next.js 16 (App Router), TypeScript 5, Tailwind CSS 4, shadcn/ui, Framer Motion.
- **Backend**: Next.js API Routes, Prisma ORM, SQLite (local database).
- **AI/ML**:
  - **LLM**: Groq API (Llama 3.1 70B Versatile).
  - **Embeddings**: OpenAI text-embedding-3-small (or fallback).
- **Runtime**: Bun (recommended) or Node.js.

## Architecture

- **Ingestion**: Documents are uploaded, processed (text extraction), chunked (fixed/recursive/semantic), and embedded.
- **Storage**: Embeddings and metadata are stored in SQLite via Prisma.
- **Retrieval**: Cosine similarity search finds relevant chunks.
- **Generation**: LLM generates answers based on retrieved context.
- **Evaluation**: Self-RAG grader evaluates retrieval quality, faithfulness, and relevance.

## Directory Structure

- `src/app`: Next.js App Router pages and API routes (`api/rag/upload`, `api/rag/query`).
- `src/lib`: Core logic for RAG (`rag.ts`), database (`db.ts`), embeddings (`embedding-service.ts`), and document processing (`document-processor.ts`).
- `src/components`: React components (UI and specialized).
- `prisma`: Database schema (`schema.prisma`).
- `db`: SQLite database file (`custom.db`).
- `test-docs`: Sample manufacturing documents for testing.

## Key Integration Points

- **Groq API**: Used for fast inference and grading.
- **OpenAI API**: Used for generating high-quality embeddings.
- **Prisma**: Database access layer.

## Development Commands

- `bun run dev`: Start development server.
- `bun run db:push`: Push schema changes to database.
- `bun run build`: Build for production.

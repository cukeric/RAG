# RAG Decision Support System

An enterprise-grade Decision Support System powered by Retrieval-Augmented Generation (RAG). This platform is designed for manufacturing organizations to analyze production data, quality reports, productivity metrics, and operational costs.

## 🚀 Key Features

- **Multi-format Document Ingestion**: Support for PDF, DOCX, XLS/XLSX, CSV, TXT, and Image OCR.
- **Advanced RAG Pipeline**: Local embeddings and semantic search powered by `@xenova/transformers`.
- **Self-RAG Grading**: Automated quality assessment, response relevance evaluation, and hallucination detection.
- **Manufacturing Analytics**: Specialized modules for production, quality, costing, and staffing analysis.
- **Enterprise-Grade UI**: Modern glassmorphic design built with Next.js, Tailwind CSS, and Framer Motion.
- **Downloadable Reports**: Export analysis results and findings directly to PDF.

## 🛠️ Technology Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Database**: [Prisma ORM](https://www.prisma.io/) with SQLite
- **AI/LLM**: [Groq API](https://groq.com/) (Llama 3.3 70B)
- **Embeddings**: Local `@xenova/transformers`
- **OCR**: [Tesseract.js](https://tesseract.projectnaptha.com/)
- **Document Parsing**: `pdf-parse`, `mammoth`, `xlsx`, `papaparse`

## 🏁 Quick Start

```bash
# Install dependencies
bun install

# Setup database
bun run db:push

# Start development server
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) to access the platform.

## 📁 Project Structure

- `src/app/`: Next.js App Router pages and API routes.
- `src/components/`: Reusable UI components (shadcn/ui).
- `src/lib/`: Core logic for document processing, embeddings, and RAG pipeline.
- `prisma/`: Database schema and migrations.
- `test-docs/`: Comprehensive test suite and sample documents.

## 🔐 Configuration

Create a `.env` file in the root directory:

```env
DATABASE_URL="file:./db/custom.db"
GROQ_API_KEY=your_groq_api_key
```

---

*Enterprise Intelligence for Modern Manufacturing.*

# RAG Decision Support System

An enterprise-grade Decision Support System powered by Retrieval-Augmented Generation (RAG). This platform is designed for manufacturing organizations to analyze production data, quality reports, productivity metrics, and operational costs.

# RAG Decision Support System - Architecture Overview

## System Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER INTERFACE                           │
│  ┌─────────────────┐           ┌─────────────────┐             │
│  │ Document Upload │           │    Query Input  │             │
│  │   (Drag & Drop) │           │  (Natural Lang) │             │
│  └────────┬────────┘           └────────┬────────┘             │
│           │                              │                      │
└───────────┼──────────────────────────────┼──────────────────────┘
            │                              │
            │                              ▼
            │                   ┌──────────────────┐
            │                   │  Query Analysis  │
            │                   │  & Results View  │
            │                   └──────────────────┘
            │
            ▼
┌───────────────────────────────────────────────────────────────┐
│                    API LAYER (Next.js)                         │
│  ┌─────────────────────┐         ┌─────────────────────┐     │
│  │  POST /api/rag/upload│         │ POST /api/rag/query │     │
│  │  - File ingestion    │         │  - RAG processing   │     │
│  │  - Processing status │         │  - Response gen     │     │
│  └──────────┬──────────┘         └──────────┬──────────┘     │
└─────────────┼───────────────────────────────┼─────────────────┘
              │                               │
              ▼                               ▼
┌───────────────────────────┐   ┌──────────────────────────────┐
│   Document Processor       │   │      RAG Pipeline            │
│  ┌─────────────────────┐   │   │  1. Embed Query              │
│  │ PDF/CSV/XLS/TXT/Img │   │   │  2. Semantic Search         │
│  │    Text Extraction  │   │   │  3. Retrieve Top-K Chunks    │
│  └──────────┬──────────┘   │   │  4. Generate Answer          │
│             │              │   │  5. Self-RAG Grading         │
│             ▼              │   │  6. Structure Output          │
│  ┌─────────────────────┐   │   │  7. Create Citations         │
│  │  Chunking Strategy  │   │   └──────────┬───────────────────┘
│  │ - Fixed-size       │   │              │
│  │ - Recursive        │   │              ▼
│  │ - Semantic         │   │   ┌──────────────────────────────┐
│  └──────────┬──────────┘   │   │    Self-RAG Grader           │
│             │              │   │  ┌────────────────────────┐  │
┌────────────────────────────────┐ │  └────────────────────────┘  │
│        VECTOR STORAGE          │ └──────────┬───────────────────┘
│  (SQLite + JSON embeddings)    │            │
│  ┌─────────────────────────┐   │            ▼
│  │ Document Table          │   │  ┌──────────────────────────────┐
│  │ - metadata              │   │  │  Structured Output Gen       │
│  │ - status                │   │  │  - Executive Summary         │
│  ├─────────────────────────┤   │  │  - Detailed Answer           │
│  │ Chunk Table             │   │  │  - Risk Indicators          │
│  │ - content               │   │  │  - Confidence Score          │
│  │ - embedding (JSON)      │   │  │  - Source Reasoning         │
│  │ - metadata              │   │  └──────────┬───────────────────┘
│  ├─────────────────────────┤   │             │
│  │ Query Table             │   │             ▼
│  │ - question, answer      │   │  ┌──────────────────────────────┐
│  │ - risk indicators       │   │  │  Database Storage           │
│  │ - confidence score      │   │  │  - Query records            │
│  ├─────────────────────────┤   │  │  - RAG grades               │
│  │ Citation Table          │   │  │  - Citations                │
│  │ - relevance scores      │   │  │  - Audit trail              │
│  ├─────────────────────────┤   │  └──────────────────────────────┘
│  │ RagGrade Table          │   │
│  │ - retrieval quality    │   │
│  │ - faithfulness          │   │
│  └─────────────────────────┘   │
└────────────────────────────────┘
             │
             ▼
┌──────────────────────────────────────────────────────────────┐
│                   EXTERNAL & LOCAL AI SERVICES                │
│  ┌─────────────────┐         ┌─────────────────┐              │
│  │  Groq Cloud     │         │ Xenova (Local)  │              │
│  │  - Llama 3.3 70B│         │ - Transformers  │              │
│  │  - Inference    │         │ - Embeddings    │              │
│  └─────────────────┘         └─────────────────┘              │
└──────────────────────────────────────────────────────────────┘
```

## Data Flow

### Upload Flow

1. User uploads files → `/api/rag/upload`
2. Document processor extracts text
3. Chunking strategy splits text
4. Embedding service generates vectors
5. Vectors stored in SQLite database
6. Status updated to "completed"

### Query Flow

1. User submits question → `/api/rag/query`
2. Query converted to embedding
3. Semantic search finds relevant chunks
4. Groq Llama 3.3 70B generates answer with context
5. Self-RAG grader evaluates quality
6. Structured output created (summary, risks, reasoning)
7. Citations linked to source chunks
8. Results stored and returned to user

## Quality Assurance Pipeline

```
┌─────────────────────────────────────────────────────────────┐
│                    SELF-RAG GRADING PIPELINE                │
│                                                             │
│  Step 1: Retrieval Quality Assessment                       │
│  ─────────────────────────────────────────                 │
│  Input: Query + Retrieved Chunks                            │
│  Output: Retrieval Score (0-1) + Relevance Reasoning        │
│                                                             │
│  Step 2: Response Generation                                │
│  ────────────────────────                                  │
│  Input: Query + Relevant Context                            │
│  Output: Draft Answer                                        │
│                                                             │
│  Step 3: Response Quality Evaluation                        │
│  ────────────────────────────────                          │
│  Input: Query + Context + Answer                           │
│  Metrics:                                                   │
│    • Response Relevance (0-1)                               │
│    • Faithfulness (0-1)                                     │
│    • Hallucination Risk (low/medium/high/critical)         │
│    • Confidence Score (0-1)                                 │
│                                                             │
│  Step 4: Risk Indicator Extraction                          │
│  ────────────────────────────────                          │
│  Input: Query + Context + Answer                           │
│  Output: Structured Risks (level, category, description)   │
│                                                             │
│  Step 5: Source Reasoning Generation                       │
│  ───────────────────────────────────                        │
│  Input: Query + Context + Citations                         │
│  Output: Step-by-step explanation                           │
│                                                             │
│  Step 6: Overall Evaluation & Recommendations               │
│  ─────────────────────────────────────────                 │
│  Input: All previous metrics                                │
│  Output:                                                    │
│    • Overall Quality Score                                  │
│    • Improvement Recommendations                            │
│    • Action Items (if needed)                               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Enterprise AI Features

### 1. Hallucination Mitigation

```
┌────────────────────────────────────┐
│   FAITHFULNESS VALIDATION         │
│                                    │
│  ✓ Context-grounded responses     │
│  ✓ Unsupported claim detection    │
│  ✓ Risk level classification       │
│  ✓ Automated quality scoring      │
└────────────────────────────────────┘
```

### 2. Explainability

```
┌────────────────────────────────────┐
│   COMPLETE TRACEABILITY            │
│                                    │
│  ✓ Source document references      │
│  ✓ Chunk-level citations           │
│  ✓ Relevance scores                │
│  ✓ Step-by-step reasoning          │
└────────────────────────────────────┘
```

### 3. Context Management

```
┌────────────────────────────────────┐
│   INTELLIGENT CHUNKING              │
│                                    │
│  ✓ Multiple strategies             │
│  ✓ Configurable overlap            │
│  ✓ Semantic coherence              │
│  ✓ Efficient vector storage        │
└────────────────────────────────────┘
```

### 4. Quality Metrics

```
┌────────────────────────────────────┐
│   MULTI-DIMENSIONAL EVALUATION      │
│                                    │
│  ✓ Retrieval quality               │
│  ✓ Response relevance              │
│  ✓ Faithfulness                    │
│  ✓ Overall quality                 │
│  ✓ Improvement recommendations     │
└────────────────────────────────────┘
```

## Database Schema Relationships

```
Document (1) ──────── (*) Chunk
    │                      │
    │                      │
    (*)                    (1)
    │                      │
    (*) Query ──────────── (*) Citation
    │
    (*)
    │
    (1) RagGrade
```

## Key Benefits

✅ **Trustworthy AI**: Self-RAG grading ensures reliable outputs
✅ **Explainable**: Complete audit trail with source citations
✅ **Flexible**: Multiple chunking strategies for different document types
✅ **Scalable**: Efficient vector search with SQLite
✅ **Enterprise-Ready**: Addresses all core AI concerns
✅ **User-Friendly**: Intuitive interface with real-time feedback

## 🚀 Key Features

- **Multi-format Document Ingestion**: Support for PDF, DOCX, XLS/XLSX, CSV, TXT, and Image OCR.
- **Advanced RAG Pipeline**:
  - **Groq Llama 3.3 70B**: High-performance reasoning and answer generation
  - **Local Embeddings**: Privacy-first vector generation via `@xenova/transformers` (all-MiniLM-L6-v2)
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
- **Embeddings**: Local `@xenova/transformers` (all-MiniLM-L6-v2)
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

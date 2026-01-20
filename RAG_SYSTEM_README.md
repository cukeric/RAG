# RAG Decision Support System - Complete System Guide

**AI-Powered Manufacturing & Quality Analytics Platform**

An enterprise-grade AI-powered decision support system using Retrieval-Augmented Generation (RAG) with advanced features including Self-RAG grading, hallucination detection, and explainable AI. Designed specifically for manufacturing organizations to analyze production data, quality reports, productivity metrics, staffing performance, and operational costs.

## Features

### Core RAG Capabilities
- **Multi-format Document Ingestion**: Support for PDF, DOC, DOCX, XLS, XLSX, CSV, TXT, and image files
- **Advanced Chunking Strategies**:
  - Fixed-size chunking with configurable overlap
  - Recursive chunking (paragraphs → sentences)
  - Semantic chunking for better coherence
- **Vector Embeddings**: Local Xenova Embeddings (@xenova/transformers) model for semantic understanding
- **Semantic Search**: Cosine similarity-based retrieval with top-K and minimum relevance filtering

### Manufacturing Analytics Capabilities
- **Production Analysis**: Efficiency metrics, output tracking, throughput analysis
- **Quality Monitoring**: First Pass Yield, defect rates, quality trends
- **Staffing Evaluation**: Performance metrics, productivity analysis, utilization rates
- **Cost Analysis**: Department cost estimates, operational expense tracking
- **Defect Impact Analysis**: Reduction savings, ROI calculations, improvement opportunities

### Self-RAG Grading & Quality Assurance
- **Retrieval Quality Assessment**: Automated scoring (0-1) of retrieved context relevance
- **Response Relevance Evaluation**: Measure of how well answers address queries
- **Faithfulness Scoring**: Detection of hallucinations and unsupported claims
- **Risk Level Classification**: low, medium, high, or critical hallucination risk
- **Comprehensive Reasoning**: Detailed explanations for all quality assessments

### Structured Output Generation
- **Executive Summaries**: Concise 2-3 sentence overviews
- **Detailed Answers**: Comprehensive responses to queries
- **Risk Indicators**: Structured risk analysis with:
  - Level classification
  - Category assignment (financial, operational, compliance, etc.)
  - Description and confidence scores
- **Confidence Scoring**: Overall quality metrics
- **Source Reasoning**: Step-by-step explanations of answer derivation

### Explainability & Citations
- **Source Tracking**: Every answer cites specific document chunks
- **Relevance Scores**: Per-citation similarity metrics
- **Document References**: Clear links to source documents
- **Audit Trail**: All queries, grades, and citations stored in database

## Architecture

### Database Schema (Prisma + SQLite)

```
Document {
  id, fileName, fileType, fileSize, status, metadata
  chunks: Chunk[]
  queries: Query[]
}

Chunk {
  id, documentId, content, chunkIndex, embedding, metadata
  document: Document
  citations: Citation[]
}

Query {
  id, question, answer, summary, riskIndicators, confidenceScore, sourceReasoning
  document: Document?
  citations: Citation[]
  ragGrades: RagGrade[]
}

Citation {
  id, chunkId, queryId, relevance, used
  chunk: Chunk
  query: Query
}

RagGrade {
  id, queryId, gradeType, score, reason
  query: Query
}
```

### Technology Stack

**Frontend**
- Next.js 16 with App Router
- TypeScript 5
- Tailwind CSS 4
- shadcn/ui components
- Lucide icons

**Backend**
- Next.js API Routes
- Prisma ORM with SQLite
- Groq AI SDK (LLM operations)
- OpenAI SDK (embeddings, optional)

**Document Processing**
- papaparse for CSV files
- xlsx for Excel spreadsheets

**AI Models**
- Groq Llama 3.3 70B (generation & grading)
- Local Xenova Embeddings (@xenova/transformers) (embeddings, optional)
- Fallback hash-based embeddings (testing)

## API Endpoints

### Upload Documents
```
POST /api/rag/upload
Content-Type: multipart/form-data

Body: FormData with 'files' field

Response:
{
  "success": true,
  "documents": [...],
  "message": "Successfully processed N file(s)"
}
```

### Query Documents
```
POST /api/rag/query
Content-Type: application/json

Body:
{
  "question": "What are the key risks..."
}

Response:
{
  "id": "query-id",
  "question": "...",
  "answer": "...",
  "summary": "...",
  "confidenceScore": 0.85,
  "riskIndicators": [...],
  "citations": [...],
  "sourceReasoning": [...],
  "evaluation": {
    "retrieval_quality": 0.9,
    "response_relevance": 0.85,
    "faithfulness": 0.88,
    "hallucination_risk": "low",
    "overall_quality": 0.88,
    "recommendations": []
  }
}
```

### Get Documents
```
GET /api/rag/upload

Response:
{
  "documents": [
    {
      "id": "...",
      "fileName": "...",
      "fileType": "...",
      "fileSize": 12345,
      "status": "completed",
      "chunks": [...],
      "_count": {
        "chunks": 10,
        "queries": 5
      }
    }
  ]
}
```

## Usage

### 1. Upload Documents
- Navigate to the "Document Upload" tab
- Drag and drop files or click "Browse Files"
- Supported formats: PDF, CSV, XLS, XLSX, TXT, PNG, JPG, JPEG, GIF
- Wait for processing to complete (status shows "Completed")

### 2. Query Documents
- Switch to the "Query & Analysis" tab
- Enter your question in the text area
- Click "Analyze Documents"
- Review the structured results:
  - Executive Summary
  - Detailed Answer
  - Risk Indicators (if any)
  - Citations with sources
  - Source Reasoning

### 3. Interpret Results
- **Confidence Score**: Higher scores indicate more reliable answers
- **Risk Indicators**: Color-coded (green=low, yellow=medium, orange=high, red=critical)
- **Citations**: Click to see source content and relevance scores
- **Evaluation Metrics**: View quality scores and recommendations

## Enterprise AI Concerns Addressed

### 1. Hallucination Mitigation
- Self-RAG grading with faithfulness scoring
- Hallucination risk detection and classification
- Requirement for context-based responses
- Audit trail of all grades and evaluations

### 2. Context Window Management
- Smart chunking with configurable sizes and overlap
- Top-K retrieval to manage context size
- Semantic coherence in chunk boundaries
- Efficient vector storage and retrieval

### 3. Explainability
- Step-by-step source reasoning
- Per-citation relevance tracking
- Document-level traceability
- Quality metric transparency

### 4. Evaluation Strategies
- Multi-metric assessment (retrieval, relevance, faithfulness)
- Automated quality scoring
- Recommendations for improvement
- Historical query tracking

### 5. Data Privacy & Security
- Local SQLite database
- No data shared beyond OpenAI API
- Document-level access control
- Comprehensive audit logs

## Development

### Prerequisites
- Node.js 18+
- Bun runtime
- Groq API key (provided)
- OpenAI API key (optional, for high-quality embeddings)

### Installation
```bash
bun install
```

### Configuration
Update `.env` file:
```env
DATABASE_URL="file:./db/custom.db"
GROQ_API_KEY="your_groq_api_key_here"
# Optional - for high-quality embeddings
OPENAI_API_KEY="your-openai-api-key"
```

### Database Setup
```bash
bun run db:push
```

### Development Server
```bash
bun run dev
```

The application will be available at `http://localhost:3000`

**Note**: See [GROQ_INTEGRATION.md](./GROQ_INTEGRATION.md) for details on Groq API usage.

## Key Components

### Frontend (`src/app/page.tsx`)
- Document upload interface with drag-and-drop
- Query interface with results display
- Real-time status updates
- Responsive design

### Backend Services
- **Document Processor** (`src/lib/document-processor.ts`)
  - Multi-format extraction
  - Chunking and embedding
  - Batch processing support

- **Embedding Service** (`src/lib/embedding-service.ts`)
  - OpenAI embedding generation
  - Vector storage
  - Similarity search

- **RAG Utilities** (`src/lib/rag.ts`)
  - Chunking strategies
  - Cosine similarity
  - Semantic search

- **Self-RAG Grader** (`src/lib/self-rag-grader.ts`)
  - Retrieval quality assessment
  - Response evaluation
  - Hallucination detection
  - Structured output generation

### API Routes
- **Upload** (`src/app/api/rag/upload/route.ts`)
  - Multi-file upload
  - Document processing
  - Status tracking

- **Query** (`src/app/api/rag/query/route.ts`)
  - RAG-based querying
  - Self-RAG grading
  - Citation generation

## Best Practices

### For Users
1. Upload relevant documents for your queries
2. Ask specific, well-formed questions
3. Review confidence scores and risk indicators
4. Always verify critical information with source documents
5. Use source reasoning to understand answer derivation

### For Developers
1. Monitor hallucination risk levels
2. Review evaluation recommendations
3. Adjust chunking strategies based on document types
4. Use the audit trail for compliance and debugging
5. Leverage the Self-RAG grades for quality assurance

## Future Enhancements
- [ ] Multi-document comparison queries
- [ ] Advanced filtering and sorting
- [ ] Export query results
- [ ] Document versioning
- [ ] User authentication and access control
- [ ] Custom chunking strategies
- [ ] Hybrid search (semantic + keyword)
- [ ] Query templates and saved queries
- [ ] Real-time collaborative analysis

## License
Internal use only - Enterprise AI Decision Support System

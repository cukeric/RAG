# RAG Decision Support System

**AI-Powered Manufacturing & Quality Analytics Platform**

---

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Next.js](https://img.shields.io/badge/Next.js-16.1-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Groq](https://img.shields.io/badge/Groq-3.000%2B%20queries%2Fmonth-green)

---

## Overview

**RAG Decision Support System** is a production-ready AI-powered decision support platform designed specifically for manufacturing organizations. It provides comprehensive analysis of production data, quality reports, productivity metrics, staffing performance, departmental performance, cost estimates, and defect reduction savings using advanced Retrieval-Augmented Generation (RAG) technology.

### Key Capabilities

- ✅ **Multi-format Document Processing**: PDF, DOC, DOCX, XLS, XLSX, CSV, TXT, JPG, PNG, GIF
- ✅ **Advanced Semantic Search**: Vector embeddings with cosine similarity
- ✅ **Self-RAG Quality Grading**: Automated quality assessment with hallucination detection
- ✅ **Manufacturing Analytics**: Production, quality, cost, and staffing analysis
- ✅ **Risk Indicators**: Automated risk classification (low/medium/high/critical)
- ✅ **Confidence Scoring**: Reliability metrics for all answers
- ✅ **Source Citations**: Complete traceability to source documents
- ✅ **Modern UI**: Glassmorphic design with smooth animations
- ✅ **Cost-Effective**: Groq free tier support (3,000+ queries/month)

---

## Quick Start

### Prerequisites
- Node.js 18+ or Bun runtime
- Groq API key (get free at https://console.groq.com)
- OpenAI API key (optional, for embeddings)

### Installation

```bash
# Clone or extract the downloaded package
cd plant-intelligence-systems

# Install dependencies
bun install

# Configure environment
cp .env.example .env
# Edit .env with your GROQ_API_KEY

# Setup database
bun run db:push

# Start development server
bun run dev
```

Access the application at: `http://localhost:3000`

### First Steps

1. **Upload Documents**
   - Navigate to "Document Upload" tab
   - Drag & drop manufacturing documents
   - Supported: PDF, DOC, DOCX, XLS, CSV, TXT, Images

2. **Run Queries**
   - Switch to "Analysis & Insights" tab
   - Ask questions about your documents
   - Example: "What is the overall production efficiency?"

3. **Review Results**
   - Check executive summaries
   - Review detailed answers
   - Examine risk indicators
   - Verify source citations

---

## Documentation

### Getting Started
- 📖 **[DOWNLOAD_README.md](./DOWNLOAD_README.md)** - Download & deployment guide
- 📖 **[QUICK_START.md](./QUICK_START.md)** - 5-minute setup guide

### System Documentation
- 📖 **[DOCUMENTATION_INDEX.md](./DOCUMENTATION_INDEX.md)** - Complete documentation index
- 📖 **[RAG_SYSTEM_README.md](./RAG_SYSTEM_README.md)** - Detailed system guide
- 📖 **[RAG_ARCHITECTURE.md](./RAG_ARCHITECTURE.md)** - Architecture diagrams

### API & Integration
- 📖 **[GROQ_INTEGRATION.md](./GROQ_INTEGRATION.md)** - Groq API configuration
- 📖 **[GROQ_MIGRATION_COMPLETE.md](./GROQ_MIGRATION_COMPLETE.md)** - Migration details

### Testing & Quality
- 📖 **[COMPLETE_TEST_SUITE.md](./COMPLETE_TEST_SUITE.md)** - Test suite guide
- 📖 **[test-docs/README.md](./test-docs/README.md)** - Test file documentation

### Development
- 📖 **[RAG_ENTERPRISE_FEATURES.md](./RAG_ENTERPRISE_FEATURES.md)** - Enterprise features
- 📖 **[COST_ANALYSIS.md](./COST_ANALYSIS.md)** - Cost breakdown
- 📖 **[GROQ_FREE_TIER.md](./GROQ_FREE_TIER.md)** - Free tier details
- 📖 **[worklog.md](./worklog.md)** - Implementation log

---

## Features

### Document Processing
- **Multi-format Support**: PDF, DOC, DOCX, XLS, XLSX, CSV, TXT, JPG, PNG, GIF
- **Automatic Extraction**: Text extraction from all formats
- **Intelligent Chunking**: Fixed, recursive, and semantic chunking strategies
- **Vector Embeddings**: OpenAI text-embedding-3-small for semantic understanding

### Manufacturing Analytics
- **Production Analysis**:
  - Overall production efficiency metrics
  - Departmental performance comparison
  - Output and throughput tracking
  - Bottleneck identification

- **Quality Monitoring**:
  - First Pass Yield (FPY) analysis
  - Defect rate tracking
  - Quality trend monitoring
  - Defect category analysis

- **Staffing Evaluation**:
  - Performance metrics
  - Productivity analysis
  - Utilization rates
  - Training effectiveness

- **Cost Analysis**:
  - Department cost estimates
  - Operational expense tracking
  - Cost per unit analysis
  - Savings opportunities

- **Defect Impact**:
  - Defect rate reduction analysis
  - Savings calculations
  - ROI assessment
  - Improvement prioritization

### Quality Assurance
- **Self-RAG Grading**:
  - Retrieval quality assessment (0-1)
  - Response relevance evaluation (0-1)
  - Faithfulness scoring (0-1)
  - Overall quality metric (0-1)

- **Hallucination Detection**:
  - Risk classification (low/medium/high/critical)
  - Unsupported claim identification
  - Source verification
  - Confidence scoring

### Structured Output
- **Executive Summaries**: Quick 2-3 sentence overviews
- **Detailed Answers**: Comprehensive responses with data points
- **Risk Indicators**: Structured risk analysis with categories
- **Source Reasoning**: Step-by-step answer derivation
- **Citations**: Document-level references with relevance scores

### User Interface
- **Glassmorphic Design**: Modern, calming aesthetic
- **Factory Iconography**: Production-specific visual elements
- **Smooth Animations**: Framer Motion transitions
- **Responsive Layout**: Mobile-first design
- **Progress Indicators**: Visual feedback during processing
- **Status Badges**: Clear document and query status

---

## API Endpoints

### Upload Documents
```bash
POST /api/rag/upload
Content-Type: multipart/form-data

Response:
{
  "success": true,
  "documents": [
    {
      "fileName": "manufacturing_report.pdf",
      "chunkCount": 42,
      "status": "completed"
    }
  ]
}
```

### Query Documents
```bash
POST /api/rag/query
Content-Type: application/json

Request:
{
  "question": "What is the overall production efficiency?"
}

Response:
{
  "question": "What is the overall production efficiency?",
  "answer": "The overall production efficiency across all departments is 87.3%...",
  "summary": "Overall production efficiency is 87.3%, with Assembly at 92%...",
  "confidenceScore": 0.92,
  "riskIndicators": [...],
  "citations": [...],
  "sourceReasoning": [...],
  "evaluation": {
    "retrieval_quality": 0.89,
    "response_relevance": 0.92,
    "faithfulness": 0.88,
    "hallucination_risk": "low",
    "overall_quality": 0.90
  }
}
```

### Get Documents
```bash
GET /api/rag/upload

Response:
{
  "documents": [
    {
      "id": 1,
      "fileName": "manufacturing_report.pdf",
      "fileType": "PDF",
      "chunkCount": 42,
      "status": "completed"
    }
  ]
}
```

---

## Example Queries

### Production Analysis
- "What is the overall production efficiency and which department needs improvement?"
- "How has production output changed over the past quarter?"
- "Which production lines are underperforming?"

### Quality Assessment
- "What is the current First Pass Yield and what are the main defect categories?"
- "How has defect rate changed after implementing quality improvements?"
- "What are the primary quality issues in the assembly department?"

### Staffing & Productivity
- "What is the staffing utilization rate across departments?"
- "Which departments show the highest productivity improvements?"
- "What training initiatives have improved staff performance?"

### Cost Analysis
- "What are the cost estimates per department for the current fiscal year?"
- "How much savings have been achieved through defect rate reduction?"
- "What are the major cost drivers in manufacturing operations?"

---

## Technology Stack

### Frontend
- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **Components**: shadcn/ui (New York style)
- **Icons**: Lucide React
- **Animations**: Framer Motion

### Backend
- **API**: Next.js API Routes
- **Database**: Prisma ORM + SQLite
- **AI**: Groq Llama 3.1 70B (3,000+ free queries/month)
- **Embeddings**: OpenAI text-embedding-3-small

### Document Processing
- **PDF**: pdf-parse 
- **DOCX**: z-ai-web-dev-sdk docx skill
- **Excel/CSV**: xlsx library
- **TXT**: Native text processing
- **Images**: VLM for visual content

---

## Cost & Performance

### Groq Free Tier
- **3,000+ queries/month** - FREE
- **Llama 3.1 70B model** - State-of-the-art reasoning
- **Fast inference** - Low latency (~2-5 seconds per query)

### OpenAI Embeddings
- **text-embedding-3-small**: ~$0.02 per 1M tokens
- **Typical monthly cost**: $0.05 - $0.50

### Total Monthly Cost
- **Free tier usage**: $0 - $0.50/month
- **Scale to paid**: $20 - $50/month (if exceeding free limits)

### Performance Metrics
- **Query Speed**: 2-5 seconds typical
- **Document Processing**: 1-3 seconds per file
- **Accuracy**: 85-95% confidence on well-formed queries
- **Retrieval Quality**: 0.7-0.95 typical scores

---

## Test Suite

The system includes a comprehensive test suite with:

### Test Documents (10 files)
- `manufacturing_quality_report.pdf` - Quality metrics and trends
- `manufacturing_performance.docx` - Performance KPIs
- `project_data.xls` - Project performance data
- `project_status.csv` - Status tracking
- `q3_financial_report.pdf` - Financial analysis
- `financial_report.txt` - Financial summary
- `strategic_plan.txt` - Business strategy
- `risk_assessment.txt` - Risk analysis
- `employee_handbook.txt` - Staffing guidelines
- `strategic_plan_visual.jpg` - Visual strategy document

### Test Scenarios (16 cases)
- Production efficiency analysis
- Quality trend evaluation
- Cost estimation
- Staffing performance
- Departmental comparisons
- Defect rate analysis
- Savings calculations
- Risk assessment

See [COMPLETE_TEST_SUITE.md](./COMPLETE_TEST_SUITE.md) for details.

---

## Deployment

### Local Development
```bash
bun run dev
```

### Production (Vercel)
```bash
bun install -g vercel
vercel
```

### Production (Docker)
```bash
docker build -t plant-intelligence-systems .
docker run -p 3000:3000 plant-intelligence-systems
```

### Production (VPS/PM2)
```bash
bun install -g pm2
pm2 start bun --name "plant-intelligence" -- run start
pm2 save
pm2 startup
```

See [DOWNLOAD_README.md](./DOWNLOAD_README.md) for detailed deployment guide.

---

## File Structure

```
plant-intelligence-systems/
├── src/
│   ├── app/
│   │   ├── page.tsx                    # Main UI
│   │   ├── layout.tsx                  # Root layout
│   │   └── api/
│   │       └── rag/
│   │           ├── upload/route.ts     # Upload endpoint
│   │           └── query/route.ts      # Query endpoint
│   ├── lib/
│   │   ├── db.ts                      # Database client
│   │   ├── rag.ts                     # RAG logic
│   │   ├── embedding-service.ts        # Embeddings
│   │   ├── document-processor.ts       # File processing
│   │   └── self-rag-grader.ts        # Quality grading
│   ├── components/ui/                  # UI components
│   └── hooks/                         # React hooks
├── prisma/
│   └── schema.prisma                  # Database schema
├── db/
│   └── custom.db                      # SQLite database
├── test-docs/                         # Test suite
│   ├── manufacturing_quality_report.pdf
│   ├── manufacturing_performance.docx
│   └── ... (8 more test files)
├── Documentation/                      # All documentation files
│   ├── DOWNLOAD_README.md             # Start here for deployment
│   ├── QUICK_START.md                 # Start here for setup
│   ├── DOCUMENTATION_INDEX.md         # Complete index
│   ├── RAG_SYSTEM_README.md          # System guide
│   ├── RAG_ARCHITECTURE.md           # Architecture
│   ├── COMPLETE_TEST_SUITE.md         # Test suite
│   └── ... (more documentation)
├── package.json                      # Dependencies
├── bun.lock                          # Lock file
├── tsconfig.json                     # TypeScript config
├── tailwind.config.ts                # Tailwind config
├── next.config.ts                    # Next.js config
├── .env.example                      # Environment template
└── README.md                         # This file
```

---

## Environment Configuration

Create a `.env` file from `.env.example`:

```env
DATABASE_URL="file:./db/custom.db"
GROQ_API_KEY=your-groq-api-key-here
OPENAI_API_KEY=your-openai-api-key-here
```

### Getting API Keys

**Groq API (Required)**
1. Visit https://console.groq.com
2. Sign up for free account
3. Create new API key
4. Add to `.env` file

**OpenAI API (Optional)**
1. Visit https://platform.openai.com
2. Create account
3. Generate API key
4. Add to `.env` file for high-quality embeddings

---

## Troubleshooting

### Build Errors
```bash
rm -rf .next
bun install
bun run dev
```

### Database Issues
```bash
bun run db:reset
```

### API Key Issues
- Verify GROQ_API_KEY is correct
- Check API key has necessary permissions
- Ensure no extra spaces or quotes in .env file

### Port Already in Use
```bash
lsof -ti:3000 | xargs kill -9
```

---

## Support & Resources

### Documentation
- **DOWNLOAD_README.md** - Download & deployment guide
- **QUICK_START.md** - 5-minute setup guide
- **DOCUMENTATION_INDEX.md** - Complete documentation index

### External Resources
- Groq Console: https://console.groq.com
- Groq Docs: https://console.groq.com/docs
- OpenAI Platform: https://platform.openai.com
- Next.js Docs: https://nextjs.org/docs
- Prisma Docs: https://www.prisma.io/docs

---

## License

Internal use only - RAG Decision Support System
AI-Powered Manufacturing & Quality Analytics Platform

---

## Version

**v1.0.0** - Production Release

### What's New
- ✅ Complete RAG system implementation
- ✅ Multi-format document support
- ✅ Self-RAG quality grading
- ✅ Manufacturing analytics features
- ✅ Glassmorphic UI design
- ✅ Groq API integration (3,000+ free queries/month)
- ✅ Comprehensive test suite (10 documents, 16 scenarios)
- ✅ Complete documentation

---

## Next Steps

1. ✅ **Review Documentation** - Start with DOWNLOAD_README.md
2. ✅ **Set Up Environment** - Configure API keys
3. ✅ **Install Dependencies** - Run `bun install`
4. ✅ **Start Server** - Run `bun run dev`
5. ✅ **Upload Documents** - Add manufacturing documents
6. ✅ **Run Queries** - Test with example questions
7. ✅ **Run Test Suite** - Validate with provided test files
8. ✅ **Deploy to Production** - Follow deployment guide

---

**Built with Next.js 16, TypeScript, Prisma, Groq, OpenAI, and shadcn/ui**

**RAG Decision Support System - AI-Powered Manufacturing & Quality Analytics**

For comprehensive documentation, see the Documentation folder.

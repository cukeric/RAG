# Plant Intelligence Systems - Download & Deployment Guide

**AI-Powered Manufacturing & Quality Analytics Platform**

---

## System Overview

**Plant Intelligence Systems** is a production-ready AI-powered decision support platform designed for manufacturing organizations. It provides comprehensive analysis of production data, quality reports, productivity metrics, staffing performance, departmental performance, cost estimates, and defect reduction savings.

### Key Features
- ✅ Multi-format document processing (PDF, DOC, DOCX, XLS, XLSX, CSV, TXT, Images)
- ✅ Advanced semantic search with vector embeddings
- ✅ Self-RAG quality grading and hallucination detection
- ✅ Structured manufacturing analytics output
- ✅ Risk indicators and confidence scoring
- ✅ Source citations and explainability
- ✅ Modern glassmorphic UI with animations
- ✅ Cost-effective Groq API integration (3,000+ free queries/month)

---

## What's Included

### Core Application
- ✅ Complete Next.js 16 application
- ✅ TypeScript source code
- ✅ Prisma database schema
- ✅ API endpoints for document upload and querying
- ✅ Modern UI with shadcn/ui components

### Documentation
- ✅ Complete system documentation
- ✅ Architecture diagrams
- ✅ API reference guide
- ✅ Quick start guide
- ✅ Test suite documentation

### Test Suite
- ✅ 10 manufacturing test documents
- ✅ 16 test scenarios
- ✅ Test execution guide
- ✅ Success criteria

### Configuration
- ✅ Pre-configured environment files
- ✅ Database setup scripts
- ✅ Tailwind CSS configuration
- ✅ TypeScript configuration

---

## Download Instructions

### Option 1: Download as ZIP Archive

#### Step 1: Navigate to Project Directory
```bash
cd /home/z/my-project
```

#### Step 2: Create Download Package
```bash
# Create a clean download package
mkdir -p plant-intelligence-systems-download

# Copy core application files
cp -r src plant-intelligence-systems-download/
cp -r prisma plant-intelligence-systems-download/
cp -r db plant-intelligence-systems-download/
cp package.json plant-intelligence-systems-download/
cp bun.lock plant-intelligence-systems-download/
cp tsconfig.json plant-intelligence-systems-download/
cp tailwind.config.ts plant-intelligence-systems-download/
cp postcss.config.mjs plant-intelligence-systems-download/
cp next.config.ts plant-intelligence-systems-download/
cp eslint.config.mjs plant-intelligence-systems-download/
cp components.json plant-intelligence-systems-download/

# Copy documentation
cp -r *.md plant-intelligence-systems-download/

# Copy test files
cp -r test-docs plant-intelligence-systems-download/

# Copy environment template
cp .env plant-intelligence-systems-download/.env.example

# Create archive
cd plant-intelligence-systems-download
zip -r ../plant-intelligence-systems-v1.0.zip .
cd ..
```

#### Step 3: Download the Archive
The archive `plant-intelligence-systems-v1.0.zip` is now ready for download.

---

### Option 2: Selective File Download

#### Core Files Only (Minimum Viable System)
```bash
# Create minimal package
mkdir -p plant-intelligence-minimal

# Copy essential files
cp -r src plant-intelligence-minimal/
cp -r prisma plant-intelligence-minimal/
cp package.json plant-intelligence-minimal/
cp bun.lock plant-intelligence-minimal/
cp tsconfig.json plant-intelligence-minimal/
cp tailwind.config.ts plant-intelligence-minimal/
cp next.config.ts plant-intelligence-minimal/
cp .env plant-intelligence-minimal/.env.example

# Copy essential documentation
cp QUICK_START.md plant-intelligence-minimal/
cp DOCUMENTATION_INDEX.md plant-intelligence-minimal/

# Create archive
cd plant-intelligence-minimal
zip -r ../plant-intelligence-systems-minimal-v1.0.zip .
cd ..
```

#### Complete System with Tests
```bash
# Follow Option 1 for complete system
```

---

## Deployment Guide

### Prerequisites
- Node.js 18+ or Bun runtime
- Groq API key (get free at https://console.groq.com)
- OpenAI API key (optional, for embeddings)
- 2GB+ RAM available

### Local Deployment

#### Step 1: Extract Files
```bash
unzip plant-intelligence-systems-v1.0.zip
cd plant-intelligence-systems-v1.0
```

#### Step 2: Install Dependencies
```bash
bun install
# or
npm install
```

#### Step 3: Configure Environment
```bash
# Copy environment template
cp .env.example .env

# Edit .env file with your API keys
# Required: GROQ_API_KEY
# Optional: OPENAI_API_KEY
```

Example `.env`:
```env
DATABASE_URL="file:./db/custom.db"
GROQ_API_KEY=your-groq-api-key-here
OPENAI_API_KEY=your-openai-api-key-here
```

#### Step 4: Setup Database
```bash
bun run db:push
```

#### Step 5: Start Application
```bash
bun run dev
```

The application will be available at: `http://localhost:3000`

---

### Production Deployment

#### Option 1: Vercel (Recommended)
```bash
# Install Vercel CLI
bun install -g vercel

# Deploy
vercel

# Follow prompts for configuration
# Set environment variables in Vercel dashboard
```

#### Option 2: Docker
```bash
# Build Docker image
docker build -t plant-intelligence-systems .

# Run container
docker run -p 3000:3000 \
  -e DATABASE_URL="file:./db/custom.db" \
  -e GROQ_API_KEY="your-groq-api-key" \
  -e OPENAI_API_KEY="your-openai-api-key" \
  plant-intelligence-systems
```

#### Option 3: VPS/Cloud Server
```bash
# Clone or upload files
# Install dependencies
bun install

# Configure environment
cp .env.example .env
# Edit .env with production values

# Setup database
bun run db:push

# Start with PM2 (process manager)
bun install -g pm2
pm2 start bun --name "plant-intelligence" -- run start
pm2 save
pm2 startup
```

---

## Configuration

### Environment Variables

#### Required Variables
```env
DATABASE_URL="file:./db/custom.db"
GROQ_API_KEY=your-groq-api-key
```

#### Optional Variables
```env
OPENAI_API_KEY=your-openai-api-key
NODE_ENV=production
PORT=3000
```

### Database Configuration

#### SQLite (Default)
```env
DATABASE_URL="file:./db/custom.db"
```

#### PostgreSQL (Production)
```env
DATABASE_URL="postgresql://user:password@localhost:5432/plant_intelligence"
```

Update `prisma/schema.prisma` for PostgreSQL and run:
```bash
bunx prisma generate
bun run db:push
```

---

## API Endpoints

### Document Upload
```bash
POST /api/rag/upload
Content-Type: multipart/form-data

Files: Multiple files supported
Formats: PDF, DOC, DOCX, XLS, XLSX, CSV, TXT, JPG, PNG, GIF

Response:
{
  "success": true,
  "documents": [
    {
      "fileName": "report.pdf",
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

Body:
{
  "question": "What is the overall production efficiency?"
}

Response:
{
  "question": "What is the overall production efficiency?",
  "answer": "...",
  "summary": "...",
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
      "fileName": "report.pdf",
      "fileType": "PDF",
      "chunkCount": 42,
      "status": "completed",
      "processedAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

---

## File Structure

```
plant-intelligence-systems-v1.0/
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
├── Documentation/
│   ├── QUICK_START.md                 # Start here!
│   ├── DOWNLOAD_README.md             # This file
│   ├── DOCUMENTATION_INDEX.md         # All docs index
│   ├── RAG_SYSTEM_README.md          # Complete guide
│   ├── RAG_ARCHITECTURE.md           # Architecture
│   ├── RAG_ENTERPRISE_FEATURES.md    # Features
│   ├── GROQ_INTEGRATION.md           # Groq setup
│   ├── COST_ANALYSIS.md              # Cost analysis
│   ├── COMPLETE_TEST_SUITE.md         # Test suite
│   └── worklog.md                   # Implementation log
├── package.json                      # Dependencies
├── bun.lock                          # Lock file
├── tsconfig.json                     # TypeScript config
├── tailwind.config.ts                # Tailwind config
├── next.config.ts                    # Next.js config
├── .env.example                      # Environment template
└── README.md                         # Main readme
```

---

## Quick Start After Download

### 1. Install Dependencies
```bash
bun install
```

### 2. Configure Environment
```bash
cp .env.example .env
# Edit .env with your GROQ_API_KEY
```

### 3. Setup Database
```bash
bun run db:push
```

### 4. Start Server
```bash
bun run dev
```

### 5. Access Application
Open http://localhost:3000 in your browser

### 6. Upload Test Documents
Navigate to test-docs/ folder and upload:
- `manufacturing_quality_report.pdf`
- `manufacturing_performance.docx`
- `project_data.xls`
- `strategic_plan.txt`

### 7. Run Test Queries
Try these example queries:
- "What is the overall production efficiency?"
- "What is the current First Pass Yield?"
- "What are the cost estimates per department?"
- "How much savings from defect rate reduction?"

---

## Troubleshooting

### Build Errors
```bash
# Clear cache and rebuild
rm -rf .next
bun install
bun run dev
```

### Database Issues
```bash
# Reset database
bun run db:reset

# Or manually
rm db/custom.db
bun run db:push
```

### API Key Issues
- Verify GROQ_API_KEY is correct
- Check API key has necessary permissions
- Ensure no extra spaces or quotes in .env file

### Port Already in Use
```bash
# Change port in .env
PORT=3001

# Or kill existing process
lsof -ti:3000 | xargs kill -9
```

---

## Support & Resources

### Documentation
- **QUICK_START.md** - 5-minute setup guide
- **DOCUMENTATION_INDEX.md** - Complete documentation index
- **RAG_SYSTEM_README.md** - Detailed system guide
- **RAG_ARCHITECTURE.md** - Architecture diagrams
- **COMPLETE_TEST_SUITE.md** - Test suite guide

### API Documentation
- Groq API: https://console.groq.com/docs
- OpenAI API: https://platform.openai.com/docs
- Next.js: https://nextjs.org/docs
- Prisma: https://www.prisma.io/docs

### External Resources
- Groq Console: https://console.groq.com
- OpenAI Dashboard: https://platform.openai.com
- shadcn/ui: https://ui.shadcn.com

---

## Cost Information

### Groq Free Tier
- **3,000+ queries/month** - FREE
- **Llama 3.1 70B model** - High quality
- **Fast inference** - Low latency

### OpenAI Embeddings
- **text-embedding-3-small**: ~$0.02 per 1M tokens
- **Typical monthly cost**: $0.05 - $0.50

### Total Monthly Cost
- **Free tier**: $0 - $0.50/month
- **Paid tier**: $20 - $50/month (if exceeding free limits)

See [COST_ANALYSIS.md](./COST_ANALYSIS.md) for detailed cost breakdown.

---

## License

Internal use only - Plant Intelligence Systems
AI-Powered Manufacturing & Quality Analytics Platform

---

## Version History

### v1.0.0 (Current Release)
- ✅ Complete RAG system implementation
- ✅ Multi-format document support
- ✅ Self-RAG quality grading
- ✅ Manufacturing analytics features
- ✅ Glassmorphic UI design
- ✅ Groq API integration
- ✅ Comprehensive test suite
- ✅ Complete documentation

---

## Next Steps

1. ✅ Download the system
2. ✅ Follow deployment guide
3. ✅ Configure API keys
4. ✅ Upload manufacturing documents
5. ✅ Run test queries
6. ✅ Integrate into workflow
7. ✅ Scale as needed

---

**Plant Intelligence Systems - Production Ready AI for Manufacturing**

For questions or support, refer to the comprehensive documentation included in this package.

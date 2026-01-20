# Plant Intelligence Systems - Quick Start Guide

**AI-Powered Manufacturing & Quality Analytics Platform**

---

## Prerequisites

- Node.js 18+ or Bun runtime
- Groq API key (already configured)
- OpenAI API key (optional, for embeddings)

## Setup (5 minutes)

### 1. Install Dependencies

```bash
bun install
```

### 2. Configure Environment

The `.env` file is already configured with:

```env
DATABASE_URL="file:./db/custom.db"
GROQ_API_KEY=your_groq_api_key_here
```

**Optional**: Add OpenAI API key for high-quality embeddings:

```env
OPENAI_API_KEY=your-openai-api-key
```

### 3. Setup Database

```bash
bun run db:push
```

### 4. Start Development Server

```bash
bun run dev
```

The application will be available at: `http://localhost:3000`

**Note**: The system uses Groq Llama 3.1 70B for fast, cost-effective LLM operations. See [GROQ_INTEGRATION.md](./GROQ_INTEGRATION.md) for details.

---

## Usage

### Upload Documents

1. Navigate to "Document Upload" tab
2. Drag & drop files or click "Browse Files"
3. Supported formats: PDF, DOC, DOCX, XLS, XLSX, CSV, TXT, JPG, PNG, GIF
4. Wait for "Completed" status

### Query Documents

1. Switch to "Analysis & Insights" tab
2. Enter your manufacturing question
3. Click "Analyze Documents"
4. Review results:
   - Executive Summary
   - Detailed Answer
   - Risk Indicators
   - Citations
   - Source Reasoning
   - Quality Metrics

### Interpret Results

- **Confidence Score**: Higher = more reliable (0-100%)
- **Risk Indicators**: Color-coded
  - 🟢 Green = Low risk
  - 🟡 Yellow = Medium risk
  - 🟠 Orange = High risk
  - 🔴 Red = Critical risk
- **Citations**: Click to see source content and relevance
- **Evaluation Metrics**: View quality scores in results

---

## Example Manufacturing Queries

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

### Strategic Planning

- "What are the key strategic priorities for manufacturing operations?"
- "What growth opportunities exist in current market conditions?"
- "What operational challenges need to be addressed?"

---

## API Usage

### Upload Documents

```bash
curl -X POST http://localhost:3000/api/rag/upload \
  -F "files=@manufacturing_quality_report.pdf" \
  -F "files=@project_data.xls" \
  -F "files=@financial_report.txt"
```

### Query Documents

```bash
curl -X POST http://localhost:3000/api/rag/query \
  -H "Content-Type: application/json" \
  -d '{"question": "What is the overall production efficiency?"}'
```

### Get Documents

```bash
curl http://localhost:3000/api/rag/upload
```

---

## Features at a Glance

| Feature | Status | Description |
|---------|--------|-------------|
| Multi-format Upload | ✅ | PDF, DOC, DOCX, XLS, XLSX, CSV, TXT, Images |
| Chunking Strategies | ✅ | Fixed, Recursive, Semantic |
| Vector Search | ✅ | OpenAI embeddings |
| Semantic Search | ✅ | Cosine similarity |
| Self-RAG Grading | ✅ | Quality assessment |
| Hallucination Detection | ✅ | Risk classification |
| Risk Indicators | ✅ | Automated extraction |
| Citations | ✅ | Source tracking with relevance |
| Explainability | ✅ | Step-by-step reasoning |
| Confidence Scoring | ✅ | Quality metrics |
| Manufacturing Analytics | ✅ | Production, Quality, Cost, Staffing |
| Modern UI | ✅ | Glassmorphic design, animations |

---

## Understanding Results

### Executive Summary

Quick overview (2-3 sentences) of the answer, highlighting key findings.

### Detailed Answer

Comprehensive response with complete information, data points, and analysis.

### Risk Indicators

```
Level: HIGH
Category: Production Risk
Description: Assembly line efficiency below target by 15%
Confidence: 85%
```

### Citations

```
[Source 1] Manufacturing Quality Report.pdf - 92% relevant
[Source 2] Project Performance Data.xlsx - 85% relevant
[Source 3] Strategic Plan.txt - 78% relevant
```

### Source Reasoning

```
1. Source 1 states assembly line efficiency is 72% vs target 85%
2. Source 2 confirms this trend across Q3 production data
3. Source 3 identifies specific bottlenecks in the assembly process
4. Based on these sources, risk is valid and requires immediate attention
```

### Quality Metrics

```
Retrieval Quality: 0.89
Response Relevance: 0.92
Faithfulness: 0.88
Overall Quality: 0.90
Hallucination Risk: LOW
```

---

## Quality Metrics

The system automatically evaluates:

- **Retrieval Quality** (0-1): How relevant is the retrieved context?
- **Response Relevance** (0-1): Does the answer address the question?
- **Faithfulness** (0-1): Is the answer grounded in the context?
- **Hallucination Risk**: low, medium, high, or critical

**Overall Quality**: Weighted combination of all metrics (higher is better).

---

## Best Practices

### For Better Results

1. ✅ Upload relevant manufacturing documents
2. ✅ Ask specific, well-formed questions
3. ✅ Review confidence scores
4. ✅ Verify critical information with sources
5. ✅ Use source reasoning to understand answers
6. ✅ Cross-reference multiple citations
7. ✅ Check risk indicators before making decisions

### Common Issues

❌ **Low confidence**: Upload more relevant documents or refine question
❌ **High hallucination risk**: Verify with human review
❌ **Missing citations**: Check document relevance
❌ **Poor retrieval**: Refine your question or add context

---

## Development

### Database Schema

```bash
# View schema
cat prisma/schema.prisma

# Reset database
bun run db:reset

# View database
sqlite3 db/custom.db
```

### View Work Log

```bash
cat worklog.md
```

### Architecture

- See `RAG_ARCHITECTURE.md` for system diagrams
- See `RAG_ENTERPRISE_FEATURES.md` for feature details
- See `RAG_SYSTEM_README.md` for complete documentation

### Check Dev Server

```bash
# View recent logs
tail -n 50 dev.log

# Monitor in real-time
tail -f dev.log
```

---

## Troubleshooting

### Documents Not Processing

- Check file format is supported
- Ensure file is not corrupted
- Check dev server logs: `tail -f dev.log`
- Verify API keys are configured

### Queries Returning No Results

- Ensure documents are fully processed
- Try rephrasing your question
- Upload more relevant documents
- Check if question relates to uploaded content

### High Hallucination Risk

- Verify answer against source documents
- Request human review
- Check if retrieved context is sufficient
- Upload additional relevant documents

### Low Confidence Scores

- Upload additional relevant documents
- Improve question specificity
- Check document quality and completeness
- Verify document processing completed

### UI Issues

- Clear browser cache
- Check browser console for errors
- Restart dev server
- Verify dependencies are installed

---

## Test Suite

### Running Tests

```bash
# Navigate to test documentation
cd test-docs

# View test scenarios
cat TEST_EXECUTION_GUIDE.md

# Use test files
# All test files are located in /test-docs/ directory
```

### Test Files Available

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

See [COMPLETE_TEST_SUITE.md](./COMPLETE_TEST_SUITE.md) for comprehensive test documentation.

---

## Support

For detailed documentation:

- `RAG_SYSTEM_README.md` - Complete system guide
- `RAG_ARCHITECTURE.md` - Architecture overview
- `RAG_ENTERPRISE_FEATURES.md` - Enterprise features
- `GROQ_INTEGRATION.md` - Groq API setup
- `COMPLETE_TEST_SUITE.md` - Test suite guide
- `worklog.md` - Implementation details

---

## Cost & Performance

### Groq Free Tier

- **3,000+ queries/month** at no cost
- **Fast inference**: Llama 3.1 70B
- **High quality**: State-of-the-art reasoning

### Minimal Costs

- **OpenAI Embeddings**: ~$0.02 per 1M tokens
- **Monthly estimate**: $0.05 - $0.50 for moderate usage
- **Scale to paid**: Upgrade only when needed

### Performance

- **Query Speed**: 2-5 seconds typical
- **Document Processing**: 1-3 seconds per file
- **Accuracy**: 85-95% confidence on well-formed queries

---

## Next Steps

1. ✅ Upload your manufacturing documents
2. ✅ Try example queries from the list above
3. ✅ Review results and quality metrics
4. ✅ Explore citations and source reasoning
5. ✅ Run test suite for validation
6. ✅ Adjust queries based on results
7. ✅ Integrate into your workflow

---

## UI Design Highlights

### Visual Features

- **Soft Color Palette**: Calming emerald, blue, amber, slate
- **Glassmorphic Design**: Backdrop blur, subtle shadows
- **Factory Iconography**: Production, quality, analytics icons
- **Smooth Animations**: Framer Motion transitions

### User Experience

- **Progress Indicators**: Visual feedback during processing
- **Status Badges**: Clear document and query status
- **Risk Visualization**: Color-coded risk indicators
- **Confidence Gauges**: Visual confidence scoring
- **Responsive Layout**: Works on all devices

---

**Built with Next.js 16, TypeScript, Prisma, Groq, OpenAI, and shadcn/ui**

**Plant Intelligence Systems - AI-Powered Manufacturing & Quality Analytics**

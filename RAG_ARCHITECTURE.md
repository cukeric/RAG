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
│             ▼              │   │  │ Retrieval Quality     │  │
│  ┌─────────────────────┐   │   │  │ - Relevance Score     │  │
│  │  Embedding Service  │   │   │  │ - Is Relevant?        │  │
│  │  OpenAI embeddings  │   │   │  └────────────────────────┘  │
│  │  text-embedding-3   │   │   │  ┌────────────────────────┐  │
│  └──────────┬──────────┘   │   │  │ Response Quality      │  │
└─────────────┼───────────────┘   │  │ - Relevance           │  │
             │                    │  │ - Faithfulness        │  │
             ▼                    │  │ - Hallucination Risk  │  │
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
│                   EXTERNAL AI SERVICES                        │
│  ┌─────────────────┐         ┌─────────────────┐              │
│  │  OpenAI GPT-4o  │         │  OpenAI Embed.  │              │
│  │  - Text Gen     │         │  text-embedding-3│              │
│  │  - Grading      │         │  -small         │              │
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
4. GPT-4o generates answer with context
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

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
│  ┌─────────────────────┐   │   │  │ Retrieval Quality     │  │
│  │  Embedding Service  │   │   │  │ - Relevance Score     │  │
│  │  Xenova (Local)     │   │   │  │ - Is Relevant?        │  │
│  │  all-MiniLM-L6-v2   │   │   │  └────────────────────────┘  │
│  └──────────┬──────────┘   │   │  ┌────────────────────────┐  │
└─────────────┼───────────────┘   │  │ Response Quality      │  │
             │                    │  │ - Relevance           │  │
             ▼                    │  │ - Faithfulness        │  │
┌────────────────────────────────┐ │  │ - Hallucination Risk  │  │
│        VECTOR STORAGE          │ └─────────────────────────┘  │
│  (SQLite + JSON embeddings)    │ └──────────┬───────────────────┘
│  ┌─────────────────────────┐   │            │
│  │ Document Table          │   │            ▼
│  │ - metadata              │   │  ┌──────────────────────────────┐
│  │ - status                │   │  │  Structured Output Gen       │
│  ├─────────────────────────┤   │  │  - Executive Summary         │
│  │ Chunk Table             │   │  │  - Detailed Answer           │
│  │ - content               │   │  │  - Risk Indicators          │
│  │ - embedding (JSON)      │   │  │  - Confidence Score          │
│  │ - metadata              │   │  │  - Source Reasoning         │
│  ├─────────────────────────┤   │  └──────────┬───────────────────┘
│  │ Query Table             │   │             │
│  │ - question, answer      │   │             ▼
│  │ - risk indicators       │   │  ┌──────────────────────────────┐
│  │ - confidence score      │   │  │  Database Storage           │
│  ├─────────────────────────┤   │  │  - Query records            │
│  │ Citation Table          │   │  │  - RAG grades               │
│  │ - relevance scores      │   │  │  - Citations                │
│  ├─────────────────────────┤   │  │  - Audit trail              │
│  │ RagGrade Table          │   │  └──────────────────────────────┘
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

# Groq API Integration

## Overview

The RAG Decision Support System uses **Groq API** for all high-performance LLM-based operations. Combined with local `@xenova/transformers`, this architecture provides extremely fast inference with zero operating costs for embeddings.

---

## Configuration

### API Key

The Groq API key is configured in the `.env` file:

```env
GROQ_API_KEY=your_groq_api_key_here
```

### Model Used

**Llama 3.3 70B** (`llama-3.3-70b-versatile`)

This model provides:

- ✅ **Sate-of-the-art reasoning** (GPT-4 class)
- ✅ **Extremely high speed** (Powered by Groq LPUs)
- ✅ **Structured Output** for analytical grading
- ✅ **Large Context** handling for document RAG

---

## What Uses Groq API

All AI reasoning and quality assessment operations are powered by Groq:

### 1. Self-RAG Grading

- Retrieval quality assessment (Is the context relevant?)
- Response relevance (Does the answer address the question?)
- Faithfulness scoring (Is the answer grounded in documents?)
- Hallucination risk detection (Identifying unsupported claims)

### 2. AI-Powered Analytics

- Executive summaries of manufacturing data
- Detailed answers with multi-layered reasoning
- Risk indicator extraction from technical logs
- Confidence scoring for decision support

---

## Embeddings Architecture

The system is designed to be **Privacy-First** and **Cost-Zero** by default.

### Default: Local Xenova Embeddings

- **Model**: `all-MiniLM-L6-v2`
- **Execution**: Runs locally on your CPU/GPU
- **Cost**: **$0.00**
- **Privacy**: No document data is sent to external APIs for indexing.

### Optional: OpenAI Embeddings

If you prefer OpenAI's cloud-based embeddings, you can add your key:

```env
OPENAI_API_KEY=your-openai-api-key
```

The system will prioritize OpenAI if the key is present, otherwise defaulting to local Xenova.

---

## Implementation Details

### Model Identification

In `/src/lib/self-rag-grader.ts`, the system initializes the Groq provider:

```typescript
import { createGroq } from '@ai-sdk/groq';

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
});

// Using Llama 3.3 70B
const model = groq('llama-3.3-70b-versatile');
```

---

## Performance Comparison

| Metric | Previous (OpenAI/Cloud) | Current (Groq LPU) |
|--------|-------------------------|--------------------|
| **Latency** | 2.0s - 5.0s | **0.5s - 1.5s** |
| **Throughput** | High | **Ultra-High** |
| **Cost** | Paid API | **Free Tier Available** |
| **Embeddings** | Cloud API ($) | **Local Execution ($0)** |

---

## Summary

By integrating **Groq's Llama 3.3 70B** for intelligence and **Xenova** for local embeddings, the RAG Decision Support System delivers:

1. ⚡ **Sub-second AI reasoning**.
2. 💰 **Zero operating costs** for standard use.
3. 🔒 **Enhanced data privacy**.
4. 🛡️ **Self-correcting RAG pipeline** via automated grading.

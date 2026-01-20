# RAG Decision Support System - Quick Start Guide

**AI-Powered Manufacturing & Quality Analytics Platform**

---

## 🚀 Get Started in 5 Minutes

This guide will walk you through setting up the **RAG Decision Support System** on a new machine.

### 📋 Prerequisites

Before you begin, ensure you have the following installed:

1. **Bun Runtime** (Recommended): [Install Bun](https://bun.sh/)
    - *Alternatively, you can use Node.js 18+ and npm.*
2. **Git**: To clone the repository (if applicable).
3. **API Key**: A **Groq API Key** (Get it for free at [console.groq.com](https://console.groq.com/)).

---

### 🛠️ Step-by-Step Installation

#### 1. Prepare the Project

If you downloaded the code as a ZIP, extract it. If you are using Git:

```bash
git clone git@github.com:cukeric/RAG.git
cd RAG
```

#### 2. Install Dependencies

The system relies on high-performance libraries for document parsing (PDF, Excel, Word) and local intelligence (Xenova).

```bash
bun install
```

*(If using npm: `npm install`)*

#### 3. Configure Environment Variables

You must provide your Groq API key for the "brains" of the system to work.

1. Copy the example environment file:

    ```bash
    cp .env.example .env
    ```

2. Open `.env` and add your key:

    ```env
    DATABASE_URL="file:./db/custom.db"
    GROQ_API_KEY=your_groq_api_key_here
    ```

    - *Note: No OpenAI key is required for default operation.*

#### 4. Initialize the Database

This system uses a local SQLite database. You don't need to install a database server.

```bash
bun run db:push
```

#### 5. Launch the Platform

Start the development server:

```bash
bun run dev
```

#### 6. Access the UI

Open your browser and go to:
**[http://localhost:3000](http://localhost:3000)**

---

## 🧪 First Steps & Testing

### 1. Upload Test Documents

1. Navigate to the **"Document Upload"** tab.
2. Go to the `test-docs/` folder in this project.
3. Upload `manufacturing_quality_report.pdf` or `project_data.xls`.
4. Wait for the status to turn **"Completed"**.

### 2. Run your first Query

1. Switch to the **"Analysis & Insights"** tab.
2. Ask: *"What is the overall production efficiency?"*
3. Observe the real-time AI analysis with executive summaries, risks, and citations.

---

## 📁 Key Directories

- `src/app/api/rag/`: Core RAG and Upload endpoints.
- `src/lib/`: Document processing, chunking, and AI grading logic.
- `test-docs/`: Sample files to test your setup immediately.
- `db/`: Location of your local database (`custom.db`).

---

## ❓ Troubleshooting

- **Module Not Found**: Ensure you ran `bun install`.
- **API Errors**: Double-check your `GROQ_API_KEY` in the `.env` file.
- **Database Errors**: Re-run `bun run db:push` to ensure the schema is synced.
- **Next.js Errors**: Try clearing the cache with `rm -rf .next` and restarting.

---

**Built for Speed and Privacy.**
*Enterprise AI for Modern Manufacturing.*

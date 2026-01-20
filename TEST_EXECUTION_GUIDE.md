# Quick Test Execution Guide

## Test Files Ready! ✅

All 5 test files have been created in `/home/z/my-project/test-docs/`:

📁 **financial_report.txt** (1.8K)
   - Q3 2024 financial performance
   - Revenue, costs, profitability
   - Risk factors and opportunities

📁 **project_status.csv** (1.2K)
   - 10 projects with status
   - Budgets, timelines, managers
   - Risk levels and completion %

📁 **employee_handbook.txt** (3.8K)
   - Company policies and procedures
   - Code of conduct, remote work
   - Leave policy, benefits, security

📁 **strategic_plan.txt** (2.4K)
   - 2024-2027 strategic roadmap
   - 4 strategic pillars
   - Implementation timeline

📁 **risk_assessment.txt** (2.8K)
   - Q3 2024 risk assessment
   - Operational, financial, regulatory risks
   - Critical priorities and mitigation

---

## Step-by-Step Test Walkthrough

### Step 1: Upload All Files (2 minutes)

1. **Open System**
   - Navigate to: http://localhost:3000
   - You should see the RAG Decision Support System interface

2. **Upload Documents**
   - Click "Document Upload" tab
   - Drag all 5 files from `/home/z/my-project/test-docs/`
   - Drop them in the upload zone
   - Or click "Browse Files" and select all 5

3. **Verify Upload**
   - Wait for all files to show "Completed" status
   - Should take 5-15 seconds
   - All 5 should be green with checkmarks

**Expected Result:**
```
✅ Uploaded Files (5)
  - financial_report.txt [Completed]
  - project_status.csv [Completed]
  - employee_handbook.txt [Completed]
  - strategic_plan.txt [Completed]
  - risk_assessment.txt [Completed]
```

---

### Step 2: Test Financial Queries (5 minutes)

Go to "Query & Analysis" tab and test these:

**Query 1: Revenue Analysis**
```
What is the revenue growth trend for Q3 2024 and what are the main drivers?
```

**What to Check:**
- [ ] Response mentions $45.2M revenue
- [ ] Response mentions 15% YoY growth
- [ ] Lists drivers: Product (+12%), Service (+22%), Licensing (+18%)
- [ ] Confidence score > 0.85
- [ ] Citations link to financial_report.txt
- [ ] Executive summary is 2-3 sentences

**Expected Answer:**
```
Summary: Company XYZ achieved strong Q3 2024 performance with $45.2M revenue,
representing 15% year-over-year growth driven by increases across all segments.

Answer: Revenue reached $45.2M in Q3 2024, up 15% from the same period
last year. The growth was driven by product sales at $32.5M (+12%), service
revenue at $8.7M (+22%), and licensing revenue at $4.0M (+18%).
Operating margins improved from 22% to 25% through efficiency initiatives.
```

---

**Query 2: Risk Assessment**
```
What are the key risk factors identified in the financial report?
```

**What to Check:**
- [ ] Identifies all 5 risks
- [ ] Risk indicators show appropriate levels
- [ ] Mentions customer concentration, supply chain, market volatility, regulatory, competition
- [ ] Citations link to financial_report.txt
- [ ] Risk indicators are categorized properly

**Expected Risks:**
- Customer concentration (Top 3 = 40% revenue)
- Supply chain dependency (Single supplier for 65%)
- Market volatility (Currency fluctuations)
- Regulatory compliance (Data privacy in Q4)
- Competitive pressure (15% lower pricing)

---

### Step 3: Test Project Queries (5 minutes)

**Query 1: Project Status**
```
Which projects are delayed and over budget?
```

**What to Check:**
- [ ] Identifies P-003 and P-008 as delayed
- [ ] Identifies P-001, P-003, P-008 as over budget
- [ ] Provides specific amounts (+$20K, +$30K, +$30K)
- [ ] Citations link to project_status.csv
- [ ] Confidence score > 0.90 (exact data)

**Expected Answer:**
```
Summary: Two projects (P-003 and P-008) are experiencing delays, while three projects
(P-001, P-003, P-008) are over budget with total overage of $80,000.

Answer: P-003 (Data Migration) and P-008 (Database Upgrade) are delayed.
Budget overruns: P-001 Website Redesign ($120K vs $100K, +$20K), P-003 Data Migration
($150K vs $120K, +$30K), and P-008 Database Upgrade ($180K vs $150K, +$30K).
Total budget overage is $80,000.
```

---

**Query 2: Resource Analysis**
```
What are the team size requirements and how do they correlate with project priority?
```

**What to Check:**
- [ ] Lists team sizes for projects
- [ ] Shows correlation (Critical = larger teams)
- [ ] Citations link to project_status.csv
- [ ] Source reasoning explains the correlation

---

### Step 4: Test Policy Queries (5 minutes)

**Query 1: Remote Work Policy**
```
What are the requirements for remote work and what happens with non-compliance?
```

**What to Check:**
- [ ] Lists eligibility criteria (6+ months, remote-capable role, manager approval)
- [ ] Mentions core hours (10am-3pm)
- [ ] Mentions VPN requirement
- [ ] Explains non-compliance (revocation of privileges)
- [ ] Confidence score > 0.9

**Expected Answer:**
```
Summary: Remote work is available for eligible employees with 6+ months tenure who have
manager approval, requiring core hours availability and VPN usage.

Answer: Remote work is permitted for employees in remote-capable roles with 6+ months
tenure and manager approval. Requirements include maintaining regular communication,
core hours availability (10am-3pm), and using VPN for company access only.
Non-compliance may result in revocation of remote work privileges.
```

---

### Step 5: Test Strategic Queries (5 minutes)

**Query 1: Strategic Pillars**
```
What are the four strategic pillars and their main goals?
```

**What to Check:**
- [ ] Identifies all 4 pillars
- [ ] Lists goal for each pillar
- [ ] Citations link to strategic_plan.txt
- [ ] Source reasoning is step-by-step

**Expected Pillars:**
1. Market Expansion (15% → 25% market share by 2027)
2. Product Innovation (3 new product lines by 2027)
3. Operational Excellence (30% cost reduction)
4. Talent Development (Top employer by 2027)

---

**Query 2: Implementation Timeline**
```
What is the implementation timeline from Q4 2024 to 2027?
```

**What to Check:**
- [ ] Covers Q4 2024, 2025, 2026, 2027
- [ ] Lists key milestones each year
- [ ] Citations link to strategic_plan.txt
- [ ] Comprehensive coverage

---

### Step 6: Test Risk Queries (5 minutes)

**Query 1: Critical Risks**
```
What are the CRITICAL and HIGH severity risks requiring immediate attention?
```

**What to Check:**
- [ ] Identifies 2 CRITICAL risks (Cybersecurity, Technology Disruption)
- [ ] Identifies 4+ HIGH risks
- [ ] Risk indicators show CRITICAL level for cybersecurity
- [ ] Citations link to risk_assessment.txt
- [ ] Source reasoning prioritizes by severity

**Expected Critical Risks:**
- Cybersecurity Threat (CRITICAL) - 3 intrusions, 12 security gaps
- Technology Disruption (CRITICAL) - AI disruption, aging stack

**Expected High Risks:**
- Supply Chain Disruption (HIGH) - 65% single supplier dependency
- Customer Concentration (HIGH) - 40% revenue from top 3
- Market Competition (HIGH) - New entrant, lower pricing
- Data Privacy Compliance (HIGH) - New regulations, 72% compliance

---

### Step 7: Test Cross-Document Queries (5 minutes)

**Query: Comprehensive Risk Overview**
```
What are the key risks mentioned across all uploaded documents?
```

**What to Check:**
- [ ] Finds risks in financial_report (customer concentration, supply chain, etc.)
- [ ] Finds risks in project_status (delayed projects)
- [ ] Finds risks in employee_handbook (non-compliance)
- [ ] Finds risks in strategic_plan (market saturation, technology disruption)
- [ ] Finds risks in risk_assessment (cybersecurity, supply chain, etc.)
- [ ] Synthesizes risks from multiple documents
- [ ] Citations from multiple files

---

### Step 8: Test Hallucination Detection (3 minutes)

**Query: Information Not in Documents**
```
What is the company's carbon footprint and sustainability certification?
```

**What to Check:**
- [ ] Response acknowledges limited information
- [ ] Mentions carbon footprint only briefly (25% reduction target from strategic plan)
- [ ] States certification is not mentioned
- [ ] Confidence score is low (reflecting limited info)
- [ ] Hallucination risk is HIGH or CRITICAL
- [ ] Explanation of why information is limited

**Expected Answer Behavior:**
The system should:
- Acknowledge limited information
- Only mention what exists (25% carbon reduction goal)
- Not invent certifications or specific metrics
- Show low confidence score
- Flag high hallucination risk

---

### Step 9: Test Complex Multi-Part Queries (5 minutes)

**Query: Comprehensive Company Analysis**
```
Provide a comprehensive analysis including:
1. Financial performance in Q3 2024
2. Strategic direction and pillars
3. Key risks and their severity
4. Critical priorities
```

**What to Check:**
- [ ] Financial section with $45.2M revenue, 25% margin
- [ ] Strategic section with 4 pillars and timelines
- [ ] Risk section with severity levels
- [ ] Critical priorities list
- [ ] Citations from multiple documents
- [ ] Risk indicators with appropriate levels
- [ ] High confidence score (>0.8)
- [ ] Source reasoning is comprehensive

---

### Step 10: Test Edge Cases (3 minutes)

**Query 1: Very Specific Data**
```
What is the exact budget and variance for project P-003?
```

**What to Check:**
- [ ] Exact budget: $150,000
- [ ] Exact variance: +$30,000
- [ ] Percent variance: 25%
- [ ] Confidence > 0.95

**Query 2: Vague Request**
```
Tell me about the company's future
```

**What to Check:**
- [ ] Synthesizes from strategic plan (2024-2027)
- [ ] References timelines and goals
- [ ] Mentions uncertainty/ambiguity
- [ ] Confidence reflects ambiguity (0.7-0.8)

---

## Performance Testing

### Response Time Test
```
Upload files → Run 10 queries → Record times

Expected:
- Upload: 5-15 seconds
- Query: 0.5-2 seconds each
- Total: <30 seconds for all queries
```

### Concurrent Query Test
```
Open 3 browser tabs → Submit different queries simultaneously

Expected:
- All 3 complete successfully
- No rate limiting errors
- Similar response times
```

---

## Quality Verification Checklist

For Each Query, Verify:

✅ **Accuracy**
   - Information matches source documents
   - Numbers are correct
   - No contradictions with sources

✅ **Completeness**
   - Addresses the question fully
   - Covers relevant aspects
   - Synthesizes from multiple sources when appropriate

✅ **Citations**
   - Present when information exists
   - Link to correct documents
   - Reference relevant sections

✅ **Confidence Score**
   - >0.9 for data-exact questions
   - >0.8 for analysis questions
   - Appropriate level for available information

✅ **Risk Indicators**
   - Present when risks are identified
   - Appropriate level (low/medium/high/critical)
   - Properly categorized

✅ **Source Reasoning**
   - Step-by-step logic
   - References sources
   - Explains conclusion derivation

---

## Test Scorecard

| Test Category | Queries | Pass/Fail | Notes |
|--------------|---------|------------|-------|
| Document Upload | 1 (all 5 files) | [ ] |
| Financial Queries | 2 | [ ] |
| Project Queries | 2 | [ ] |
| Policy Queries | 2 | [ ] |
| Strategic Queries | 2 | [ ] |
| Risk Queries | 2 | [ ] |
| Cross-Document Queries | 2 | [ ] |
| Hallucination Test | 1 | [ ] |
| Complex Multi-Part | 1 | [ ] |
| Edge Cases | 2 | [ ] |
| **TOTAL** | **17** | |

**Overall Result:** ___/17 tests passed

---

## Troubleshooting

### Upload Fails
**Check:**
- File format is supported (TXT, CSV)
- File is not empty
- System is running (http://localhost:3000)

**Solution:**
- Refresh page and retry
- Check dev server logs: `tail -f /home/z/my-project/dev.log`

### Queries Return No Results
**Check:**
- Documents are fully processed (green checkmarks)
- Question is specific enough
- Documents contain relevant information

**Solution:**
- Wait for processing to complete
- Rephrase question
- Upload more relevant documents

### Low Confidence Scores
**Check:**
- Question is clear and specific
- Documents contain good information
- Multiple relevant documents uploaded

**Solution:**
- Be more specific in questions
- Upload additional documents
- Check document quality

### High Hallucination Risk
**Check:**
- Is question answerable from documents?
- Are you asking about information that exists?
- Is the question too vague?

**Solution:**
- Verify answer against source documents
- Be more specific
- Ask about information that exists

---

## Next Steps After Testing

1. **Document Results**
   - Record pass/fail for each test
   - Note any issues or unexpected behavior
   - Capture response times

2. **Analyze Performance**
   - Which query types work best?
   - Any consistent issues?
   - Areas for improvement?

3. **Explore Further**
   - Test with your real documents
   - Try different question types
   - Evaluate risk indicators accuracy
   - Test with larger document sets

---

## Quick Reference

**System URL:** http://localhost:3000
**Test Files:** /home/z/my-project/test-docs/
**Documentation:** /home/z/my-project/COMPLETE_TEST_SUITE.md

**API Key:** Groq Free Tier (Already configured)

**Total Estimated Test Time:** 30-40 minutes
**Expected Success Rate:** 90%+ of tests

---

## Ready to Test! 🚀

1. Open http://localhost:3000
2. Upload all 5 test files
3. Work through the 17 test queries
4. Document results in scorecard
5. Evaluate system performance

**Happy Testing! 🎯**

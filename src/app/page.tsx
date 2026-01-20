'use client'

import { useState, useEffect } from 'react'
import { Upload, FileText, Search, AlertTriangle, CheckCircle, BookOpen, ChevronRight, FileIcon, X, Factory, BarChart3, PieChart, Users, Settings, TrendingUp, Download, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { motion, AnimatePresence } from 'framer-motion'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

interface UploadedFile {
  id: string
  name: string
  size: number
  type: string
  status: 'uploading' | 'processing' | 'completed' | 'error'
  progress?: number
  fileTypeIcon: string
}

interface Citation {
  chunkId: string
  content: string
  documentName: string
  relevance: number
  page?: number
}

interface RiskIndicator {
  level: 'low' | 'medium' | 'high' | 'critical'
  category: string
  description: string
  confidence: number
}

interface QueryResult {
  id: string
  question: string
  answer: string
  summary: string
  confidenceScore: number
  riskIndicators: RiskIndicator[]
  citations: Citation[]
  sourceReasoning: string[]
  evaluation?: {
    retrieval_quality: number
    response_relevance: number
    faithfulness: number
    hallucination_risk: 'low' | 'medium' | 'high' | 'critical'
    overall_quality: number
  }
}

export default function PlantIntelligenceSystem() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [query, setQuery] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [results, setResults] = useState<QueryResult | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const [processingStage, setProcessingStage] = useState<string>('')
  const [activeTab, setActiveTab] = useState('upload')
  const [progress, setProgress] = useState(0)

  // Fetch initial data
  useEffect(() => {
    fetchDocuments()
  }, [])

  const fetchDocuments = async () => {
    try {
      const response = await fetch('/api/rag/upload')
      if (response.ok) {
        const data = await response.json()
        const mappedFiles: UploadedFile[] = data.documents.map((doc: any) => ({
          id: doc.id,
          name: doc.fileName,
          size: doc.fileSize,
          type: doc.fileType,
          status: doc.status === 'completed' ? 'completed' : 'error',
          progress: 100,
          fileTypeIcon: getFileTypeIcon(doc.fileType)
        }))
        setUploadedFiles(mappedFiles)
      }
    } catch (error) {
      console.error('Failed to fetch documents:', error)
    }
  }

  const getFileTypeIcon = (type: string): string => {
    if (type.includes('pdf')) return 'PDF'
    if (type.includes('doc') || type.includes('docx')) return 'DOC'
    if (type.includes('xls') || type.includes('xlsx')) return 'XLS'
    if (type.includes('csv')) return 'CSV'
    if (type.includes('txt')) return 'TXT'
    if (type.includes('jpg') || type.includes('jpeg') || type.includes('png')) return 'IMG'
    if (type.includes('gif')) return 'IMG'
    return 'FILE'
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    const files = Array.from(e.dataTransfer.files)
    handleFileUpload(files)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    handleFileUpload(files)
  }

  const handleFileUpload = async (files: File[]) => {
    setProcessingStage('Extracting & Processing Documents...')

    // Optimistic UI update
    const newFiles: UploadedFile[] = files.map(file => ({
      id: Math.random().toString(36).substr(2, 9), // Temp ID
      name: file.name,
      size: file.size,
      type: file.type,
      status: 'uploading',
      progress: 0,
      fileTypeIcon: getFileTypeIcon(file.type)
    }))

    setUploadedFiles(prev => [...prev, ...newFiles])

    // Upload files to API
    const formData = new FormData()
    files.forEach(file => formData.append('files', file))

    try {
      const response = await fetch('/api/rag/upload', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const result = await response.json()

        // Refresh full list from DB to get real IDs and statuses
        await fetchDocuments()
        setProcessingStage('')
      } else {
        throw new Error('Upload failed')
      }
    } catch (error) {
      console.error('Upload error:', error)
      setUploadedFiles(prev =>
        prev.map(f =>
          newFiles.find(nf => nf.name === f.name)
            ? { ...f, status: 'error' }
            : f
        )
      )
      setProcessingStage('Upload failed. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleQuery = async () => {
    if (!query.trim()) return

    setActiveTab('query')
    setIsProcessing(true)
    setProcessingStage('Analyzing Documents & Generating Insights...')
    setProgress(0)
    setResults(null)

    try {
      setProgress(30)
      const response = await fetch('/api/rag/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: query })
      })

      if (response.ok) {
        setProgress(80)
        const data = await response.json()
        setResults(data)
        setProgress(100)
        setProcessingStage('Analysis Complete')
      }
    } catch (error) {
      console.error('Query failed:', error)
      setProcessingStage('Analysis failed. Please try again.')
      setProgress(0)
    } finally {
      setIsProcessing(false)
    }
  }

  const removeFile = async (fileId: string) => {
    // Optimistic update
    const fileToRemove = uploadedFiles.find(f => f.id === fileId)
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId))

    try {
      const response = await fetch(`/api/rag/upload?id=${fileId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Delete failed')
      }
    } catch (error) {
      console.error('Failed to delete file:', error)
      // Revert if failed
      if (fileToRemove) {
        setUploadedFiles(prev => [...prev, fileToRemove])
      }
    }
  }

  const generatePDF = () => {
    if (!results) return

    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.width
    const margin = 20

    // Header
    doc.setFillColor(16, 185, 129) // Emerald 500
    doc.rect(0, 0, pageWidth, 40, 'F')

    doc.setTextColor(255, 255, 255)
    doc.setFontSize(24)
    doc.text('Plant Intelligence Systems', margin, 20)

    doc.setFontSize(12)
    doc.text('Manufacturing & Quality Analytics Report', margin, 32)

    let yPos = 50

    // Executive Summary
    doc.setTextColor(0, 0, 0)
    doc.setFontSize(16)
    doc.text('Executive Summary', margin, yPos)
    yPos += 10

    doc.setFontSize(11)
    doc.setTextColor(60, 60, 60)
    const summaryLines = doc.splitTextToSize(results.summary, pageWidth - (margin * 2))
    doc.text(summaryLines, margin, yPos)
    yPos += (summaryLines.length * 7) + 10

    // Key Analysis
    doc.setFontSize(16)
    doc.setTextColor(0, 0, 0)
    doc.text('Detailed Analysis', margin, yPos)
    yPos += 10

    doc.setFontSize(11)
    doc.setTextColor(60, 60, 60)
    const answerLines = doc.splitTextToSize(results.answer, pageWidth - (margin * 2))
    doc.text(answerLines, margin, yPos)
    yPos += (answerLines.length * 7) + 10

    // Risk Indicators Table
    if (results.riskIndicators.length > 0) {
      // Check if we need a new page
      if (yPos > 250) {
        doc.addPage()
        yPos = 30
      }

      doc.setFontSize(16)
      doc.setTextColor(0, 0, 0)
      doc.text('Risk Indicators', margin, yPos)
      yPos += 5

      autoTable(doc, {
        startY: yPos,
        head: [['Level', 'Category', 'Description', 'Confidence']],
        body: results.riskIndicators.map(risk => [
          risk.level.toUpperCase(),
          risk.category,
          risk.description,
          `${(risk.confidence * 100).toFixed(0)}%`
        ]),
        headStyles: { fillColor: [16, 185, 129] },
        key: 'risk-table'
      })

      // Update yPos after table
      const finalY = (doc as any).lastAutoTable.finalY
      yPos = finalY + 15
    }

    // Footer with Metadata
    const pageCount = (doc as any).internal.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      doc.setFontSize(10)
      doc.setTextColor(150, 150, 150)
      doc.text(`Generated on ${new Date().toLocaleDateString()}`, margin, doc.internal.pageSize.height - 10)
      doc.text(`Page ${i} of ${pageCount}`, pageWidth - margin - 20, doc.internal.pageSize.height - 10)
    }

    doc.save('manufacturing-analysis-report.pdf')
  }

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low':
        return 'bg-emerald-500 text-emerald-50 border-emerald-200'
      case 'medium':
        return 'bg-amber-500 text-amber-700 border-amber-300'
      case 'high':
        return 'bg-orange-500 text-orange-700 border-orange-300'
      case 'critical':
        return 'bg-red-500 text-red-700 border-red-200'
      default:
        return 'bg-slate-500 text-slate-700 border-slate-200'
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Header */}
      <header className="border-b bg-white/90 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
                <Factory className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Plant Intelligence Systems</h1>
                <p className="text-sm text-slate-500">
                  AI-Powered Manufacturing & Quality Analytics
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                System Ready
              </Badge>
              <Button variant="ghost" size="icon">
                <Settings className="w-5 h-5 text-slate-500" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 max-w-lg">
            <TabsTrigger value="upload">Document Upload</TabsTrigger>
            <TabsTrigger value="query">Analysis & Insights</TabsTrigger>
          </TabsList>

          {/* Upload Tab */}
          <TabsContent value="upload" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0, transition: { duration: 0.5 } }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="w-5 h-5 text-emerald-600" />
                    Upload Manufacturing Documents
                  </CardTitle>
                  <CardDescription>
                    Upload PDF, DOCX, XLS, CSV, TXT, or Image files for production, quality, and productivity analysis
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Drop Zone */}
                  <div
                    className={`border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300 ease-in-out ${dragActive
                        ? 'border-emerald-500 bg-emerald-50/5'
                        : 'border-slate-300 hover:border-emerald-500/50'
                      }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    <Upload className="w-16 h-16 mx-auto mb-4 text-slate-400" />
                    <div className="space-y-4">
                      <h3 className="text-xl font-semibold text-slate-900">
                        Drag & Drop Manufacturing Documents
                      </h3>
                      <p className="text-sm text-slate-500">
                        or click to browse
                      </p>
                      <input
                        type="file"
                        id="file-upload"
                        multiple
                        accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,.png,.jpg,.jpeg,.gif"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                      <label htmlFor="file-upload">
                        <Button variant="outline" asChild className="gap-2 cursor-pointer">
                          <span>Browse Files</span>
                        </Button>
                      </label>
                      <p className="text-xs text-slate-400 mt-4">
                        Supported formats: PDF, DOC, DOCX, XLS, XLSX, CSV, TXT, PNG, JPG, JPEG, GIF
                      </p>
                    </div>
                  </div>

                  {/* Processing Stage */}
                  {processingStage && (
                    <Alert>
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                      <AlertDescription>{processingStage}</AlertDescription>
                    </Alert>
                  )}

                  {/* File List */}
                  {uploadedFiles.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-semibold flex items-center gap-2">
                          <FileText className="w-5 h-5 text-slate-600" />
                          Uploaded Documents ({uploadedFiles.length})
                        </h4>
                      </div>

                      <ScrollArea className="max-h-[500px]">
                        <div className="space-y-3">
                          {uploadedFiles.map((file) => (
                            <Card key={file.id}>
                              <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <FileIcon className={`w-8 h-8 ${file.status === 'completed'
                                        ? 'text-emerald-600'
                                        : file.status === 'processing'
                                          ? 'text-amber-600'
                                          : file.status === 'error'
                                            ? 'text-red-600'
                                            : 'text-slate-400'
                                      }`} />
                                    <div className="min-w-0">
                                      <p className="font-medium truncate">{file.name}</p>
                                      <p className="text-xs text-slate-500">{formatFileSize(file.size)}</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <Badge variant="outline" className="gap-2">
                                      {file.status === 'uploading' && (
                                        <>
                                          <span>{file.progress || 0}%</span>
                                        </>
                                      )}
                                      {file.status === 'processing' && (
                                        <Badge variant="secondary">Processing</Badge>
                                      )}
                                      {file.status === 'completed' && (
                                        <>
                                          <CheckCircle className="w-3 h-3 text-emerald-500" />
                                          Completed
                                        </>
                                      )}
                                      {file.status === 'error' && (
                                        <Badge variant="destructive">Error</Badge>
                                      )}
                                    </Badge>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => removeFile(file.id)}
                                      className="text-slate-400 hover:text-red-500 hover:bg-red-50"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Query Tab */}
          <TabsContent value="query" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0, transition: { duration: 0.5 } }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Manufacturing Analysis</CardTitle>
                  <CardDescription>
                    Ask questions about production, quality, costs, staffing, and get comprehensive AI-powered insights with risk assessment
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  <Textarea
                    placeholder="Enter your question... (e.g., 'What is the overall production efficiency and which department needs improvement?')"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    rows={4}
                    className="resize-none"
                    disabled={isProcessing}
                  />

                  <Button
                    onClick={handleQuery}
                    disabled={!query.trim() || isProcessing}
                    className="w-full"
                    size="lg"
                  >
                    <Search className="w-5 h-5 mr-2" />
                    {isProcessing ? 'Analyzing...' : 'Analyze Documents'}
                  </Button>

                  {uploadedFiles.filter(f => f.status === 'completed').length === 0 && (
                    <Alert>
                      <AlertTriangle className="w-4 h-4 text-orange-500" />
                      <AlertDescription>
                        Please upload documents first before querying.
                      </AlertDescription>
                    </Alert>
                  )}

                  {processingStage && (
                    <div className="mt-4">
                      <Progress value={progress} className="h-2" />
                      <p className="text-sm text-slate-600 mt-2 text-center">{processingStage}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Results */}
              {results && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0, transition: { duration: 0.5 } }}
                  className="space-y-6"
                >
                  {/* Executive Summary Card */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>Executive Summary</span>
                        <div className="flex items-center gap-3">
                          <Button variant="outline" size="sm" onClick={generatePDF}>
                            <Download className="w-4 h-4 mr-2" />
                            Download Report
                          </Button>
                          <Badge
                            variant="outline"
                            className="gap-2"
                          >
                            <CheckCircle className="w-4 h-4 text-emerald-500" />
                            {(results.confidenceScore * 100).toFixed(0)}% Confidence
                          </Badge>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm leading-relaxed text-slate-700">
                        {results.summary}
                      </p>
                    </CardContent>
                  </Card>

                  {/* Key Metrics */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="bg-gradient-to-br from-emerald-50 to-emerald-500 border-emerald-200">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <BarChart3 className="w-5 h-5 text-white" />
                          Production Output
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="text-white">
                        {results.answer && results.answer.match(/\bTotal Units Produced: [\d,]+\b/ && results.answer.includes('%')) && (
                          <div>
                            {results.answer.split('Total Units Produced:')[1]?.trim() || 'N/A'}
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-blue-500 to-blue-600 border-blue-200">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <TrendingUp className="w-5 h-5 text-white" />
                          Quality Trend
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="text-white">
                        {results.answer && results.answer.match(/First Pass Yield: [\d.]+%/) && (
                          <div>
                            {results.answer.split('First Pass Yield:')[1]?.trim() || 'N/A'}
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-orange-500 to-orange-600 border-orange-200">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Users className="w-5 h-5 text-white" />
                          Staffing
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="text-white">
                        {results.answer && results.answer.match(/\bTotal Staff: [\d,]+\b/) && (
                          <div>
                            {results.answer.split('Total Staff:')[1]?.trim() || 'N/A'}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>

                  {/* Detailed Answer */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Detailed Analysis</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="prose prose-sm max-w-none text-slate-700">
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{results.answer}</p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Risk Indicators */}
                  {results.riskIndicators && results.riskIndicators.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <AlertTriangle className="w-5 h-5 text-orange-500" />
                          Risk Indicators
                          <Badge variant="outline" className="ml-2">
                            {results.riskIndicators.length} Found
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {results.riskIndicators.map((risk, index) => (
                            <div
                              key={index}
                              className={`p-4 border rounded-lg ${getRiskColor(risk.level)}`}
                            >
                              <div className="flex items-center gap-3 mb-2">
                                <div className={`w-3 h-3 rounded-full ${getRiskColor(risk.level).split(' ')[0]}`} />
                                <div className="flex-1">
                                  <p className="font-semibold capitalize text-slate-900">
                                    {risk.category}
                                  </p>
                                  <Badge variant="outline" className="text-xs">
                                    {(risk.confidence * 100).toFixed(0)}% confident
                                  </Badge>
                                </div>
                              </div>
                              <p className="text-sm text-slate-700">
                                {risk.description}
                              </p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Citations */}
                  {results.citations && results.citations.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <BookOpen className="w-5 h-5 text-blue-600" />
                            Sources & Citations
                          </div>
                          <Badge variant="outline">
                            {results.citations.length} Sources
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ScrollArea className="max-h-96 overflow-y-auto">
                          <div className="space-y-3">
                            {results.citations.map((citation, index) => (
                              <div
                                key={index}
                                className="p-4 border rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer"
                              >
                                <div className="flex items-start gap-3">
                                  <Badge variant="outline" className="shrink-0 text-xs">
                                    {index + 1}
                                  </Badge>
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium text-slate-900">
                                      {citation.documentName}
                                    </p>
                                    <p className="text-xs text-slate-500">
                                      Relevance: {(citation.relevance * 100).toFixed(0)}%
                                    </p>
                                  </div>
                                </div>
                                <p className="text-sm text-slate-700 mt-2 line-clamp-3">
                                  {citation.content.substring(0, 200)}
                                  {citation.content.length > 200 && '...'}
                                </p>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      </CardContent>
                    </Card>
                  )}

                  {/* Source Reasoning */}
                  {results.sourceReasoning && results.sourceReasoning.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <FileText className="w-5 h-5 text-purple-600" />
                          Source Reasoning
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {results.sourceReasoning.map((step, index) => (
                            <div key={index} className="flex items-start gap-3">
                              <div className={`w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center text-white text-xs font-bold shrink-0`}>
                                {index + 1}
                              </div>
                              <div className="flex-1">
                                <p className="text-sm text-slate-700">
                                  {step}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </motion.div>
              )}
            </motion.div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white/90 backdrop-blur-sm mt-auto">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center text-sm text-slate-500">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Factory className="w-5 h-5 text-slate-600" />
              <span className="font-semibold">Plant Intelligence Systems</span>
            </div>
            <p className="text-slate-400">
              AI-Powered Manufacturing & Quality Analytics Platform
            </p>
            <div className="mt-4 flex items-center justify-center gap-4 text-xs text-slate-400">
              <span>Powered by Groq Llama 3.1 70B</span>
              <span className="mx-2">•</span>
              <span>Self-RAG Quality Assurance</span>
              <span>•</span>
              <span>Hallucination Detection</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

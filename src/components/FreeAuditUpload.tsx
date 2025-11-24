// /components/FreeAuditUpload.tsx
'use client';

import { useState } from 'react';

interface DetailedFinding {
  type: string;
  impact: string;
  confidence: string;
  description: string;
  location: {
    filename?: string;
    lines?: number[];
    start?: number;
    length?: number;
  } | null;
}

interface AuditResult {
  success: boolean;
  projectId?: string;
  timestamp?: string;
  results?: {
    summary: {
      high: number;
      medium: number;
      low: number;
      informational: number;
      optimization: number;
    };
    detailedFindings: DetailedFinding[];
    rawOutput: string;
  };
  error?: string;
}

interface VPSDetector {
  elements: Array<{
    type: string;
    name: string;
    source_mapping: {
      start: number;
      length: number;
      filename_relative: string;
      filename_absolute: string;
      filename_short: string;
      is_dependency: boolean;
      lines: number[];
      starting_column: number;
      ending_column: number;
    };
  }>;
  description: string;
  markdown: string;
  first_markdown_element: string;
  id: string;
  check: string;
  impact: string;
  confidence: string;
}

interface VPSResponse {
  analysis_id: string;
  filename: string;
  timestamp: string;
  results: {
    success: boolean;
    error: string | null;
    results: {
      detectors: VPSDetector[];
    };
  };
  exit_code: number;
}


function adaptVPSResponse(vpsData: VPSResponse): AuditResult {
  // Check for errors
  if (!vpsData.results.success || vpsData.results.error) {
    return {
      success: false,
      error: vpsData.results.error || 'Analysis failed',
    };
  }

  const summary = {
    high: 0,
    medium: 0,
    low: 0,
    informational: 0,
    optimization: 0,
  };
  
  const detailedFindings: DetailedFinding[] = [];

  // Parse Slither detectors
  try {
    const detectors = vpsData.results.results.detectors;
    
    detectors.forEach((detector: VPSDetector) => {
      const impact = detector.impact.toLowerCase();
      
      // Count by severity
      if (impact === 'high') summary.high++;
      else if (impact === 'medium') summary.medium++;
      else if (impact === 'low') summary.low++;
      else if (impact === 'optimization') summary.optimization++;
      else summary.informational++;

      // Store detailed finding
      detailedFindings.push({
        type: detector.check,
        impact: detector.impact,
        confidence: detector.confidence,
        description: detector.description,
        location: detector.elements[0]?.source_mapping ? {
          filename: detector.elements[0].source_mapping.filename_short,
          lines: detector.elements[0].source_mapping.lines,
          start: detector.elements[0].source_mapping.start,
          length: detector.elements[0].source_mapping.length,
        } : null,
      });
    });
  } catch (e) {
    console.error('Error parsing VPS response:', e);
    return {
      success: false,
      error: 'Failed to parse audit results',
    };
  }

  return {
    success: true,
    projectId: vpsData.analysis_id,
    timestamp: vpsData.timestamp,
    results: {
      summary,
      detailedFindings,
      rawOutput: JSON.stringify(vpsData.results.results, null, 2),
    },
  };
}

export default function FreeAuditUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AuditResult | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file); // VPS expects 'file', not 'foundryProject'

      const response = await fetch('https://api.hexific.com/audit', {
        method: 'POST',
        body: formData,
      });

      const vpsData = await response.json();
      
      // Adapt VPS response to match your frontend structure
      const adaptedResult = adaptVPSResponse(vpsData);
      setResult(adaptedResult);
    } catch (error) {
      setResult({
        success: false,
        error: `Failed to submit audit request: ${error}`,
      });
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'high':
        return 'text-red-600 bg-red-50';
      case 'medium':
        return 'text-orange-600 bg-orange-50';
      case 'low':
        return 'text-yellow-600 bg-yellow-50';
      case 'informational':
        return 'text-blue-600 bg-blue-50';
      case 'optimization':
        return 'text-green-600 bg-green-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-3xl font-bold mb-2">Free Smart Contract Audit</h2>
        <p className="text-gray-600 mb-6">
          Upload your Foundry project and get instant security analysis powered by Slither
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* File Upload Area */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              type="file"
              accept=".zip"
              onChange={handleFileChange}
              className="hidden"
              id="file-upload"
              disabled={loading}
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              <div className="space-y-2">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <div className="text-gray-600">
                  <span className="text-blue-600 hover:text-blue-700 font-semibold">
                    Click to upload
                  </span>{' '}
                  or drag and drop
                </div>
                <p className="text-sm text-gray-500">
                  ZIP file of your Foundry project (max 100MB)
                </p>
              </div>
            </label>
          </div>

          {file && (
            <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center space-x-3">
                <svg
                  className="h-8 w-8 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <div>
                  <p className="font-medium text-gray-900">{file.name}</p>
                  <p className="text-sm text-gray-500">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setFile(null)}
                className="text-red-600 hover:text-red-700"
              >
                Remove
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={!file || loading}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Analyzing...' : 'Start Free Audit'}
          </button>
        </form>

        {/* Results */}
        {result && (
          <div className="mt-8 space-y-6">
            {result.success && result.results ? (
              <>
                {/* Summary Cards */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="bg-red-50 p-4 rounded-lg">
                    <div className="text-3xl font-bold text-red-600">
                      {result.results.summary.high}
                    </div>
                    <div className="text-sm text-red-700 font-medium">High</div>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <div className="text-3xl font-bold text-orange-600">
                      {result.results.summary.medium}
                    </div>
                    <div className="text-sm text-orange-700 font-medium">Medium</div>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <div className="text-3xl font-bold text-yellow-600">
                      {result.results.summary.low}
                    </div>
                    <div className="text-sm text-yellow-700 font-medium">Low</div>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-3xl font-bold text-blue-600">
                      {result.results.summary.informational}
                    </div>
                    <div className="text-sm text-blue-700 font-medium">Info</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="text-3xl font-bold text-green-600">
                      {result.results.summary.optimization}
                    </div>
                    <div className="text-sm text-green-700 font-medium">
                      Optimization
                    </div>
                  </div>
                </div>

                {/* Detailed Findings */}
                {result.results.detailedFindings.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold">Detailed Findings</h3>
                    {result.results.detailedFindings.map((finding, index) => (
                      <div
                        key={index}
                        className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <span
                              className={`px-3 py-1 rounded-full text-sm font-semibold ${getSeverityColor(
                                finding.impact
                              )}`}
                            >
                              {finding.impact}
                            </span>
                            <span className="text-sm text-gray-500">
                              Confidence: {finding.confidence}
                            </span>
                          </div>
                        </div>
                        <p className="text-gray-700 mb-2">{finding.description}</p>
                        <p className="text-sm text-gray-500 font-mono">
                          Type: {finding.type}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Download Report Button */}
                <button
                  type="button"
                  onClick={() => {
                    const blob = new Blob([result.results!.rawOutput], {
                      type: 'text/plain',
                    });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `audit-report-${result.projectId}.txt`;
                    a.click();
                  }}
                  className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  Download Full Report
                </button>
              </>
            ) : (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800 font-semibold">Error</p>
                <p className="text-red-600">{result.error}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
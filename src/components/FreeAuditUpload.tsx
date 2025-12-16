'use client';

import { useState, useEffect } from 'react';
import AIAssistModal from './AIAssistModal';
import { 
  checkRateLimit, 
  logUsage, 
  getClientIP, 
  getTimeUntilReset,
  type ServiceType 
} from '@/lib/rateLimiter';

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
  // For address audit
  contract_name?: string;
  contract_address?: string;
  network?: string;
  compiler_version?: string;
  ai_model?: string;
  analysis_id?: string;
  cost_usd?: number;
  detailed_audit?: string;
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

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB in bytes

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

// Parse AI audit text into structured findings
function parseAIAuditFindings(auditText: string): DetailedFinding[] {
  const findings: DetailedFinding[] = [];
  
  // Split by common section headers or numbered items
  const sections = auditText.split(/(?=\d+\.\s+|\n#{1,3}\s+)/);
  
  sections.forEach((section) => {
    const trimmed = section.trim();
    if (!trimmed || trimmed.length < 20) return;
    
    // Try to extract severity from text
    let impact = 'Medium';
    if (/(critical|high|severe)/i.test(trimmed)) {
      impact = 'High';
    } else if (/(low|minor)/i.test(trimmed)) {
      impact = 'Low';
    } else if (/(info|informational|note)/i.test(trimmed)) {
      impact = 'Informational';
    }
    
    // Extract type from section heading or first line
    const firstLine = trimmed.split('\n')[0];
    let type = 'Security Issue';
    
    if (/reentrancy/i.test(firstLine)) type = 'Reentrancy';
    else if (/access control/i.test(firstLine)) type = 'Access Control';
    else if (/overflow|underflow/i.test(firstLine)) type = 'Integer Overflow';
    else if (/gas/i.test(firstLine)) type = 'Gas Optimization';
    else if (/unchecked/i.test(firstLine)) type = 'Unchecked Call';
    else if (/timestamp/i.test(firstLine)) type = 'Timestamp Dependence';
    else if (/authorization|permission/i.test(firstLine)) type = 'Authorization';
    
    findings.push({
      type,
      impact,
      confidence: 'High',
      description: trimmed,
      location: null,
    });
  });
  
  return findings.length > 0 ? findings : [{
    type: 'General Analysis',
    impact: 'Informational',
    confidence: 'High',
    description: auditText,
    location: null,
  }];
}

export default function FreeAuditUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AuditResult | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAIModal, setShowAIModal] = useState(false);
  const [prefilledQuestion, setPrefilledQuestion] = useState<string | undefined>(undefined);
  const [aiModalMode, setAiModalMode] = useState<'quick_actions' | 'instant_fix'>('quick_actions');
  const [selectedFinding, setSelectedFinding] = useState<DetailedFinding | null>(null);
  const [auditMode, setAuditMode] = useState<'upload' | 'address'>('upload');
  const [contractAddress, setContractAddress] = useState('');
  const [statusMessages, setStatusMessages] = useState<{ message: string; type: string }[]>([]);
  const [rateLimitError, setRateLimitError] = useState<{
    show: boolean;
    remaining: number;
    resetTime: Date;
    service: string;
  } | null>(null);

  const addStatus = (message: string, type: 'info' | 'success' | 'error' | 'warning') => {
    setStatusMessages((prev) => {
      const newMessages = [...prev, { message, type }];
      return newMessages.slice(-5);
    });
  };

  const isValidAddress = (address: string) => {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  };

  const validateFile = (selectedFile: File): boolean => {
    setError(null);

    // Check file type
    if (!selectedFile.name.endsWith('.zip')) {
      setError('Please upload a ZIP file');
      return false;
    }

    // Check file size
    if (selectedFile.size > MAX_FILE_SIZE) {
      setError(`File size exceeds maximum limit of ${(MAX_FILE_SIZE / 1024 / 1024).toFixed(0)}MB. Your file is ${(selectedFile.size / 1024 / 1024).toFixed(2)}MB`);
      return false;
    }

    return true;
  };

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
      const droppedFile = e.dataTransfer.files[0];
      if (validateFile(droppedFile)) {
        setFile(droppedFile);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (validateFile(selectedFile)) {
        setFile(selectedFile);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (auditMode === 'upload') {
      // Get user IP
      const ipAddress = await getClientIP();
      
      // Check rate limit
      const { allowed, remaining, resetTime } = await checkRateLimit(
        ipAddress,
        'zip_upload'
      );

      if (!allowed) {
        setRateLimitError({
          show: true,
          remaining: 0,
          resetTime,
          service: 'ZIP Upload Audit',
        });
        return;
      }

      // Free audit - ZIP upload
      if (!file) return;
      
      setLoading(true);
      setResult(null);
      setStatusMessages([]);

      try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('https://api.hexific.com/audit', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`Server responded with status: ${response.status}`);
        }

        const vpsData = await response.json();
        const adaptedResult = adaptVPSResponse(vpsData);

        // Log usage after successful audit
        await logUsage(ipAddress, 'zip_upload', {
          filename: file.name,
          filesize: file.size,
          success: adaptedResult.success,
        });

        setResult(adaptedResult);
      } catch (error) {
        setResult({
          success: false,
          error: `Failed to submit audit request: ${error}`,
        });
      } finally {
        setLoading(false);
      }
    } else {
      //Free audit - Contract Address
      if (!contractAddress.trim()) {
        addStatus('Please enter a contract address', 'error');
        return;
      }

      if (!isValidAddress(contractAddress.trim())) {
        addStatus('Invalid Ethereum address format', 'error');
        return;
      }

      setLoading(true);
      setResult(null);
      setStatusMessages([]);

      try {
        // Get user IP
        const ipAddress = await getClientIP();
        
        // Check rate limit
        const { allowed, remaining, resetTime } = await checkRateLimit(
          ipAddress,
          'address_audit'
        );

        if (!allowed) {
          setRateLimitError({
            show: true,
            remaining: 0,
            resetTime,
            service: 'Address Audit',
          });
          return;
        }

        addStatus('🔍 Starting security audit...', 'info');

        const response = await fetch('https://api.hexific.com/ai-audit-address-ui', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contract_address: contractAddress.trim(),
            network: 'ethereum'
          }),
        });

        if (response.ok) {
          const apiResult = await response.json();
          
          if (apiResult.success && apiResult.detailed_audit) {
            addStatus('✅ Audit completed!', 'success');
            
            // Parse AI audit into structured findings
            const aiFindings = parseAIAuditFindings(apiResult.detailed_audit);
            
            // Count severity summary from parsed findings
            const summary = {
              high: aiFindings.filter(f => f.impact === 'High').length,
              medium: aiFindings.filter(f => f.impact === 'Medium').length,
              low: aiFindings.filter(f => f.impact === 'Low').length,
              informational: aiFindings.filter(f => f.impact === 'Informational').length,
              optimization: aiFindings.filter(f => f.impact === 'Optimization').length,
            };

            // Log usage after successful audit
            await logUsage(ipAddress, 'address_audit', {
              contract_address: contractAddress.trim(),
              network: 'ethereum',
              findings_count: aiFindings.length,
              success: true,
            });
            
            setResult({
              ...apiResult,
              results: {
                summary,
                detailedFindings: aiFindings,
                rawOutput: apiResult.detailed_audit,
              }
            });
            
            setTimeout(() => {
              document.getElementById('resultsContainer')?.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start' 
              });
            }, 100);
          } else {
            addStatus(`❌ ${apiResult.error || 'Audit failed'}`, 'error');
          }
        } else {
          const errorText = await response.text();
          let errorMsg = 'Audit failed';
          
          try {
            const errorJson = JSON.parse(errorText);
            errorMsg = errorJson.detail || errorJson.message || errorText;
          } catch {
            errorMsg = errorText;
          }

          if (errorMsg.includes('not verified')) {
            addStatus('❌ Contract not verified on Etherscan', 'error');
            addStatus('Verify at: https://etherscan.io/verifyContract', 'info');
          } else {
            addStatus(`❌ Error: ${errorMsg}`, 'error');
          }
        }

        setLoading(false);
      } catch (error: any) {
        console.error('Audit error:', error);
        addStatus(`❌ Error: ${error.message}`, 'error');
        setLoading(false);
      }
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'high':
        return 'text-red-400 bg-red-950/50 border-red-500/30';
      case 'medium':
        return 'text-orange-400 bg-orange-950/50 border-orange-500/30';
      case 'low':
        return 'text-yellow-400 bg-yellow-950/50 border-yellow-500/30';
      case 'informational':
        return 'text-blue-400 bg-blue-950/50 border-blue-500/30';
      case 'optimization':
        return 'text-lime-400 bg-lime-950/50 border-lime-500/30';
      default:
        return 'text-gray-400 bg-gray-950/50 border-gray-500/30';
    }
  };

  const getStatusIcon = (type: string) => {
    const icons: { [key: string]: string } = {
      info: 'ℹ️',
      success: '✅',
      error: '❌',
      warning: '⚠️'
    };
    return icons[type] || 'ℹ️';
  };

  const downloadReport = () => {
    if (!result) return;

    let reportContent = '';
    let filename = '';

    if (result.results) {
      reportContent = result.results.rawOutput;
      filename = `audit-report-${result.projectId || result.analysis_id}.txt`;
    } else if (result.detailed_audit) {
      reportContent = `
SMART CONTRACT SECURITY AUDIT REPORT
=====================================

Contract: ${result.contract_name}
Address: ${result.contract_address}
Network: ${result.network}
Compiler: ${result.compiler_version}
AI Model: ${result.ai_model}
Analysis ID: ${result.analysis_id}
Timestamp: ${new Date(result.timestamp || '').toLocaleString()}

DETAILED SECURITY ANALYSIS
==========================

${result.detailed_audit}
`;
      filename = `audit-${result.contract_name}-${result.analysis_id}.txt`;
    }

    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    if (rateLimitError?.show) {
      // Wait a bit for the error box to render
      setTimeout(() => {
        const errorElement = document.getElementById('rateLimitError');
        if (errorElement) {
          errorElement.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center'
          });
        }
      }, 100);
    }
  }, [rateLimitError?.show]);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="glass-effect rounded-2xl shadow-lg p-8 border border-lime-400/20">
        <h2 className="text-3xl font-bold mb-2 gradient-text">
          {auditMode === 'upload' 
            ? 'Free Smart Contract Audit' 
            : 'Free AI-Powered Contract Audit'
          }
        </h2>
        <p className="text-gray-300 mb-6">
          {auditMode === 'upload' 
            ? 'Upload your Foundry project and get instant security analysis powered by Slither'
            : 'Enter contract address and get AI-powered security analysis - completely free!'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {rateLimitError?.show && (
          <div 
            id="rateLimitError"
            className="glass-effect border border-red-500/50 bg-red-950/20 rounded-lg p-4 slide-up flex items-center justify-center"
          >
            <div className="flex items-center">
            <svg className="w-6 h-6 text-red-400 mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
              <div>
                <p className="text-red-400 font-semibold mb-1">Daily Limit Reached</p>
                <p className="text-red-300 text-sm mb-2">
                You've used all 3 free {rateLimitError.service} requests for today.
                </p>
                <p className="text-red-300 text-sm">
                Resets in: <span className="font-semibold">{getTimeUntilReset(rateLimitError.resetTime)}</span>
                </p>
                <p className="text-gray-400 text-xs mt-2">
                💡 Tip: You can still use the other audit type (ZIP upload or Address audit)
                </p>
              </div>
            </div>
          </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="glass-effect border border-red-500/30 rounded-lg p-4 slide-up">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <p className="text-red-400 font-semibold">{error}</p>
              </div>
            </div>
          )}

          {/* Mode Switcher */}
          {auditMode === 'upload' ? (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setAuditMode('address');
                  setStatusMessages([]);
                  setResult(null);
                  setFile(null);
                }}
                className="text-sm text-lime-400 hover:text-lime-300 hover:cursor-pointer underline transition-colors"
              >
                Or audit by contract address →
              </button>
            </div>
          ) : (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setAuditMode('upload');
                  setStatusMessages([]);
                  setResult(null);
                }}
                className="text-sm text-lime-400 hover:text-lime-300 hover:cursor-pointer nderline transition-colors"
              >
                ← Back to ZIP upload
              </button>
            </div>
          )}
          
          {/* Conditional Input Based on Mode */}
          {auditMode === 'upload' ? (
            <>
              {/* File Upload Area */}
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300 ${
                  dragActive
                    ? 'border-lime-400 bg-lime-400/10 scale-[1.02]'
                    : 'border-lime-400/30 hover:border-lime-400/50 hover:bg-lime-400/5'
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
                    <div className="mx-auto w-16 h-16 bg-lime-400/20 rounded-xl flex items-center justify-center mb-4">
                      <svg
                        className="h-8 w-8 text-lime-400"
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
                    </div>
                    <div className="text-gray-300">
                      <span className="text-lime-400 hover:text-lime-300 font-semibold transition-colors">
                        Click to upload
                      </span>{' '}
                      or drag and drop
                    </div>
                    <p className="text-sm text-gray-400">
                      ZIP file of your Foundry project (max 100MB)
                    </p>
                  </div>
                </label>
              </div>

              {file && (
                <div className="flex items-center justify-between glass-effect p-4 rounded-lg border border-lime-400/20 slide-up">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-lime-400/20 rounded-lg flex items-center justify-center">
                      <svg
                        className="h-6 w-6 text-lime-400"
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
                    </div>
                    <div>
                      <p className="font-medium text-white">{file.name}</p>
                      <p className="text-sm text-gray-400">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFile(null)}
                    className="text-red-400 hover:text-red-300 transition-colors"
                  >
                    <svg className="w-5 h-5 hover:cursor-pointer" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              )}
            </>
          ) : (
            <>
              {/* Address Input Area - Same style as ZIP upload */}
              <div
                className="border-2 border-dashed rounded-lg p-8 text-center border-lime-400/30 hover:border-lime-400/50 hover:bg-lime-400/5 transition-all"
              >
                <div className="mx-auto w-16 h-16 bg-lime-400/20 rounded-xl flex items-center justify-center mb-4">
                  <svg
                    className="h-8 w-8 text-lime-400"
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
                </div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Contract Address (Ethereum Mainnet)
                </label>
                <input
                  type="text"
                  value={contractAddress}
                  onChange={(e) => setContractAddress(e.target.value)}
                  placeholder="0x..."
                  maxLength={42}
                  className="w-full px-4 py-3 bg-transparent border-2 border-lime-400/30 rounded-lg text-white focus:border-lime-400 focus:outline-none transition-colors placeholder-gray-500"
                  disabled={loading}
                />
                <p className="text-sm text-gray-400 mt-3">
                  ⚠️ Contract must be verified on Etherscan
                </p>
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={
              (auditMode === 'upload' && !file) ||
              (auditMode === 'address' && !isValidAddress(contractAddress.trim())) ||
              loading
            }
            className={`w-full py-3 px-6 rounded-lg font-bold transition-all ${
              (auditMode === 'upload' && !file) ||
              (auditMode === 'address' && !isValidAddress(contractAddress.trim())) ||
              loading
                ? 'bg-transparent border border-gray-600 text-gray-500 cursor-not-allowed !hover:transform-none'
                : 'bg-lime-400 text-black hover:bg-lime-300 hover:cursor-pointer pulse-glow'
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Analyzing...
              </span>
            ) : (
              'Start Free Audit'
            )}
          </button>
        </form>

        {/* Status Messages for Address Audit */}
        {auditMode === 'address' && statusMessages.length > 0 && (
          <div className="mt-6 space-y-3">
            {statusMessages.map((status, index) => (
              <div
                key={index}
                className={`glass-effect border rounded-lg p-3 flex items-center gap-3 slide-up ${
                  status.type === 'info'
                    ? 'border-blue-500/30 bg-blue-950/20'
                    : status.type === 'success'
                    ? 'border-lime-500/30 bg-lime-950/20'
                    : status.type === 'error'
                    ? 'border-red-500/30 bg-red-950/20'
                    : 'border-yellow-500/30 bg-yellow-950/20'
                }`}
              >
                <span>{getStatusIcon(status.type)}</span>
                <span className={`text-sm ${
                  status.type === 'info'
                    ? 'text-blue-400'
                    : status.type === 'success'
                    ? 'text-lime-400'
                    : status.type === 'error'
                    ? 'text-red-400'
                    : 'text-yellow-400'
                }`}>{status.message}</span>
              </div>
            ))}
          </div>
        )}

        {/* Results */}
        {result && (
          <div id="resultsContainer" className="mt-8 space-y-6 slide-up">
            {result.success ? (
              <>
                {/* Summary Cards - SAME FOR BOTH MODES */}
                {result.results && (
                  <>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      <div className="glass-effect border border-red-500/30 p-4 rounded-lg hover:scale-105 transition-transform">
                        <div className="text-3xl font-bold text-red-400 mb-1">
                          {result.results.summary.high}
                        </div>
                        <div className="text-sm text-red-400 font-medium">High</div>
                      </div>
                      <div className="glass-effect border border-orange-500/30 p-4 rounded-lg hover:scale-105 transition-transform">
                        <div className="text-3xl font-bold text-orange-400 mb-1">
                          {result.results.summary.medium}
                        </div>
                        <div className="text-sm text-orange-400 font-medium">Medium</div>
                      </div>
                      <div className="glass-effect border border-yellow-500/30 p-4 rounded-lg hover:scale-105 transition-transform">
                        <div className="text-3xl font-bold text-yellow-400 mb-1">
                          {result.results.summary.low}
                        </div>
                        <div className="text-sm text-yellow-400 font-medium">Low</div>
                      </div>
                      <div className="glass-effect border border-blue-500/30 p-4 rounded-lg hover:scale-105 transition-transform">
                        <div className="text-3xl font-bold text-blue-400 mb-1">
                          {result.results.summary.informational}
                        </div>
                        <div className="text-sm text-blue-400 font-medium">Info</div>
                      </div>
                      <div className="glass-effect border border-lime-500/30 p-4 rounded-lg hover:scale-105 transition-transform">
                        <div className="text-3xl font-bold text-lime-400 mb-1">
                          {result.results.summary.optimization}
                        </div>
                        <div className="text-sm text-lime-400 font-medium">
                          Optimization
                        </div>
                      </div>
                    </div>

                    {/* AI Assistant Button */}
                    <button
                      onClick={() => {
                        setAiModalMode('quick_actions');
                        setSelectedFinding(null);
                        setShowAIModal(true);
                      }}
                      className="w-full bg-gradient-to-r from-lime-400 to-lime-500 text-black py-4 px-6 rounded-lg font-semibold hover:from-lime-300 hover:to-lime-400 hover:cursor-pointer transition-all shadow-lg flex items-center justify-center space-x-2 pulse-glow"
                    >
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                        />
                      </svg>
                      <span>Ask AI About Your Audit (3 Free Questions)</span>
                    </button>

                    {/* Detailed Findings - SAME FOR BOTH MODES */}
                    {result.results.detailedFindings.length > 0 && (
                      <div className="space-y-4">
                        <h3 className="text-xl font-bold gradient-text">Detailed Findings</h3>
                        {result.results.detailedFindings.map((finding, index) => (
                          <div
                            key={index}
                            className="glass-effect border rounded-lg p-4 hover:border-lime-400/40 transition-all hover:scale-[1.01]"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-bold border ${getSeverityColor(
                                  finding.impact
                                )}`}
                              >
                                {finding.impact.toUpperCase()}
                              </span>
                              <span className="text-xs text-gray-400">
                                Confidence: {finding.confidence}
                              </span>
                            </div>
                            <div className="text-left mb-2">
                              <div className="bg-gray-900/50 border border-gray-700/50 rounded-lg p-4 font-mono text-sm">
                                {finding.description.split('\n').map((line, lineIndex) => {
                                  const isMainIssue = lineIndex === 0;
                                  const isIndented = line.startsWith('\t');
                                  const trimmedLine = line.replace(/^\t/, '');
                                  
                                  return (
                                    <div
                                      key={lineIndex}
                                      className={`${
                                        isMainIssue
                                          ? 'text-lime-400 font-semibold mb-2'
                                          : isIndented
                                          ? 'text-gray-400 pl-4 py-0.5'
                                          : 'text-gray-300 py-0.5'
                                      }`}
                                    >
                                      {isIndented && (
                                        <span className="text-lime-400/40 mr-2">•</span>
                                      )}
                                      {trimmedLine}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                            {finding.location && (
                              <div className="mt-2 text-sm text-gray-400">
                                {finding.location.filename && (
                                  <div className="flex items-center space-x-2 mb-1">
                                    <svg
                                      className="w-4 h-4 text-lime-400"
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
                                    <span className="font-mono">{finding.location.filename}</span>
                                  </div>
                                )}
                                {finding.location.lines && finding.location.lines.length > 0 && (
                                  <div className="flex items-center space-x-2">
                                    <svg
                                      className="w-4 h-4 text-lime-400"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"
                                      />
                                    </svg>
                                    <span>
                                      Lines: {finding.location.lines.join(', ')}
                                    </span>
                                  </div>
                                )}
                              </div>
                            )}
                            <p className="text-sm text-lime-400/70 font-mono bg-lime-400/5 px-2 py-1 rounded inline-block mt-2">
                              Type: {finding.type}
                            </p>
                            <button
                              onClick={() => {
                                setAiModalMode('instant_fix');
                                setSelectedFinding(finding);
                                setShowAIModal(true);
                              }}
                              className="mt-3 bg-lime-400/10 border border-lime-400/30 text-lime-400 px-4 py-2 rounded-lg font-semibold text-sm flex items-center space-x-2 hover:bg-lime-400/20 hover:border-lime-400/50 hover:cursor-pointer transition-all group"
                            >
                              <svg
                                className="w-4 h-4 group-hover:rotate-12 transition-transform"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M13 10V3L4 14h7v7l9-11h-7z"
                                />
                              </svg>
                              <span>Get AI Fix Suggestion</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}

                {/* Download Report Button */}
                <button
                  type="button"
                  onClick={downloadReport}
                  className="w-full border border-lime-400 text-lime-400 py-3 px-4 rounded-lg font-semibold hover:bg-lime-400 hover:text-black hover:cursor-pointer transition-all"
                >
                  <span className="flex items-center justify-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Download Full Report
                  </span>
                </button>
              </>
            ) : (
              <div className="glass-effect border border-red-500/30 rounded-lg p-6">
                <div className="flex items-center mb-2">
                  <svg className="w-6 h-6 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <p className="text-red-400 font-bold text-lg">Error</p>
                </div>
                <p className="text-red-300">{result.error}</p>
              </div>
            )}

            {/* AI Assistant Modal */}
            {result?.success && result.results && (
              <AIAssistModal
                isOpen={showAIModal}
                onClose={() => {
                  setShowAIModal(false);
                  setPrefilledQuestion(undefined);
                }}
                auditResults={result.results}
                analysisId={result.projectId || result.analysis_id || ''}
                mode={aiModalMode}
                findingDetails={selectedFinding || undefined}
                prefilledQuestion={prefilledQuestion}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
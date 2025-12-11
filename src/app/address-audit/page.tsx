'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function AddressAuditPage() {
  const [contractAddress, setContractAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessages, setStatusMessages] = useState<{ message: string; type: string }[]>([]);
  const [auditResults, setAuditResults] = useState<any>(null);
  const [currentAddress, setCurrentAddress] = useState<string | null>(null);

  const API_URL = 'https://api.hexific.com';
  const AUDIT_ENDPOINT = '/ai-audit-address';

  const isValidAddress = (address: string) => {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  };

  const addStatus = (message: string, type: 'info' | 'success' | 'error' | 'warning') => {
    setStatusMessages((prev) => {
      const newMessages = [...prev, { message, type }];
      return newMessages.slice(-4); // Keep only last 4 messages
    });
  };

  const startAudit = async (address: string) => {
    try {
      setIsLoading(true);
      setStatusMessages([]);
      setAuditResults(null);

      addStatus('📡 Connecting to API...', 'info');

      const response = await fetch(API_URL + AUDIT_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contract_address: address,
          network: 'ethereum'
        }),
      });

      console.log('Response status:', response.status);

      // Handle 402 Payment Required
      if (response.status === 402) {
        addStatus('💳 Payment Required', 'warning');
        addStatus('If you have a compatible wallet extension, it should prompt for payment.', 'info');
        addStatus('⚠️ Alternative: Use the Node.js client script for programmatic payment', 'warning');
        
        const paymentData = await response.json();
        console.log('Payment details:', paymentData);
        
        setIsLoading(false);
        return;
      }

      // Handle success
      if (response.ok) {
        const result = await response.json();
        
        if (result.success) {
          addStatus('✅ Payment verified! Audit completed', 'success');
          setAuditResults(result);
          
          // Scroll to results
          setTimeout(() => {
            document.getElementById('resultsContainer')?.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'start' 
            });
          }, 100);
        } else {
          addStatus(`❌ ${result.error || 'Audit failed'}`, 'error');
        }
      } else {
        // Handle errors
        const errorText = await response.text();
        let errorMsg = 'Audit failed';
        
        try {
          const errorJson = JSON.parse(errorText);
          errorMsg = errorJson.detail || errorJson.message || errorText;
        } catch {
          errorMsg = errorText;
        }

        // Specific error messages
        if (errorMsg.includes('not verified')) {
          addStatus('❌ Contract not verified on Etherscan', 'error');
          addStatus('Please verify your contract first: https://etherscan.io/verifyContract', 'info');
        } else if (errorMsg.includes('timeout') || errorMsg.includes('authorization')) {
          addStatus('⏱️ Payment timeout', 'warning');
        } else {
          addStatus(`❌ Error: ${errorMsg}`, 'error');
        }
      }

      setIsLoading(false);

    } catch (error: any) {
      console.error('Request error:', error);
      addStatus(`❌ Network error: ${error.message}`, 'error');
      addStatus('Please check your connection and try again', 'info');
      setIsLoading(false);
    }
  };

  const handleAuditClick = () => {
    const address = contractAddress.trim();
    
    if (!address) {
      addStatus('Please enter a contract address', 'error');
      return;
    }

    if (!isValidAddress(address)) {
      addStatus('Invalid Ethereum address format', 'error');
      return;
    }

    setCurrentAddress(address);
    startAudit(address);
  };

  const retryAudit = () => {
    if (currentAddress) {
      startAudit(currentAddress);
    }
  };

  const downloadReport = () => {
    if (!auditResults) return;

    const reportContent = `
SMART CONTRACT SECURITY AUDIT REPORT
=====================================

Contract: ${auditResults.contract_name}
Address: ${auditResults.contract_address}
Network: ${auditResults.network}
Compiler: ${auditResults.compiler_version}
AI Model: ${auditResults.ai_model}
Analysis ID: ${auditResults.analysis_id}
Timestamp: ${new Date(auditResults.timestamp).toLocaleString()}
Cost: $${auditResults.cost_usd} USDC

DETAILED SECURITY ANALYSIS
==========================

${auditResults.detailed_audit}
`;

    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-${auditResults.contract_name}-${auditResults.analysis_id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    addStatus('✅ Report downloaded', 'success');
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

  return (
    <div className="min-h-screen bg-[#0f172a] text-[#f1f5f9]">
      <div className="max-w-[900px] mx-auto px-4 py-8">
        <Link 
          href="/" 
          className="inline-block text-[#3b82f6] mb-8 hover:-translate-x-1 transition-transform"
        >
          ← Back to Home
        </Link>
        
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-[#3b82f6] to-[#8b5cf6] bg-clip-text text-transparent">
            🔍 Audit by Contract Address
          </h1>
          <p className="text-[#94a3b8] text-lg">
            Instant security analysis for deployed & verified contracts
          </p>
        </div>

        <div className="bg-[#1e293b] rounded-2xl p-8 mb-8 border border-white/10">
          <div className="flex flex-wrap gap-2 mb-6">
            <span className="inline-block bg-[#3b82f6]/20 text-[#3b82f6] px-4 py-2 rounded-lg text-sm font-semibold">
              🔷 Ethereum Mainnet
            </span>
            <span className="inline-block bg-[#f59e0b]/20 text-[#f59e0b] px-4 py-2 rounded-lg text-sm font-semibold">
              🟣 Solana (Coming Soon)
            </span>
          </div>
          
          <div className="text-center my-6">
            <div className="inline-block bg-[#10b981]/20 text-[#10b981] px-6 py-3 rounded-lg text-xl font-bold mb-2">
              💰 $0.05 USDC
            </div>
            <p className="text-[#94a3b8] text-sm">
              (Cheaper than ZIP upload!)
            </p>
          </div>

          <div className="mb-6">
            <label htmlFor="contractAddress" className="block mb-2 font-semibold text-[#f1f5f9]">
              Contract Address
            </label>
            <input 
              type="text"
              id="contractAddress"
              value={contractAddress}
              onChange={(e) => setContractAddress(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && isValidAddress(contractAddress.trim())) {
                  handleAuditClick();
                }
              }}
              placeholder="0x..." 
              maxLength={42}
              className="w-full p-4 bg-black/30 border-2 border-white/10 rounded-lg text-[#f1f5f9] focus:border-[#3b82f6] focus:outline-none transition-colors"
            />
          </div>

          <div className="bg-[#3b82f6]/10 border border-[#3b82f6]/30 p-6 rounded-lg mb-6">
            <h4 className="text-[#3b82f6] font-semibold mb-2">⚠️ Requirements:</h4>
            <ul className="space-y-1">
              <li className="text-[#94a3b8]">
                <span className="text-[#3b82f6] font-bold mr-2">•</span>
                Contract must be <strong>verified on Etherscan</strong>
              </li>
              <li className="text-[#94a3b8]">
                <span className="text-[#3b82f6] font-bold mr-2">•</span>
                Payment via x402 protocol (Base Sepolia)
              </li>
              <li className="text-[#94a3b8]">
                <span className="text-[#3b82f6] font-bold mr-2">•</span>
                Wallet extension compatible with x402 (or use client script)
              </li>
            </ul>
          </div>

          <button
            onClick={handleAuditClick}
            disabled={!isValidAddress(contractAddress.trim()) || isLoading}
            className="w-full p-5 text-lg font-semibold rounded-lg bg-gradient-to-r from-[#3b82f6] to-[#8b5cf6] text-white hover:translate-y-[-2px] hover:shadow-[0_10px_25px_rgba(59,130,246,0.3)] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:translate-y-0 flex items-center justify-center gap-2"
          >
            <span>🛡️</span>
            <span>Start Security Audit</span>
          </button>

          {currentAddress && !auditResults && statusMessages.length > 0 && (
            <button
              onClick={retryAudit}
              disabled={isLoading}
              className="w-full mt-4 p-4 text-lg font-semibold rounded-lg bg-white/10 text-[#f1f5f9] hover:bg-white/15 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <span>🔄</span>
              <span>Retry Payment</span>
            </button>
          )}
        </div>

        {/* Status Messages */}
        {statusMessages.length > 0 && (
          <div className="space-y-4 mb-8">
            {statusMessages.map((status, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg flex items-center gap-3 border-l-4 ${
                  status.type === 'info'
                    ? 'bg-[#3b82f6]/10 border-[#3b82f6] text-[#3b82f6]'
                    : status.type === 'success'
                    ? 'bg-[#10b981]/10 border-[#10b981] text-[#10b981]'
                    : status.type === 'error'
                    ? 'bg-[#ef4444]/10 border-[#ef4444] text-[#ef4444]'
                    : 'bg-[#f59e0b]/10 border-[#f59e0b] text-[#f59e0b]'
                }`}
              >
                <span>{getStatusIcon(status.type)}</span>
                <span>{status.message}</span>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-center">
                <div className="w-10 h-10 border-4 border-white/10 border-t-[#3b82f6] rounded-full animate-spin"></div>
              </div>
            )}
          </div>
        )}

        {/* Results */}
        {auditResults && (
          <div id="resultsContainer" className="bg-[#1e293b] rounded-2xl p-8 border border-white/10">
            <h2 className="text-2xl font-bold mb-6 text-[#3b82f6]">
              📊 Audit Report
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <div className="bg-black/30 p-4 rounded-lg">
                <strong className="block text-[#94a3b8] text-sm mb-2">Contract Name</strong>
                <p className="text-[#f1f5f9] text-lg">{auditResults.contract_name || 'N/A'}</p>
              </div>
              <div className="bg-black/30 p-4 rounded-lg">
                <strong className="block text-[#94a3b8] text-sm mb-2">Network</strong>
                <p className="text-[#f1f5f9] text-lg">{auditResults.network || 'Ethereum'}</p>
              </div>
              <div className="bg-black/30 p-4 rounded-lg">
                <strong className="block text-[#94a3b8] text-sm mb-2">Compiler</strong>
                <p className="text-[#f1f5f9] text-lg">{auditResults.compiler_version || 'N/A'}</p>
              </div>
              <div className="bg-black/30 p-4 rounded-lg">
                <strong className="block text-[#94a3b8] text-sm mb-2">AI Model</strong>
                <p className="text-[#f1f5f9] text-lg">{auditResults.ai_model || 'Claude Sonnet 4.5'}</p>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-bold text-[#3b82f6] mb-4">
                🔍 Security Analysis
              </h3>
              <pre className="bg-black/40 p-6 rounded-lg overflow-x-auto whitespace-pre-wrap break-words leading-relaxed">
                {auditResults.detailed_audit || 'No audit data available'}
              </pre>
            </div>

            <button
              onClick={downloadReport}
              className="w-full p-4 text-lg font-semibold rounded-lg bg-white/10 text-[#f1f5f9] hover:bg-white/15 transition-colors flex items-center justify-center gap-2"
            >
              <span>📥</span>
              <span>Download Full Report</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
'use client';

import { useState, useEffect } from 'react';
import { useAccount, useWalletClient, useSignMessage } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { CodeBlock } from '@/components/CodeBlock';

interface FindingDetails {
  type: string;
  impact: string;
  confidence: string;
  description: string;
}

interface AIAssistModalProps {
  isOpen: boolean;
  onClose: () => void;
  auditResults: {
    summary: {
      high: number;
      medium: number;
      low: number;
      informational: number;
      optimization: number;
    };
    detailedFindings: Array<{
      type: string;
      impact: string;
      confidence: string;
      description: string;
    }>;
    rawOutput: string;
  };
  analysisId: string;
  mode?: 'quick_actions' | 'instant_fix';
  prefilledQuestion?: string;
  findingDetails?: FindingDetails;
}

interface WalletError {
  code?: number;
  message?: string;
  stack?: string;
  shortMessage?: string;
  details?: string;
}

export default function AIAssistModal({
  isOpen,
  onClose,
  auditResults,
  analysisId,
  mode = 'quick_actions',
  prefilledQuestion,
  findingDetails,
}: AIAssistModalProps) {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState('');
  const [freeQueriesLeft, setFreeQueriesLeft] = useState(3);
  const [conversationHistory, setConversationHistory] = useState<
    Array<{ question: string; response: string; isPaid: boolean }>
  >([]);
  const [showPaymentPrompt, setShowPaymentPrompt] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(mode === 'quick_actions');
  const [showCustomInput, setShowCustomInput] = useState(false);

  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const { signMessageAsync } = useSignMessage();

  // Load queries from localStorage
  useEffect(() => {
    if (isOpen) {
      const stored = localStorage.getItem(`ai_queries_${analysisId}`);
      if (stored) {
        const data = JSON.parse(stored);
        setFreeQueriesLeft(data.remaining);
        setConversationHistory(data.history || []);
      } else {
        // Initialize for this audit
        localStorage.setItem(
          `ai_queries_${analysisId}`,
          JSON.stringify({ remaining: 3, history: [] })
        );
      }
      // findingDetails
      if (mode === 'instant_fix' && findingDetails) {
        handleInstantFix();
      }
      if (prefilledQuestion) {
        setQuestion(prefilledQuestion);
      }
    }
  }, [isOpen, prefilledQuestion, analysisId, mode]);

  function parseAIResponse(response: string) {
    const parts: Array<{ type: 'text' | 'code'; content: string; language?: string }> = [];
    
    // Match code blocks with ```language
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(response)) !== null) {
      // Add text before code block
      if (match.index > lastIndex) {
        parts.push({
          type: 'text',
          content: response.substring(lastIndex, match.index).trim(),
        });
      }

      // Add code block
      parts.push({
        type: 'code',
        content: match[2].trim(),
        language: match[1] || 'solidity',
      });

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < response.length) {
      parts.push({
        type: 'text',
        content: response.substring(lastIndex).trim(),
      });
    }

    return parts;
  }

  const handleInstantFix = async () => {
    if (!findingDetails) return;

    setLoading(true);
    setShowQuickActions(false);

    const fixQuestion = `Fix this ${findingDetails.impact} severity "${findingDetails.type}" issue: ${findingDetails.description}`;

    try {
      const res = await fetch('/api/ai-free', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          analysis_id: analysisId,
          audit_results: auditResults,
          user_question: fixQuestion,
          query_type: 'quick_fix',  // Tell backend this is instant fix
        }),
      });

      const data = await res.json();

      if (data.success) {
        const newHistory = [
          ...conversationHistory,
          { question: fixQuestion, response: data.response, isPaid: false, queryType: 'quick_fix' },
        ];
        setConversationHistory(newHistory);
        setResponse(data.response);

        const newRemaining = freeQueriesLeft - 1;
        setFreeQueriesLeft(newRemaining);
        localStorage.setItem(
          `ai_queries_${analysisId}`,
          JSON.stringify({ remaining: newRemaining, history: newHistory })
        );
      } else {
        setResponse('Error: ' + (data.detail || data.error || 'Unknown error'));
      }
    } catch (error) {
      setResponse(`Failed to generate fix: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  // Handle quick action buttons
  const handleQuickAction = async (actionType: string, questionText: string) => {
    setLoading(true);
    setShowQuickActions(false);
    setResponse('');

    try {
      const res = await fetch('/api/ai-free', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          analysis_id: analysisId,
          audit_results: auditResults,
          user_question: questionText,
          query_type: actionType,
        }),
      });

      const data = await res.json();

      if (data.success) {
        const newHistory = [
          ...conversationHistory,
          { question: questionText, response: data.response, isPaid: false, queryType: actionType },
        ];
        setConversationHistory(newHistory);
        setResponse(data.response);

        const newRemaining = freeQueriesLeft - 1;
        setFreeQueriesLeft(newRemaining);
        localStorage.setItem(
          `ai_queries_${analysisId}`,
          JSON.stringify({ remaining: newRemaining, history: newHistory })
        );
      } else {
        setResponse('Error: ' + (data.detail || data.error || 'Unknown error'));
      }
    } catch (error) {
      setResponse(`Failed to get AI response: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const handleFreeQuestion = async () => {
    if (!question.trim() || freeQueriesLeft <= 0) return;

    setLoading(true);
    setResponse('');
    setShowQuickActions(false);

    try {
      const res = await fetch('/api/ai-free', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          analysis_id: analysisId,
          audit_results: auditResults,
          user_question: question,
          query_type: 'general',
        }),
      });

      const data = await res.json();

      if (data.success) {
        const newHistory = [
          ...conversationHistory,
          { question, response: data.response, isPaid: false },
        ];
        setConversationHistory(newHistory);
        setResponse(data.response);

        const newRemaining = freeQueriesLeft - 1;
        setFreeQueriesLeft(newRemaining);
        localStorage.setItem(
          `ai_queries_${analysisId}`,
          JSON.stringify({ remaining: newRemaining, history: newHistory })
        );

        setQuestion('');
      } else {
        setResponse('Error: ' + (data.detail || data.error || 'Unknown error'));
      }
    } catch (error) {
      setResponse(`Failed to get AI response: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const handlePaidQuestion = async () => {
    if (!question.trim()) return;
    if (!isConnected || !address) {
      setShowPaymentPrompt(true);
      return;
    }

    setPaymentProcessing(true);
    setLoading(true);
    setResponse('');
    setShowPaymentPrompt(false);
    setShowQuickActions(false);

    try {
      // // Dynamic import of x402
      // const { wrapFetchWithPayment } = await import('x402-fetch');
      
      // // Create payment-wrapped fetch
      // const fetchWithPayment = wrapFetchWithPayment(fetch, walletClient as any);

      // // Make paid request
      // const res = await fetchWithPayment('https://api.hexific.com/ai-assist', {
      
      // Create payment message
      const paymentMessage = `Pay $0.10 for AI query on Hexific\nTimestamp: ${Date.now()}\nAddress: ${address}`;

      // Sign message as payment proof
      const signature = await signMessageAsync({
        message: paymentMessage,
      });

      // Make paid request to Next.js API
      const res = await fetch('/api/ai-paid', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          analysis_id: analysisId,
          audit_results: auditResults,
          user_question: question,
          query_type: 'general',
          payment_signature: signature,
          signer_address: address,
        }),
      });

      const data = await res.json();

      if (data.success) {
        const newHistory = [
          ...conversationHistory,
          { question, response: data.response, isPaid: true },
        ];
        setConversationHistory(newHistory);
        setResponse(data.response);
        setQuestion('');

        // Update localStorage with paid query
        const stored = localStorage.getItem(`ai_queries_${analysisId}`);
        if (stored) {
          const parsedData = JSON.parse(stored);
          localStorage.setItem(
            `ai_queries_${analysisId}`,
            JSON.stringify({ ...parsedData, history: newHistory })
          );
        }
      } else {
        setResponse('Error: ' + (data.detail || data.error || 'Payment or query failed'));
      }
    } catch (error) {
      const walletError = error as WalletError;
      if (walletError.message?.includes('User rejected')) {
        setResponse('Payment cancelled. Please approve the signature to continue.');
      } else {
        setResponse(
          `Payment failed: ${walletError.message || 'Please try again or ensure you have funds on Base Sepolia'}`
        );
      }
    } finally {
      setLoading(false);
      setPaymentProcessing(false);
    }
  };

  const handleAskQuestion = () => {
    if (freeQueriesLeft > 0) {
      handleFreeQuestion();
    } else {
      handlePaidQuestion();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass-effect border border-lime-400/30 rounded-2xl max-w-3xl w-full max-h-[80vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-lime-400/20 flex justify-between items-center bg-gradient-to-r from-lime-400/10 to-transparent">
          <div>
            <h2 className="text-2xl font-bold gradient-text">AI Audit Assistant</h2>
            <h2 className="text-2xl font-bold">
              {mode === 'instant_fix' ? '🔧 Generating Fix...' : '🤖 AI Audit Assistant'}
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              {freeQueriesLeft > 0 ? (
                <>
                  <span className="text-lime-400 font-semibold">
                    {freeQueriesLeft} free queries remaining
                  </span>
                  <span className="text-gray-500"> · After that $0.10 per query</span>
                </>
              ) : (
                <span className="text-orange-400 font-semibold">
                  $0.10 per query (sign with wallet)
                </span>
              )}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-lime-400 text-3xl transition-colors"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#000E1B]">
          {/* Quick Actions (only in quick_actions mode) */}
          {showQuickActions && mode === 'quick_actions' && (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <p className="text-lg text-gray-700 mb-2">What would you like to know?</p>
                <p className="text-sm text-gray-500">Choose a quick action or ask a custom question</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <button
                  onClick={() => handleQuickAction('explain_all_high', 'Explain all high severity issues')}
                  className="bg-red-50 hover:bg-red-100 border-2 border-red-200 rounded-lg p-4 text-left transition-all"
                >
                  <div className="text-2xl mb-2">🔍</div>
                  <div className="font-semibold text-red-900">Explain High Severity</div>
                  <div className="text-sm text-red-700 mt-1">Get details on critical issues</div>
                </button>

                {/* <button
                  onClick={() => handleQuickAction('prioritize', 'What should I fix first?')}
                  className="bg-orange-50 hover:bg-orange-100 border-2 border-orange-200 rounded-lg p-4 text-left transition-all"
                >
                  <div className="text-2xl mb-2">⚠️</div>
                  <div className="font-semibold text-orange-900">Priority Order</div>
                  <div className="text-sm text-orange-700 mt-1">Which issues to fix first</div>
                </button> */}

                {/* <button
                  onClick={() => handleQuickAction('best_practices', 'Compare my code to best practices')}
                  className="bg-blue-50 hover:bg-blue-100 border-2 border-blue-200 rounded-lg p-4 text-left transition-all"
                >
                  <div className="text-2xl mb-2">📊</div>
                  <div className="font-semibold text-blue-900">Best Practices</div>
                  <div className="text-sm text-blue-700 mt-1">How your code compares</div>
                </button> */}

                <button
                  onClick={() => handleQuickAction('teach', 'Teach me about these vulnerabilities')}
                  className="bg-purple-50 hover:bg-purple-100 border-2 border-purple-200 rounded-lg p-4 text-left transition-all"
                >
                  <div className="text-2xl mb-2">🎓</div>
                  <div className="font-semibold text-purple-900">Learn Security</div>
                  <div className="text-sm text-purple-700 mt-1">Understand vulnerabilities</div>
                </button>
              </div>

              <button
                onClick={() => {
                  setShowQuickActions(false);
                  setShowCustomInput(true);
                }}
                className="w-full bg-gray-100 hover:bg-gray-200 border-2 border-gray-300 rounded-lg p-4 text-center transition-all"
              >
                <div className="font-semibold text-gray-900">💬 Ask Custom Question</div>
                <div className="text-sm text-gray-600 mt-1">Type your own question</div>
              </button>
            </div>
          )}

          {/* Conversation History */}
          {conversationHistory.length === 0 && !response && (
            <div className="text-center text-gray-400 py-8">
              <svg
                className="mx-auto h-12 w-12 text-lime-400/50 mb-3"
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
              <p className="text-lg font-medium text-white mb-2">Ask me anything about your audit results</p>
              <p className="text-sm text-gray-500">
                Examples: &quot;Explain the high severity findings&quot; or &quot;How do I fix the reentrancy issue?&quot;
              </p>
            </div>
          )}

          {conversationHistory.map((item, idx) => (
            <div key={idx} className="space-y-3 slide-up">
              {/* Question */}
              <div className="flex justify-end">
                <div className="bg-lime-400 text-black rounded-lg px-4 py-3 max-w-[80%] shadow-lg">
                  <p className="text-xs font-semibold mb-1 opacity-80">You asked {item.isPaid && '💳 (Paid)'}:</p>
                  <p className="font-medium">{item.question}</p>
                </div>
              </div>

              {/* Response */}
              <div className="flex justify-start">
                <div className="glass-effect border border-lime-400/20 rounded-lg px-4 py-3 max-w-[80%]">
                  <div className="flex items-center mb-2">
                    <svg className="w-4 h-4 text-lime-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <p className="text-xs font-semibold text-lime-400">AI Response:</p>
                  </div>
                  
                  {/* Parse and render response parts */}
                  <div className="space-y-3">
                    {parseAIResponse(item.response).map((part, partIdx) => (
                      <div key={partIdx}>
                        {part.type === 'text' ? (
                          <p className="text-gray-200 whitespace-pre-wrap leading-relaxed">{part.content}</p>
                        ) : (
                          <CodeBlock code={part.content} language={part.language} />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Current Response Loading/Display */}
          {loading && (
            <div className="flex justify-start">
              <div className="glass-effect border border-lime-400/20 rounded-lg px-4 py-3">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin h-4 w-4 border-2 border-lime-400 border-t-transparent rounded-full"></div>
                  <span className="text-gray-300">
                    {paymentProcessing ? 'Processing payment...' : 'AI is thinking...'}
                    </span>
                </div>
              </div>
            </div>
          )}

          {/* {response && !loading && (
            <div className="flex justify-start slide-up">
              <div className="glass-effect border border-lime-400/20 rounded-lg px-4 py-3 max-w-[80%]">
                <div className="flex items-center mb-2">
                  <svg className="w-4 h-4 text-lime-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <p className="text-xs font-semibold text-lime-400">AI Response:</p>
                </div>
                <p className="text-gray-200 whitespace-pre-wrap leading-relaxed">{response}</p>
              </div>
            </div>
          )} */}

          {/* Payment Prompt */}
          {showPaymentPrompt && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-yellow-800 font-semibold mb-2">
                Connect Wallet to Continue
              </p>
              <p className="text-yellow-700 text-sm mb-3">
                Connect your wallet to make paid queries. You&apos;ll sign a message to prove payment (no gas fees for signature).
              </p>
              <div className="flex justify-center">
                <ConnectButton.Custom>
                  {({
                    account,
                    chain,
                    openAccountModal,
                    openChainModal,
                    openConnectModal,
                    mounted,
                  }) => {
                    const ready = mounted;
                    const connected = ready && account && chain;

                    return (
                      <div
                        {...(!ready && {
                          'aria-hidden': true,
                          'style': {
                            opacity: 0,
                            pointerEvents: 'none',
                            userSelect: 'none',
                          },
                        })}
                      >
                        {(() => {
                          if (!connected) {
                            return (
                              <button
                                onClick={openConnectModal}
                                className="px-6 py-3 bg-lime-400 text-black rounded-lg font-semibold hover:bg-lime-300 pulse-glow transition-all"
                              >
                                Connect Wallet
                              </button>
                            );
                          }

                          return (
                            <div className="flex gap-2">
                              <button
                                onClick={openChainModal}
                                className="px-4 py-2 bg-black/50 text-lime-400 border border-lime-400/30 rounded-lg hover:border-lime-400 transition-all"
                              >
                                {chain.hasIcon && chain.iconUrl && (
                                  <img
                                    alt={chain.name ?? 'Chain icon'}
                                    src={chain.iconUrl}
                                    className="w-5 h-5 inline mr-2"
                                  />
                                )}
                                {chain.name}
                              </button>

                              <button
                                onClick={openAccountModal}
                                className="px-4 py-2 bg-lime-400 text-black rounded-lg font-semibold hover:bg-lime-300 transition-all"
                              >
                                {account.displayName}
                              </button>
                            </div>
                          );
                        })()}
                      </div>
                    );
                  }}
                </ConnectButton.Custom>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-6 border-t border-lime-400/20 bg-gradient-to-t from-lime-400/5 to-transparent">
          {(freeQueriesLeft <= 0) && (
            <div className="mb-4 flex justify-center">
              <ConnectButton.Custom>
                  {({
                    account,
                    chain,
                    openAccountModal,
                    openChainModal,
                    openConnectModal,
                    mounted,
                  }) => {
                    const ready = mounted;
                    const connected = ready && account && chain;

                    return (
                      <div
                        {...(!ready && {
                          'aria-hidden': true,
                          'style': {
                            opacity: 0,
                            pointerEvents: 'none',
                            userSelect: 'none',
                          },
                        })}
                      >
                        {(() => {
                          if (!connected) {
                            return (
                              <button
                                onClick={openConnectModal}
                                className="px-6 py-3 bg-lime-400 text-black rounded-lg font-semibold hover:bg-lime-300 pulse-glow transition-all"
                              >
                                Connect Wallet
                              </button>
                            );
                          }

                          return (
                            <div className="flex gap-2">
                              <button
                                onClick={openChainModal}
                                className="px-4 py-2 bg-black/50 text-lime-400 border border-lime-400/30 rounded-lg hover:border-lime-400 transition-all"
                              >
                                {chain.hasIcon && chain.iconUrl && (
                                  <img
                                    alt={chain.name ?? 'Chain icon'}
                                    src={chain.iconUrl}
                                    className="w-5 h-5 inline mr-2"
                                  />
                                )}
                                {chain.name}
                              </button>

                              <button
                                onClick={openAccountModal}
                                className="px-4 py-2 bg-lime-400 text-black rounded-lg font-semibold hover:bg-lime-300 transition-all"
                              >
                                {account.displayName}
                              </button>
                            </div>
                          );
                        })()}
                      </div>
                    );
                  }}
                </ConnectButton.Custom>
            </div>
          )}
          
          <div className="flex space-x-3">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !loading && handleAskQuestion()}
              placeholder="Ask about your audit results..."
              className="flex-1 px-4 py-3 bg-black/50 text-white border border-lime-400/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent placeholder-gray-500 transition-all"
              disabled={loading}
            />
            <button
              onClick={handleAskQuestion}
              disabled={loading || !question.trim()}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                loading || !question.trim()
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  : 'bg-lime-400 text-black hover:bg-lime-300 pulse-glow'
              }`}
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Asking...
                </span>
              ) : freeQueriesLeft > 0 ? (
                'Ask (Free)'
              ) : isConnected ? (
                'Pay & Ask'
              ) : (
                'Connect'
              )}
            </button>
          </div>
          <div className="flex items-center mt-3 text-xs text-gray-400">
            <svg className="w-4 h-4 text-lime-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <span>
              {showQuickActions && mode === 'quick_actions' 
                ? '💡 Choose a quick action above or ask a custom question'
                : freeQueriesLeft > 0
                  ? 'Tip: Ask specific questions about findings, severity, or how to fix issues'
                  : 'Paid queries: Sign message to verify payment (no gas fees)'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
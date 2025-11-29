'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import FreeAuditUpload from '@/components/FreeAuditUpload';

export default function Page() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [countersStarted, setCountersStarted] = useState(false);
  const [hexiPrice, setHexiPrice] = useState<number | null>(null);
  const [priceChange24h, setPriceChange24h] = useState<number | null>(null);

  // Matrix animation for background
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const matrixChars = '01アイウエオ…ワヲン';
    const fontSize = 14;
    const columns = Math.floor(canvas.width / fontSize);
    const drops = Array(columns).fill(1);

    const drawMatrix = () => {
      ctx.fillStyle = 'rgba(0, 14, 27, 0.04)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#D6ED17';
      ctx.font = fontSize + 'px monospace';

      for (let i = 0; i < drops.length; i++) {
        const text = matrixChars[Math.floor(Math.random() * matrixChars.length)];
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    };

    const interval = setInterval(drawMatrix, 100);
    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', resize);
    };
  }, []);

  // Animate stats counters
  useEffect(() => {
    if (countersStarted) return;

    const animateCounters = () => {
      setCountersStarted(true);
      const counters = [
        { id: 'contracts-audited', target: 500, suffix: '+' },
        { id: 'vulnerabilities', target: 2847, suffix: '' },
        { id: 'saved-funds', target: 50, suffix: 'M+' },
        { id: 'response-time', target: 24, suffix: 'h' }
      ];
      counters.forEach(({ id, target, suffix }) => {
        const el = document.getElementById(id);
        if (!el) return;
        let current = 0;
        const increment = target / 50;
        const timer = setInterval(() => {
          current += increment;
          if (current >= target) {
            current = target;
            clearInterval(timer);
          }
          el.textContent = id === 'saved-funds'
            ? '$' + Math.floor(current) + suffix
            : Math.floor(current) + suffix;
        }, 50);
      });
    };

    const slideObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && entry.target.id === 'contracts-audited') {
          animateCounters();
          observer.disconnect(); // stop after first trigger
        }
        if (entry.isIntersecting) {
          entry.target.classList.add('slide-up');
        }
      });
    }, { threshold: 0.3 });

    document
      .querySelectorAll<HTMLElement>('.feature-card, #contracts-audited')
      .forEach(el => {
        slideObserver.observe(el);
      });

    return () => slideObserver.disconnect();
  }, [countersStarted]);

  // Progress bars animation
  useEffect(() => {
    const processSection = document.getElementById('process');
    if (!processSection) return;
    let progressStarted = false;
    const processObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !progressStarted) {
          progressStarted = true; // prevent re-run

          document.querySelectorAll<HTMLElement>('.audit-progress').forEach(bar => {
            // Set background color
            bar.style.backgroundColor = 'rgb(55, 65, 81)'; // bg-gray-700 equivalent

            // Add smooth transition
            bar.style.transition = 'all 1.5s ease-in-out';

            const prog = bar.style.getPropertyValue('--progress') || '0%';
            bar.style.setProperty('--progress', '0%');
            setTimeout(() => {
              bar.style.setProperty('--progress', prog);
            }, 500);
          });
          processObserver.disconnect(); // stop observing after first trigger
        }
      });
    }, { threshold: 0.3 });

    processObserver.observe(processSection);

    return () => processObserver.disconnect();
  }, []);

  // Fetch HEXI price every 30 seconds
  useEffect(() => {
    const fetchHexiPrice = async () => {
      try {
        const response = await fetch(
          'https://api.dexscreener.com/latest/dex/tokens/3ghjaogpDVt7QZ6eNauoggmj4WYw23TkpyVN2yZjpump'
        );
        const data = await response.json();
        
        if (data.pairs && data.pairs.length > 0) {
          const pair = data.pairs[0];
          setHexiPrice(parseFloat(pair.priceUsd));
          setPriceChange24h(parseFloat(pair.priceChange.h24));
        }
      } catch (error) {
        console.error('Failed to fetch HEXI price:', error);
      }
    };
    
    fetchHexiPrice();
    const interval = setInterval(fetchHexiPrice, 30000);
    return () => clearInterval(interval);
  }, []);

  // Hover & click effects (feature-card, all buttons, mobile menu)
  useEffect(() => {
    // feature-card hover
    const cards = document.querySelectorAll<HTMLElement>('.feature-card');
    const enterCard = function (this: HTMLElement) {
      this.style.transform = 'translateY(-10px) scale(1.02)';
      this.style.boxShadow = '0 20px 40px rgba(214, 237, 23, 0.2)';
    };
    const leaveCard = function (this: HTMLElement) {
      this.style.transform = 'translateY(0) scale(1)';
      this.style.boxShadow = 'none';
    };
    cards.forEach(c => {
      c.addEventListener('mouseenter', enterCard);
      c.addEventListener('mouseleave', leaveCard);
    });

    // button hover & click
    const buttons = document.querySelectorAll<HTMLElement>('button');
    const scaleUp = function (this: HTMLElement) { this.style.transform = 'scale(1.05)'; };
    const scaleDown = function (this: HTMLElement) { this.style.transform = 'scale(1)'; };
    const onClick = function (this: HTMLElement) {
      const txt = this.textContent || '';
      if (txt.includes('Upload') || txt.includes('Schedule')) {
        const orig = this.textContent!;
        this.textContent = 'Loading...';
        this.setAttribute('disabled', 'true');
        setTimeout(() => {
          this.textContent = orig;
          this.removeAttribute('disabled');
        }, 2000);
      }
    };
    buttons.forEach(b => {
      b.addEventListener('mouseenter', scaleUp);
      b.addEventListener('mouseleave', scaleDown);
      b.addEventListener('click', onClick);
    });

    // mobile menu toggle
    const mobileBtn = document.querySelector<HTMLElement>('.md\\:hidden');
    if (mobileBtn) {
      const mobileMenu = document.createElement('div');
      mobileMenu.className = 'md:hidden absolute top-full left-0 w-full bg-[#000E1B]/85 border-t border-lime-400/20 p-6 space-y-4 hidden';
      mobileMenu.innerHTML = `
        <a href="#features" class="block hover:text-lime-400 transition-colors">Features</a>
        <a href="#process" class="block hover:text-lime-400 transition-colors">Process</a>
        <a href="/docs" class="block hover:text-lime-400 transition-colors">Docs</a>
        <a href="#contact" class="block bg-lime-400 text-black px-6 py-2 rounded-lg hover:bg-lime-300 transition-colors font-semibold text-center">Get Audit</a>
      `;
      mobileBtn.parentElement?.appendChild(mobileMenu);
      mobileBtn.addEventListener('click', () => mobileMenu.classList.toggle('hidden'));
      mobileMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => mobileMenu.classList.add('hidden'));
      });
    }

    return () => {
      cards.forEach(c => {
        c.removeEventListener('mouseenter', enterCard);
        c.removeEventListener('mouseleave', leaveCard);
      });
      buttons.forEach(b => {
        b.removeEventListener('mouseenter', scaleUp);
        b.removeEventListener('mouseleave', scaleDown);
        b.removeEventListener('click', onClick);
      });
    };
  }, []);

  const handleClick = () => {
    window.location.href = "mailto:admin@hexific.com?subject=Schedule%20Consultation&body=Hi%20there,%0A%0AI'd%20like%20to%20schedule%20a%20consultation%20to%20discuss%20my%20smart%20contract%20audit%20needs.%0APlease%20let%20me%20know%20your%20availability.%0A%0AThank%20you!";
  };

  const scrollDown = () => {
    const element = document.getElementById('free-audit-upload');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div>
      <meta charSet="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Smart Contract Audit | HEXIFIC</title>
      <style dangerouslySetInnerHTML={{ __html: "\n        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');\n        \n        * {\n            font-family: 'Inter', sans-serif;\n        }\n        \n        html {\n            scroll-behavior: smooth;\n        }\n        \n        body {\n            background: #000E1B;\n            color: white;\n            overflow-x: hidden;\n        }\n        \n        .gradient-text {\n            background: linear-gradient(135deg, #D6ED17, #ffffff);\n            -webkit-background-clip: text;\n            -webkit-text-fill-color: transparent;\n            background-clip: text;\n        }\n        \n        .glass-effect {\n            background: rgba(214, 237, 23, 0.1);\n            backdrop-filter: blur(20px);\n            border: 1px solid rgba(214, 237, 23, 0.2);\n        }\n        \n        .feature-card:hover {\n            transform: translateY(-10px);\n            transition: all 0.3s ease;\n        }\n        \n        .cyber-grid {\n            background-image: \n                linear-gradient(rgba(214, 237, 23, 0.1) 1px, transparent 1px),\n                linear-gradient(90deg, rgba(214, 237, 23, 0.1) 1px, transparent 1px);\n            background-size: 50px 50px;\n            animation: grid-move 20s linear infinite;\n        }\n        \n        @keyframes grid-move {\n            0% { transform: translate(0, 0); }\n            100% { transform: translate(50px, 50px); }\n        }\n        \n        .floating-orbs::after {\n            content: '';\n            position: absolute;\n            width: 200px;\n            height: 200px;\n            background: radial-gradient(circle, rgba(214, 237, 23, 0.3) 0%, transparent 70%);\n            border-radius: 50%;\n            top: 20%;\n            right: 10%;\n            animation: float 8s ease-in-out infinite;\n            z-index: -1;\n        }\n        \n        .floating-orbs::before {\n            content: '';\n            position: absolute;\n            width: 150px;\n            height: 150px;\n            background: radial-gradient(circle, rgba(214, 237, 23, 0.2) 0%, transparent 70%);\n            border-radius: 50%;\n            bottom: 30%;\n            left: 15%;\n            animation: float 6s ease-in-out infinite reverse;\n            z-index: -1;\n        }\n        \n        @keyframes float {\n            0%, 100% { transform: translateY(0px) rotate(0deg); }\n            50% { transform: translateY(-30px) rotate(180deg); }\n        }\n        \n        .pulse-glow {\n            animation: pulse-glow 2s ease-in-out infinite;\n        }\n        \n        @keyframes pulse-glow {\n            0%, 100% { box-shadow: 0 0 20px rgba(214, 237, 23, 0.3); }\n            50% { box-shadow: 0 0 40px rgba(214, 237, 23, 0.6); }\n        }\n        \n        .slide-up {\n            animation: slide-up 0.8s ease-out forwards;\n        }\n        \n        @keyframes slide-up {\n            from { opacity: 0; transform: translateY(50px); }\n            to { opacity: 1; transform: translateY(0); }\n        }\n        \n        .code-pattern {\n            background: linear-gradient(45deg, transparent 49%, rgba(214, 237, 23, 0.1) 50%, transparent 51%);\n            background-size: 20px 20px;\n        }\n        \n        .neon-border {\n            border: 2px solid #D6ED17;\n            box-shadow: 0 0 20px rgba(214, 237, 23, 0.5), inset 0 0 20px rgba(214, 237, 23, 0.1);\n        }\n        \n        .scan-line {\n            position: relative;\n            overflow: hidden;\n        }\n        \n        .scan-line::after {\n            content: '';\n            position: absolute;\n            top: 0;\n            left: -100%;\n            width: 100%;\n            height: 100%;\n            background: linear-gradient(90deg, transparent, rgba(214, 237, 23, 0.3), transparent);\n            animation: scan 3s ease-in-out infinite;\n        }\n        \n        @keyframes scan {\n            0% { left: -100%; }\n            100% { left: 100%; }\n        }\n        \n        .matrix-bg {\n            position: fixed;\n            top: 0;\n            left: 0;\n            width: 100%;\n            height: 100%;\n            pointer-events: none;\n            z-index: -2;\n            opacity: 0.1;\n        }\n        \n        .audit-progress {\n            background: linear-gradient(90deg, #D6ED17 var(--progress, 0%), transparent var(--progress, 0%));\n            transition: all 0.3s ease;\n        }\n    " }} />
      {/* Matrix Background */}
      <div className="matrix-bg">
        <canvas ref={canvasRef} className="w-full h-full" />
      </div>
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 glass-effect border-b border-lime-400/20">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-lime-400 rounded-lg flex items-center justify-center">
                <Image src="./logo.svg" alt="Hexific Logo" width={24} height={24} />
                {/* <img src="/logo.svg" alt="My Logo" className="w-6 h-6" /> */}
              </div>
              <span className="text-2xl font-bold gradient-text">Hexific</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="hover:text-lime-400 transition-colors">Features</a>
              <a href="#process" className="hover:text-lime-400 transition-colors">Process</a>
              {/* <a href="#pricing" className="hover:text-lime-400 transition-colors">Pricing</a> */}
              <Link href="/docs" className="hover:text-lime-400 transition-colors">
                Docs
              </Link>
              <a href="#contact" className="bg-lime-400 text-black px-6 py-2 rounded-lg hover:bg-lime-300 transition-colors font-semibold">Get Audit</a>
            </div>
            <button className="md:hidden text-lime-400">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </nav>
      {/* HEXI Price Tag */}
      <a
        href="https://dexscreener.com/solana/3ghjaogpDVt7QZ6eNauoggmj4WYw23TkpyVN2yZjpump"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 glass-effect border border-lime-400/30 rounded-2xl p-4 hover:border-lime-400 transition-all hover:scale-105 pulse-glow group"
      >
        {hexiPrice !== null ? (
          <div className="flex flex-col items-center">
          <span className="text-sm font-semibold">HEXI Price</span>
            <span className="text-lg font-bold gradient-text">
            ${hexiPrice < 0.0001 
              ? `0.0₄${hexiPrice.toFixed(8).replace(/^0\.0+/, '')}` 
              : hexiPrice.toFixed(4)}
            </span>
          {priceChange24h !== null && (
            <span className={`text-sm font-medium ${priceChange24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {priceChange24h >= 0 ? '+' : ''}{priceChange24h.toFixed(2)}% (24h)
            </span>
          )}
          </div>
        ) : (
          <span className="text-sm font-medium">Loading...</span> 
        )}
      </a>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center floating-orbs cyber-grid">
        <div className="max-w-7xl mx-auto px-6 py-20 text-center">
          <div className="slide-up">
            <h1 className="text-5xl md:text-7xl font-black mb-6">
              <span className="gradient-text">Bulletproof</span><br />
              Smart Contract Audits
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Advanced AI-powered security analysis combined with expert manual review.
              Protect your DeFi protocol from exploits before they happen.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <button 
              onClick={() => {
                document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="bg-lime-400 text-black px-8 py-4 rounded-lg text-lg font-bold hover:bg-lime-300 transition-all pulse-glow cursor-pointer">
                Start Free Audit
              </button>
              <button
              onClick={() => window.open("https://github.com/Hexific/audit-reports", "_blank")}
              className="glass-effect px-8 py-4 rounded-lg text-lg font-semibold hover:bg-lime-400/20 transition-all cursor-pointer">
                View Sample Report
              </button>
            </div>
            {/* Live Stats */}
            {/* adjusted to 2 columns for temporary */}
            <div className="grid grid-cols-2 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {/* <div className="glass-effect rounded-xl p-6 scan-line">
                <div className="text-3xl font-bold gradient-text mb-2" id="contracts-audited">500+</div>
                <div className="text-gray-400">Contracts Audited</div>
              </div> */}
              <div className="glass-effect rounded-xl p-6 scan-line">
                <div className="text-3xl font-bold gradient-text mb-2" id="vulnerabilities">40+</div>
                <div className="text-gray-400">Vulnerabilities Found</div>
              </div>
              {/* <div className="glass-effect rounded-xl p-6 scan-line">
                <div className="text-3xl font-bold gradient-text mb-2" id="saved-funds">$50M+</div>
                <div className="text-gray-400">Funds Protected</div>
              </div> */}
              <div className="glass-effect rounded-xl p-6 scan-line">
                <div className="text-3xl font-bold gradient-text mb-2" id="response-time">24h</div>
                <div className="text-gray-400">Avg Response</div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Features Section */}
      <section id="features" className="py-20 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-bold gradient-text mb-6">Next-Gen Security</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Our platform combines cutting-edge AI analysis with expert human review to catch vulnerabilities others miss.
            </p>
          </div>
          {/* adjusted to 2 columns for temporary */}
          <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8">
            {/* AI-Powered Analysis */}
            <div className="feature-card glass-effect rounded-2xl p-8 group cursor-pointer">
              <div className="w-16 h-16 bg-lime-400/20 rounded-xl flex items-center justify-center mb-6 group-hover:bg-lime-400/30 transition-colors">
                <svg className="w-8 h-8 text-lime-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-4">AI-Powered Analysis</h3>
              <p className="text-gray-300 mb-4">Advanced machine learning models trained on thousands of smart contracts detect complex vulnerabilities in seconds.</p>
              <div className="space-y-2">
                <div className="flex items-center text-sm">
                  <div className="w-2 h-2 bg-lime-400 rounded-full mr-3" />
                  <span>Reentrancy Detection</span>
                </div>
                <div className="flex items-center text-sm">
                  <div className="w-2 h-2 bg-lime-400 rounded-full mr-3" />
                  <span>Integer Overflow/Underflow</span>
                </div>
                <div className="flex items-center text-sm">
                  <div className="w-2 h-2 bg-lime-400 rounded-full mr-3" />
                  <span>Access Control Issues</span>
                </div>
              </div>
            </div>
            {/* Expert Manual Review */}
            <div className="feature-card glass-effect rounded-2xl p-8 group cursor-pointer">
              <div className="w-16 h-16 bg-lime-400/20 rounded-xl flex items-center justify-center mb-6 group-hover:bg-lime-400/30 transition-colors">
                <svg className="w-8 h-8 text-lime-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-4">Expert Manual Review</h3>
              <p className="text-gray-300 mb-4">Senior security engineers with 5+ years DeFi experience manually review every line of code.</p>
              <div className="space-y-2">
                <div className="flex items-center text-sm">
                  <div className="w-2 h-2 bg-lime-400 rounded-full mr-3" />
                  <span>Business Logic Validation</span>
                </div>
                <div className="flex items-center text-sm">
                  <div className="w-2 h-2 bg-lime-400 rounded-full mr-3" />
                  <span>Economic Attack Vectors</span>
                </div>
                <div className="flex items-center text-sm">
                  <div className="w-2 h-2 bg-lime-400 rounded-full mr-3" />
                  <span>Governance Vulnerabilities</span>
                </div>
              </div>
            </div>
            {/* Real-time Dashboard */}
            <div className="feature-card glass-effect rounded-2xl p-8 group cursor-pointer">
              <div className="w-16 h-16 bg-lime-400/20 rounded-xl flex items-center justify-center mb-6 group-hover:bg-lime-400/30 transition-colors">
                <svg className="w-8 h-8 text-lime-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 00-2-2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-4">Real-time Dashboard</h3>
              <p className="text-gray-300 mb-4">Track audit progress, view findings, and collaborate with our team through an intuitive dashboard.</p>
              <div className="space-y-2">
                <div className="flex items-center text-sm">
                  <div className="w-2 h-2 bg-lime-400 rounded-full mr-3" />
                  <span>Live Progress Tracking</span>
                </div>
                <div className="flex items-center text-sm">
                  <div className="w-2 h-2 bg-lime-400 rounded-full mr-3" />
                  <span>Interactive Reports</span>
                </div>
                <div className="flex items-center text-sm">
                  <div className="w-2 h-2 bg-lime-400 rounded-full mr-3" />
                  <span>Team Collaboration</span>
                </div>
              </div>
            </div>
            {/* Continuous Monitoring */}
            {/* <div className="feature-card glass-effect rounded-2xl p-8 group cursor-pointer">
              <div className="w-16 h-16 bg-lime-400/20 rounded-xl flex items-center justify-center mb-6 group-hover:bg-lime-400/30 transition-colors">
                <svg className="w-8 h-8 text-lime-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-4">Continuous Monitoring</h3>
              <p className="text-gray-300 mb-4">24/7 monitoring of your deployed contracts with instant alerts for suspicious activities or new vulnerabilities.</p>
              <div className="space-y-2">
                <div className="flex items-center text-sm">
                  <div className="w-2 h-2 bg-lime-400 rounded-full mr-3" />
                  <span>Transaction Monitoring</span>
                </div>
                <div className="flex items-center text-sm">
                  <div className="w-2 h-2 bg-lime-400 rounded-full mr-3" />
                  <span>Anomaly Detection</span>
                </div>
                <div className="flex items-center text-sm">
                  <div className="w-2 h-2 bg-lime-400 rounded-full mr-3" />
                  <span>Instant Alerts</span>
                </div>
              </div>
            </div> */}
            {/* Compliance Reports */}
            <div className="feature-card glass-effect rounded-2xl p-8 group cursor-pointer">
              <div className="w-16 h-16 bg-lime-400/20 rounded-xl flex items-center justify-center mb-6 group-hover:bg-lime-400/30 transition-colors">
                <svg className="w-8 h-8 text-lime-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-4">Compliance Reports</h3>
              <p className="text-gray-300 mb-4">Comprehensive audit reports that meet industry standards and regulatory requirements for institutional clients.</p>
              <div className="space-y-2">
                <div className="flex items-center text-sm">
                  <div className="w-2 h-2 bg-lime-400 rounded-full mr-3" />
                  <span>PDF &amp; JSON Formats</span>
                </div>
                <div className="flex items-center text-sm">
                  <div className="w-2 h-2 bg-lime-400 rounded-full mr-3" />
                  <span>Executive Summaries</span>
                </div>
                <div className="flex items-center text-sm">
                  <div className="w-2 h-2 bg-lime-400 rounded-full mr-3" />
                  <span>Remediation Guidelines</span>
                </div>
              </div>
            </div>
            {/* Emergency Response */}
            {/* <div className="feature-card glass-effect rounded-2xl p-8 group cursor-pointer">
              <div className="w-16 h-16 bg-lime-400/20 rounded-xl flex items-center justify-center mb-6 group-hover:bg-lime-400/30 transition-colors">
                <svg className="w-8 h-8 text-lime-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-4">Emergency Response</h3>
              <p className="text-gray-300 mb-4">24/7 emergency response team for critical vulnerabilities with incident response and damage mitigation.</p>
              <div className="space-y-2">
                <div className="flex items-center text-sm">
                  <div className="w-2 h-2 bg-lime-400 rounded-full mr-3" />
                  <span>&lt; 1 Hour Response</span>
                </div>
                <div className="flex items-center text-sm">
                  <div className="w-2 h-2 bg-lime-400 rounded-full mr-3" />
                  <span>Incident Management</span>
                </div>
                <div className="flex items-center text-sm">
                  <div className="w-2 h-2 bg-lime-400 rounded-full mr-3" />
                  <span>Post-Incident Analysis</span>
                </div>
              </div>
            </div> */}
          </div>
        </div>
      </section>
      {/* Audit Process Section */}
      <section id="process" className="py-20 code-pattern">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-bold gradient-text mb-6">Audit Process</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Our streamlined process delivers comprehensive security analysis in record time.
            </p>
          </div>
          <div className="relative">
            {/* Process Steps */}
            <div className="space-y-12">
              {/* Step 1 */}
              <div className="flex items-center gap-8">
                <div className="flex-shrink-0 w-16 h-16 neon-border rounded-full flex items-center justify-center text-2xl font-bold">1</div>
                <div className="glass-effect rounded-2xl p-8 flex-1">
                  <h3 className="text-2xl font-bold mb-4">Contract Submission</h3>
                  <p className="text-gray-300 mb-4">Upload your smart contracts through our secure platform. We support Solidity, Vyper, and other major languages.</p>
                  <div className="audit-progress bg-gray-700 rounded-full h-2" style={{ '--progress': '15%' } as React.CSSProperties} />
                  <div className="text-sm text-gray-400 mt-2">Average time: 5 minutes</div>
                </div>
              </div>
              {/* Step 2 */}
              <div className="flex items-center gap-8">
                <div className="flex-shrink-0 w-16 h-16 neon-border rounded-full flex items-center justify-center text-2xl font-bold">2</div>
                <div className="glass-effect rounded-2xl p-8 flex-1">
                  <h3 className="text-2xl font-bold mb-4">Automated Analysis</h3>
                  <p className="text-gray-300 mb-4">Our AI engines perform comprehensive static and dynamic analysis, checking for 200+ vulnerability patterns.</p>
                  <div className="audit-progress bg-gray-700 rounded-full h-2" style={{ '--progress': '35%' } as React.CSSProperties} />
                  <div className="text-sm text-gray-400 mt-2">Average time: 2-4 hours</div>
                </div>
              </div>
              {/* Step 3 */}
              <div className="flex items-center gap-8">
                <div className="flex-shrink-0 w-16 h-16 neon-border rounded-full flex items-center justify-center text-2xl font-bold">3</div>
                <div className="glass-effect rounded-2xl p-8 flex-1">
                  <h3 className="text-2xl font-bold mb-4">Expert Review</h3>
                  <p className="text-gray-300 mb-4">Senior auditors manually review findings, test edge cases, and analyze business logic vulnerabilities.</p>
                  <div className="audit-progress bg-gray-700 rounded-full h-2" style={{ '--progress': '65%' } as React.CSSProperties} />
                  <div className="text-sm text-gray-400 mt-2">Average time: 1-3 days</div>
                </div>
              </div>
              {/* Step 4 */}
              <div className="flex items-center gap-8">
                <div className="flex-shrink-0 w-16 h-16 neon-border rounded-full flex items-center justify-center text-2xl font-bold">4</div>
                <div className="glass-effect rounded-2xl p-8 flex-1">
                  <h3 className="text-2xl font-bold mb-4">Report Generation</h3>
                  <p className="text-gray-300 mb-4">Comprehensive report with findings, severity ratings, and detailed remediation recommendations.</p>
                  <div className="audit-progress bg-gray-700 rounded-full h-2" style={{ '--progress': '85%' } as React.CSSProperties} />
                  <div className="text-sm text-gray-400 mt-2">Average time: 4-6 hours</div>
                </div>
              </div>
              {/* Step 5 */}
              <div className="flex items-center gap-8">
                <div className="flex-shrink-0 w-16 h-16 neon-border rounded-full flex items-center justify-center text-2xl font-bold">5</div>
                <div className="glass-effect rounded-2xl p-8 flex-1">
                  <h3 className="text-2xl font-bold mb-4">Remediation Support</h3>
                  <p className="text-gray-300 mb-4">Direct consultation with our team to resolve issues and validate fixes before deployment.</p>
                  <div className="audit-progress bg-gray-700 rounded-full h-2" style={{ '--progress': '100%' } as React.CSSProperties} />
                  <div className="text-sm text-gray-400 mt-2">Ongoing support included</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Pricing Section */}
      {/* <section id="pricing" className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-bold gradient-text mb-6">Transparent Pricing</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Choose the plan that fits your needs. All plans include our comprehensive security analysis.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto"> */}
            {/* Starter Plan */}
            {/* <div className="glass-effect rounded-2xl p-8 relative">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold mb-4">Starter</h3>
                <div className="text-4xl font-bold gradient-text mb-2">$2,500</div>
                <div className="text-gray-400">Per contract</div>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-lime-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 00-1.414 1.414l4 4a3 3 0 004.242 0l8-8a1 1 0 00-1.414-1.414z" clipRule="evenodd" />
                  </svg>
                  <span>AI-powered vulnerability detection</span>
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-lime-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 00-1.414 1.414l4 4a3 3 0 004.242 0l8-8a1 1 0 00-1.414-1.414z" clipRule="evenodd" />
                  </svg>
                  <span>Up to 500 lines of code</span>
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-lime-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 00-1.414 1.414l4 4a3 3 0 004.242 0l8-8a1 1 0 00-1.414-1.414z" clipRule="evenodd" />
                  </svg>
                  <span>24-48 hour turnaround</span>
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-lime-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 00-1.414 1.414l4 4a3 3 0 004.242 0l8-8a1 1 0 00-1.414-1.414z" clipRule="evenodd" />
                  </svg>
                  <span>Basic security report</span>
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-lime-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 00-1.414 1.414l4 4a3 3 0 004.242 0l8-8a1 1 0 00-1.414-1.414z" clipRule="evenodd" />
                  </svg>
                  <span>Email support</span>
                </li>
              </ul>
              <button className="w-full border border-lime-400 text-lime-400 py-3 rounded-lg hover:bg-lime-400 hover:text-black transition-all cursor-pointer">
                Choose Starter
              </button>
            </div> */}
            {/* Professional Plan */}
            {/* <div className="glass-effect rounded-2xl p-8 relative neon-border">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-lime-400 text-black px-4 py-1 rounded-full text-sm font-bold">
                MOST POPULAR
              </div>
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold mb-4">Professional</h3>
                <div className="text-4xl font-bold gradient-text mb-2">$7,500</div>
                <div className="text-gray-400">Per contract</div>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-lime-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 00-1.414 1.414l4 4a3 3 0 004.242 0l8-8a1 1 0 00-1.414-1.414z" clipRule="evenodd" />
                  </svg>
                  <span>AI + Expert manual review</span>
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-lime-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 00-1.414 1.414l4 4a3 3 0 004.242 0l8-8a1 1 0 00-1.414-1.414z" clipRule="evenodd" />
                  </svg>
                  <span>Up to 2,000 lines of code</span>
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-lime-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 00-1.414 1.414l4 4a3 3 0 004.242 0l8-8a1 1 0 00-1.414-1.414z" clipRule="evenodd" />
                  </svg>
                  <span>3-5 day turnaround</span>
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-lime-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 00-1.414 1.414l4 4a3 3 0 004.242 0l8-8a1 1 0 00-1.414-1.414z" clipRule="evenodd" />
                  </svg>
                  <span>Comprehensive security report</span>
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-lime-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 00-1.414 1.414l4 4a3 3 0 004.242 0l8-8a1 1 0 00-1.414-1.414z" clipRule="evenodd" />
                  </svg>
                  <span>Real-time dashboard access</span>
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-lime-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 00-1.414 1.414l4 4a3 3 0 004.242 0l8-8a1 1 0 00-1.414-1.414z" clipRule="evenodd" />
                  </svg>
                  <span>1 free re-audit after fixes</span>
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-lime-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 00-1.414 1.414l4 4a3 3 0 004.242 0l8-8a1 1 0 00-1.414-1.414z" clipRule="evenodd" />
                  </svg>
                  <span>Priority support</span>
                </li>
              </ul>
              <button className="w-full bg-lime-400 text-black py-3 rounded-lg hover:bg-lime-300 transition-all font-bold cursor-pointer">
                Choose Professional
              </button>
            </div> */}
            {/* Enterprise Plan */}
            {/* <div className="glass-effect rounded-2xl p-8 relative">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold mb-4">Enterprise</h3>
                <div className="text-4xl font-bold gradient-text mb-2">Custom</div>
                <div className="text-gray-400">Contact us</div>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-lime-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 00-1.414 1.414l4 4a3 3 0 004.242 0l8-8a1 1 0 00-1.414-1.414z" clipRule="evenodd" />
                  </svg>
                  <span>Full security assessment</span>
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-lime-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 00-1.414 1.414l4 4a3 3 0 004.242 0l8-8a1 1 0 00-1.414-1.414z" clipRule="evenodd" />
                  </svg>
                  <span>Unlimited lines of code</span>
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-lime-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 00-1.414 1.414l4 4a3 3 0 004.242 0l8-8a1 1 0 00-1.414-1.414z" clipRule="evenodd" />
                  </svg>
                  <span>Custom timeline</span>
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-lime-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 00-1.414 1.414l4 4a3 3 0 004.242 0l8-8a1 1 0 00-1.414-1.414z" clipRule="evenodd" />
                  </svg>
                  <span>Continuous monitoring</span>
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-lime-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 00-1.414 1.414l4 4a3 3 0 004.242 0l8-8a1 1 0 00-1.414-1.414z" clipRule="evenodd" />
                  </svg>
                  <span>Dedicated account manager</span>
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-lime-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 00-1.414 1.414l4 4a3 3 0 004.242 0l8-8a1 1 0 00-1.414-1.414z" clipRule="evenodd" />
                  </svg>
                  <span>Emergency response team</span>
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-lime-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 00-1.414 1.414l4 4a3 3 0 004.242 0l8-8a1 1 0 00-1.414-1.414z" clipRule="evenodd" />
                  </svg>
                  <span>SLA guarantees</span>
                </li>
              </ul>
              <button className="w-full border border-lime-400 text-lime-400 py-3 rounded-lg hover:bg-lime-400 hover:text-black transition-all cursor-pointer">
                Contact Sales
              </button>
            </div>
          </div>
        </div>
      </section> */}
      {/* Testimonials Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-bold gradient-text mb-6">Trusted by Leaders</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Top DeFi protocols trust Hexific to protect their smart contracts and users&#39; funds.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="glass-effect rounded-2xl p-8">
              <p className="text-lg mb-6">&quot;Hexific found critical vulnerabilities that other auditors missed. Their AI-powered analysis combined with expert review is unmatched.&quot;</p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-lime-400/20 rounded-full flex items-center justify-center mr-4">
                  <span className="text-lime-400 font-bold text-lg">A</span>
                </div>
                <div>
                  <div className="font-bold">Alex Chen</div>
                  <div className="text-gray-400 text-sm">CTO, DeFiProtocol</div>
                </div>
              </div>
            </div>
            <div className="glass-effect rounded-2xl p-8">
              <p className="text-lg mb-6">&quot;The real-time dashboard and continuous monitoring gave us confidence to launch. Best audit experience we&#39;ve had.&quot;</p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-lime-400/20 rounded-full flex items-center justify-center mr-4">
                  <span className="text-lime-400 font-bold text-lg">S</span>
                </div>
                <div>
                  <div className="font-bold">Sarah Kim</div>
                  <div className="text-gray-400 text-sm">Founder, YieldFarm</div>
                </div>
              </div>
            </div>
            <div className="glass-effect rounded-2xl p-8">
              <p className="text-lg mb-6">&quot;Their emergency response team saved us $2M when a vulnerability was discovered post-launch. Incredible service.&quot;</p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-lime-400/20 rounded-full flex items-center justify-center mr-4">
                  <span className="text-lime-400 font-bold text-lg">M</span>
                </div>
                <div>
                  <div className="font-bold">Marcus Johnson</div>
                  <div className="text-gray-400 text-sm">Security Lead, LendingDAO</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* CTA Section */}
      <section id="contact" className="py-20 floating-orbs">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-6xl font-bold gradient-text mb-6">Ready to Secure Your Protocol?</h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Join hundreds of projects that trust Hexific to protect their smart contracts and users&#39; funds.
          </p>
          <div className="glass-effect rounded-2xl p-8 mb-8">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-2xl font-bold mb-4">Start Free Audit</h3>
                <p className="text-gray-300 mb-4">Get started with our AI-powered vulnerability detection for free.</p>
                <button onClick={scrollDown} className="bg-lime-400 text-black px-8 py-3 rounded-lg font-bold hover:bg-lime-300 transition-all pulse-glow cursor-pointer">
                  Upload Contract
                </button>
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-4">Book Consultation</h3>
                <p className="text-gray-300 mb-4">Speak with our security experts about your specific needs.</p>
                <button onClick={handleClick} className="border border-lime-400 text-lime-400 px-8 py-3 rounded-lg hover:bg-lime-400 hover:text-black transition-all cursor-pointer">
                  Schedule Call
                </button>
              </div>
            </div>
          </div>
          <div id="free-audit-upload" className="scroll-mt-20">
            <FreeAuditUpload />
          </div>
          {/* Contact Info */}
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="w-12 h-12 bg-lime-400/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-lime-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h4 className="font-bold mb-2">Email</h4>
              <p className="text-gray-400">admin@hexific.com</p>
            </div>
            <div>
              <div className="w-12 h-12 bg-lime-400/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-lime-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h4 className="font-bold mb-2">Response Time</h4>
              <p className="text-gray-400">&lt; 24 hours</p>
            </div>
            <div>
              <div className="w-12 h-12 bg-lime-400/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-lime-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h4 className="font-bold mb-2">Security</h4>
              <p className="text-gray-400">SOC 2 Compliant</p>
            </div>
          </div>
        </div>
      </section>
      {/* Roadmap Section */}
      <section id="roadmap" className="py-20 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-bold gradient-text mb-6">Roadmap</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Our journey to make smart contract security accessible and comprehensive for everyone
            </p>
          </div>

          {/* Timeline */}
          <div className="relative">
            {/* Vertical line */}
            <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 w-0.5 h-full bg-gradient-to-b from-lime-400 via-lime-400/50 to-transparent" />

            <div className="space-y-12">
              {/* Q4 2025 */}
              <div className="relative">
                <div className="md:flex items-center">
                  {/* Timeline dot */}
                  <div className="hidden md:flex absolute left-1/2 transform -translate-x-1/2 w-8 h-8 bg-lime-400 rounded-full border-4 border-[#000E1B] z-10 items-center justify-center">
                    <div className="w-3 h-3 bg-black rounded-full pulse-glow" />
                  </div>

                  {/* Content */}
                  <div className="md:w-1/2 md:pr-12">
                    <div className="glass-effect rounded-2xl p-8 neon-border">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-2xl font-bold gradient-text">Q4 2025</h3>
                        <span className="bg-lime-400 text-black px-3 py-1 rounded-full text-xs font-bold">
                          IN PROGRESS
                        </span>
                      </div>
                      <p className="text-gray-400 text-sm mb-6">Sep - Dec 2025</p>
                      
                      <h4 className="text-xl font-bold mb-4 text-white">Foundation & Core Features</h4>
                      
                      <ul className="space-y-3">
                        <li className="flex items-start">
                          <svg className="w-5 h-5 text-lime-400 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span className="text-gray-300">Launch on mainnet</span>
                        </li>
                        <li className="flex items-start">
                          <svg className="w-5 h-5 text-lime-400 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span className="text-gray-300">Real USDC payment system live</span>
                        </li>
                        <li className="flex items-start">
                          <svg className="w-5 h-5 text-lime-400 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span className="text-gray-300">Crypto Twitter, Discord communities engagement</span>
                        </li>
                        <li className="flex items-start">
                          <svg className="w-5 h-5 text-lime-400 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span className="text-gray-300">Integrate with Claude Sonnet API for AI audits</span>
                        </li>
                        <li className="flex items-start">
                          <svg className="w-5 h-5 text-lime-400 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span className="text-gray-300">Track which findings users ask AI about most</span>
                        </li>
                      </ul>

                      <div className="mt-6 pt-6 border-t border-lime-400/20">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-lime-400">Goal:</span>
                          <span className="text-white font-bold">100+ audits findings (AI + manual)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Q1 2026 */}
              <div className="relative">
                <div className="md:flex items-center md:flex-row-reverse">
                  {/* Timeline dot */}
                  <div className="hidden md:flex absolute left-1/2 transform -translate-x-1/2 w-8 h-8 bg-lime-400/30 rounded-full border-4 border-[#000E1B] z-10 items-center justify-center">
                    <div className="w-3 h-3 bg-lime-400/50 rounded-full" />
                  </div>

                  {/* Content */}
                  <div className="md:w-1/2 md:pl-12">
                    <div className="glass-effect rounded-2xl p-8 border border-lime-400/20 hover:border-lime-400/40 transition-all">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-2xl font-bold gradient-text">Q1 2026</h3>
                        <span className="bg-gray-700 text-lime-400 px-3 py-1 rounded-full text-xs font-bold">
                          PLANNED
                        </span>
                      </div>
                      <p className="text-gray-400 text-sm mb-6">Jan - Apr 2026</p>
                      
                      <h4 className="text-xl font-bold mb-4 text-white">AI Enhancement</h4>
                      
                      <ul className="space-y-3">
                        <li className="flex items-start">
                          <svg className="w-5 h-5 text-lime-400/60 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                          <span className="text-gray-300">Utilize $HEXI token for enhanced AI audit capabilities</span>
                        </li>
                        <li className="flex items-start">
                          <svg className="w-5 h-5 text-lime-400/60 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                          <span className="text-gray-300">Audit history storage (users want to see past audits)</span>
                        </li>
                        <li className="flex items-start">
                          <svg className="w-5 h-5 text-lime-400/60 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <span className="text-gray-300">User accounts (wallet-based, no passwords)</span>
                        </li>
                        <li className="flex items-start">
                          <svg className="w-5 h-5 text-lime-400/60 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          <span className="text-gray-300">Email notifications when audit completes</span>
                        </li>
                        <li className="flex items-start">
                          <svg className="w-5 h-5 text-lime-400/60 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                          </svg>
                          <span className="text-gray-300">Multi-AI ensemble for better audit quality</span>
                        </li>
                      </ul>

                      <div className="mt-6 pt-6 border-t border-lime-400/20">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-lime-400">Goal:</span>
                          <span className="text-white font-bold">500+ audits findings</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Continuous Improvements */}
              <div className="relative">
                <div className="md:flex items-center justify-center">
                  {/* Timeline dot - end */}
                  {/* <div className="hidden md:flex absolute left-1/2 transform -translate-x-1/2 w-8 h-8 bg-gradient-to-b from-lime-400/30 to-transparent rounded-full border-4 border-[#000E1B] z-10 items-center justify-center">
                    <div className="w-2 h-2 bg-lime-400/30 rounded-full" />
                  </div> */}

                  {/* Content */}
                  <div className="md:w-2/3">
                    <div className="glass-effect rounded-2xl p-8 border border-lime-400/10 text-center">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-lime-400/10 rounded-full mb-4">
                        <svg className="w-8 h-8 text-lime-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                      <h3 className="text-2xl font-bold gradient-text mb-3">Continuous Improvements</h3>
                      <p className="text-gray-300 text-lg">
                        Ongoing enhancements for <strong className="text-lime-400">AI Audit Quality</strong> and <strong className="text-lime-400">Privacy Protection</strong>
                      </p>
                      <div className="mt-6 flex flex-wrap gap-3 justify-center">
                        <span className="px-4 py-2 bg-lime-400/10 border border-lime-400/30 rounded-full text-sm text-lime-400 font-semibold">
                          AI Accuracy
                        </span>
                        <span className="px-4 py-2 bg-lime-400/10 border border-lime-400/30 rounded-full text-sm text-lime-400 font-semibold">
                          Privacy First
                        </span>
                        <span className="px-4 py-2 bg-lime-400/10 border border-lime-400/30 rounded-full text-sm text-lime-400 font-semibold">
                          User Experience
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="mt-16 text-center">
            <div className="glass-effect rounded-2xl p-8 max-w-2xl mx-auto border border-lime-400/20">
              <h3 className="text-2xl font-bold mb-4 text-white">Want to influence our roadmap?</h3>
              <p className="text-gray-300 mb-6">
                Join our community and share your feedback to help shape the future of Hexific
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="mailto:admin@hexific.com"
                  className="bg-lime-400 text-black px-6 py-3 rounded-lg font-bold hover:bg-lime-300 transition-all pulse-glow inline-block"
                >
                  Contact Us
                </a>
                <a
                  href="https://x.com/i/communities/1994420483463528685"
                  className="glass-effect border border-lime-400 text-lime-400 px-6 py-3 rounded-lg font-bold hover:bg-lime-400 hover:text-black transition-all inline-block"
                >
                  Join X Community
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Footer */}
      <footer className="py-12 border-t border-lime-400/20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-lime-400 rounded-lg flex items-center justify-center">
                  {/* <svg className="w-5 h-5 text-black font-bold" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                  </svg> */}
                  <Image src="./logo.svg" alt="Hexific Logo" width={19} height={19} />
                </div>
                <span className="text-xl font-bold gradient-text">Hexific</span>
              </div>
              <p className="text-gray-400 text-sm">Advanced smart contract security auditing platform powered by AI and expert analysis.</p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Services</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-lime-400 transition-colors">Smart Contract Audits</a></li>
                <li><a href="#" className="hover:text-lime-400 transition-colors">Continuous Monitoring</a></li>
                <li><a href="#" className="hover:text-lime-400 transition-colors">Security Consulting</a></li>
                <li><a href="#" className="hover:text-lime-400 transition-colors">Emergency Response</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-lime-400 transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-lime-400 transition-colors">Security Blog</a></li>
                <li><a href="#" className="hover:text-lime-400 transition-colors">Vulnerability Database</a></li>
                <li><a href="#" className="hover:text-lime-400 transition-colors">Best Practices</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-lime-400 transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-lime-400 transition-colors">Careers</a></li>
                <li>
                  <Link href="/privacy-policy" className="hover:text-lime-400 transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms-of-service" className="hover:text-lime-400 transition-colors">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-lime-400/20 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">© 2025 Hexific. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-lime-400 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" /></svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-lime-400 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z" /></svg>
              </a>
              <a href="https://www.linkedin.com/company/hexific/" className="text-gray-400 hover:text-lime-400 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-lime-400 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.739.099.12.112.225.085.402-.09.456-.298 1.585-.339 1.636-.053.069-.172.042-.402-.017-1.499-.69-2.436-2.888-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.357-.629-2.748-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001.012.001 12.017 0z" /></svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
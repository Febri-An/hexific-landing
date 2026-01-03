'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import FreeAuditUpload from '@/components/FreeAuditUpload';
import { WalletConnectButton } from "@/components/wallet-connect-button";

export default function Page() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [countersStarted, setCountersStarted] = useState(false);
  const [hexiPrice, setHexiPrice] = useState<number | null>(null);
  const [priceChange24h, setPriceChange24h] = useState<number | null>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [currentTranslateX, setCurrentTranslateX] = useState(0);

  const carouselAnimNameRef = useRef<string>('');
  const carouselAnimDurationSecRef = useRef<number>(0);
  const carouselAnimTimingRef = useRef<string>('linear');

  const parseCssTimeToSeconds = (value: string): number => {
    const raw = value.trim();
    if (!raw) return 0;
    if (raw.endsWith('ms')) {
      const n = Number.parseFloat(raw.slice(0, -2));
      return Number.isFinite(n) ? n / 1000 : 0;
    }
    if (raw.endsWith('s')) {
      const n = Number.parseFloat(raw.slice(0, -1));
      return Number.isFinite(n) ? n : 0;
    }
    const n = Number.parseFloat(raw);
    return Number.isFinite(n) ? n : 0;
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!carouselRef.current) return;

    const track = carouselRef.current;

    setIsDragging(true);
    setStartX(e.pageX);

    // 1. Get the current position from the computed style
    const style = window.getComputedStyle(track);
    const matrix = new DOMMatrix(style.transform);
    const currentX = matrix.m41;

    setCurrentTranslateX(currentX);

    // Store the active animation config so it can resume from the drag position
    const animName = (style.animationName || '').split(',')[0]?.trim() || '';
    const animDuration = (style.animationDuration || '').split(',')[0]?.trim() || '';
    const animTiming = (style.animationTimingFunction || '').split(',')[0]?.trim() || 'linear';
    carouselAnimNameRef.current = animName !== 'none' ? animName : '';
    carouselAnimDurationSecRef.current = parseCssTimeToSeconds(animDuration);
    carouselAnimTimingRef.current = animTiming || 'linear';

    // 2. Disable the animation and set a fixed position so it doesn't move while holding
    track.style.animation = 'none';
    track.style.animationDelay = '';
    track.style.animationPlayState = 'running';
    track.style.transform = `translateX(${currentX}px)`;
    track.style.cursor = 'grabbing';
  };

  useEffect(() => {
    if (!isDragging) return;

    const track = carouselRef.current;
    if (!track) return;

    const handleMouseMove = (e: MouseEvent) => {
      e.preventDefault();
      const x = e.pageX - startX;
      const walk = x * 1.5; // Drag speed
      track.style.transform = `translateX(${currentTranslateX + walk}px)`;
    };

    const handleMouseUp = (e: MouseEvent) => {
      setIsDragging(false);
      track.style.cursor = 'grab';

      // Get the final position after dragging
      const style = window.getComputedStyle(track);
      const matrix = new DOMMatrix(style.transform);
      const finalX = matrix.m41;

      // -50% in the keyframes = half of the track width (because width: fit-content)
      const halfWidth = track.scrollWidth / 2;
      if (!halfWidth) {
        track.style.transform = '';
        track.style.animation = '';
        track.style.animationDelay = '';
        return;
      }

      // Normalize so it always stays within the range [-halfWidth, 0]
      let normalizedX = finalX % halfWidth;
      if (normalizedX > 0) normalizedX -= halfWidth;
      if (normalizedX < -halfWidth) normalizedX += halfWidth;

      // Compute animation progress based on the position
      const progress = Math.min(1, Math.max(0, Math.abs(normalizedX) / halfWidth));

      // Use the stored animation config (fall back to computed style if needed)
      const fallbackName = (style.animationName || '').split(',')[0]?.trim() || '';
      const animName = carouselAnimNameRef.current || (fallbackName !== 'none' ? fallbackName : '');
      const fallbackDurationSec = parseCssTimeToSeconds((style.animationDuration || '').split(',')[0]?.trim() || '');
      const durationSec = carouselAnimDurationSecRef.current || fallbackDurationSec || 50;
      const timingFn = carouselAnimTimingRef.current || 'linear';

      // Restart the animation from the current position using a negative delay
      // (Toggle 'none' -> reflow -> set animation) so the browser actually restarts it.
      track.style.animation = 'none';
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      track.offsetHeight;

      track.style.transform = '';
      track.style.animation = `${animName} ${durationSec}s ${timingFn} infinite`;
      track.style.animationDelay = `${-(progress * durationSec)}s`;
      track.style.animationPlayState = 'running';
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, startX, currentTranslateX]);

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
        <a href="/roadmap" class="block hover:text-lime-400 transition-colors">Roadmap</a>
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
      <style dangerouslySetInnerHTML={{ __html: "\n        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');\n        \n        * {\n            font-family: 'Inter', sans-serif;\n        }\n        \n        html {\n            scroll-behavior: smooth;\n        }\n        \n        body {\n            background: #000E1B;\n            color: white;\n            overflow-x: hidden;\n        }\n        \n        .gradient-text {\n            background: linear-gradient(135deg, #D6ED17, #ffffff);\n            -webkit-background-clip: text;\n            -webkit-text-fill-color: transparent;\n            background-clip: text;\n        }\n        \n        .glass-effect {\n            background: rgba(214, 237, 23, 0.1);\n            backdrop-filter: blur(20px);\n            border: 1px solid rgba(214, 237, 23, 0.2);\n        }\n        \n        .feature-card:hover {\n            transform: translateY(-10px);\n            transition: all 0.3s ease;\n        }\n        \n        .cyber-grid {\n            background-image: \n                linear-gradient(rgba(214, 237, 23, 0.1) 1px, transparent 1px),\n                linear-gradient(90deg, rgba(214, 237, 23, 0.1) 1px, transparent 1px);\n            background-size: 50px 50px;\n            animation: grid-move 20s linear infinite;\n        }\n        \n        @keyframes grid-move {\n            0% { transform: translate(0, 0); }\n            100% { transform: translate(50px, 50px); }\n        }\n        \n        .floating-orbs::after {\n            content: '';\n            position: absolute;\n            width: 200px;\n            height: 200px;\n            background: radial-gradient(circle, rgba(214, 237, 23, 0.3) 0%, transparent 70%);\n            border-radius: 50%;\n            top: 20%;\n            right: 10%;\n            animation: float 8s ease-in-out infinite;\n            z-index: -1;\n        }\n        \n        .floating-orbs::before {\n            content: '';\n            position: absolute;\n            width: 150px;\n            height: 150px;\n            background: radial-gradient(circle, rgba(214, 237, 23, 0.2) 0%, transparent 70%);\n            border-radius: 50%;\n            bottom: 30%;\n            left: 15%;\n            animation: float 6s ease-in-out infinite reverse;\n            z-index: -1;\n        }\n        \n        @keyframes float {\n            0%, 100% { transform: translateY(0px) rotate(0deg); }\n            50% { transform: translateY(-30px) rotate(180deg); }\n        }\n        \n        .pulse-glow {\n            animation: pulse-glow 2s ease-in-out infinite;\n        }\n        \n        @keyframes pulse-glow {\n            0%, 100% { box-shadow: 0 0 20px rgba(214, 237, 23, 0.3); }\n            50% { box-shadow: 0 0 40px rgba(214, 237, 23, 0.6); }\n        }\n        \n        .slide-up {\n            animation: slide-up 0.8s ease-out forwards;\n        }\n        \n        @keyframes slide-up {\n            from { opacity: 0; transform: translateY(50px); }\n            to { opacity: 1; transform: translateY(0); }\n        }\n        \n        .code-pattern {\n            background: linear-gradient(45deg, transparent 49%, rgba(214, 237, 23, 0.1) 50%, transparent 51%);\n            background-size: 20px 20px;\n        }\n        \n        .neon-border {\n            border: 2px solid #D6ED17;\n            box-shadow: 0 0 20px rgba(214, 237, 23, 0.5), inset 0 0 20px rgba(214, 237, 23, 0.1);\n        }\n        \n        .scan-line {\n            position: relative;\n            overflow: hidden;\n        }\n        \n        .scan-line::after {\n            content: '';\n            position: absolute;\n            top: 0;\n            left: -100%;\n            width: 100%;\n            height: 100%;\n            background: linear-gradient(90deg, transparent, rgba(214, 237, 23, 0.3), transparent);\n            animation: scan 3s ease-in-out infinite;\n        }\n        \n        @keyframes scan {\n            0% { left: -100%; }\n            100% { left: 100%; }\n        }\n        \n        .matrix-bg {\n            position: fixed;\n            top: 0;\n            left: 0;\n            width: 100%;\n            height: 100%;\n            pointer-events: none;\n            z-index: -2;\n            opacity: 0.1;\n        }\n        \n        .audit-progress {\n            background: linear-gradient(90deg, #D6ED17 var(--progress, 0%), transparent var(--progress, 0%));\n            transition: all 0.3s ease;\n        }\n        \n        /* Infinite Carousel Animation */\n        .carousel-track {\n            animation: carousel-scroll 50s linear infinite;\n            width: fit-content;\n        }\n        \n        .carousel-track:hover {\n            animation-play-state: paused;\n        }\n        \n        .carousel-slide {\n            display: flex;\n            gap: 1.5rem;\n        }\n        \n        @keyframes carousel-scroll {\n            0% {\n                transform: translateX(0);\n            }\n            100% {\n                transform: translateX(-50%);\n            }\n        }\n    " }} />
      {/* Matrix Background */}
      <div className="matrix-bg">
        <canvas ref={canvasRef} className="w-full h-full" />
      </div>
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 glass-effect border-b border-lime-400/20">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-10">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-lime-400 rounded-lg flex items-center justify-center">
                  <Image src="./logo.svg" alt="Hexific Logo" width={24} height={24} />
                  {/* <img src="/logo.svg" alt="My Logo" className="w-6 h-6" /> */}
                </div>
                <span className="text-2xl font-bold gradient-text">Hexific</span>
              </div>
            
              <div className="flex space-x-4">
                <a href="#features" className="hover:text-lime-400 transition-colors">Features</a>
                <a href="#process" className="hover:text-lime-400 transition-colors">Process</a>
                <a href="#roadmap" className="hover:text-lime-400 transition-colors">Roadmap</a>
                {/* <a href="#pricing" className="hover:text-lime-400 transition-colors">Pricing</a> */}
                <Link href="/docs" className="hover:text-lime-400 transition-colors">
                  Docs
                </Link>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              {/* <a href="#contact" className="glass-effect text-white px-6 py-2 rounded-lg hover:bg-lime-300 transition-colors font-semibold">Get Audit</a> */}
              <WalletConnectButton />
              {/* <WalletConnectButton /> */}
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
      <div>
        {/* Mobile hero (disabled animated backgrounds) */}
        <section className="md:hidden min-h-screen flex items-center justify-center">
          <div className="max-w-7xl mx-auto px-6 py-20 text-center">
            <h1 className="text-4xl font-black mb-6">
              <span className="gradient-text">Bulletproof</span>
              <br />
              Smart Contract Audits
            </h1>
            <p className="text-lg text-gray-300 mb-8 max-w-3xl mx-auto">
              Advanced AI-powered security analysis combined with expert manual review. Protect your DeFi protocol from exploits before they happen.
            </p>
            <div className="flex flex-col gap-4 justify-center mb-12">
              <button onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })} className="bg-lime-400 text-black px-8 py-4 rounded-lg text-lg font-bold hover:bg-lime-300 transition-all cursor-pointer">
                Start Free Audit
              </button>
              <button onClick={() => window.open('https://github.com/Hexific/audit-reports', '_blank')} className="glass-effect px-8 py-4 rounded-lg text-lg font-semibold hover:bg-lime-400/20 transition-all cursor-pointer">
                View Sample Report
              </button>
            </div>
            <div className="grid grid-cols-2 gap-6 max-w-4xl mx-auto">
              <div className="glass-effect rounded-xl p-6">
                <div className="text-3xl font-bold gradient-text mb-2" id="vulnerabilities">700+</div>
                <div className="text-gray-400">Vulnerabilities Found</div>
              </div>
              <div className="glass-effect rounded-xl p-6">
                <div className="text-3xl font-bold gradient-text mb-2" id="response-time">24h</div>
                <div className="text-gray-400">Avg Response</div>
              </div>
            </div>
          </div>
        </section>

        {/* Desktop hero (keeps animated backgrounds) */}
        <section className="hidden md:flex relative min-h-screen items-center justify-center floating-orbs cyber-grid">
          <div className="max-w-7xl mx-auto px-6 py-20 text-center">
            <div className="slide-up">
              <h1 className="text-5xl md:text-7xl font-black mb-6">
                <span className="gradient-text">Bulletproof</span>
                <br />
                Smart Contract Audits
              </h1>
              <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
                Advanced AI-powered security analysis combined with expert manual review. Protect your DeFi protocol from exploits before they happen.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <button onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })} className="bg-lime-400 text-black px-8 py-4 rounded-lg text-lg font-bold hover:bg-lime-300 transition-all pulse-glow cursor-pointer">
                  Start Free Audit
                </button>
                <button onClick={() => window.open('https://github.com/Hexific/audit-reports', '_blank')} className="glass-effect px-8 py-4 rounded-lg text-lg font-semibold hover:bg-lime-400/20 transition-all cursor-pointer">
                  View Sample Report
                </button>
              </div>
              {/* Live Stats */}
              <div className="grid grid-cols-2 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                <div className="glass-effect rounded-xl p-6 scan-line">
                  <div className="text-3xl font-bold gradient-text mb-2" id="vulnerabilities">700+</div>
                  <div className="text-gray-400">Vulnerabilities Found</div>
                </div>
                <div className="glass-effect rounded-xl p-6 scan-line">
                  <div className="text-3xl font-bold gradient-text mb-2" id="response-time">24h</div>
                  <div className="text-gray-400">Avg Response</div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
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
      <section id="process" className="py-20 code-pattern overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-bold gradient-text mb-6">Audit Process</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Our streamlined process delivers comprehensive security analysis in record time.
            </p>
          </div>
        </div>
        
        {/* Infinite Carousel */}
        <div className="relative overflow-hidden group">
          {/* Gradient Masks */}
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-[#000E1B] to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-[#000E1B] to-transparent z-10 pointer-events-none" />
          
          {/* Carousel Track - Infinite Animation + Draggable */}
          <div 
            ref={carouselRef}
            className={`carousel-track flex gap-6 py-4 cursor-grab select-none`}
            onMouseDown={handleMouseDown}
            // onMouseUp={handleMouseUp}
            // onMouseMove={handleMouseMove}
            // onMouseLeave={handleMouseLeave}
            // style={{ animationPlayState: animationPaused ? 'paused' : 'running' }}
          >
            {/* Duplicate cards for infinite loop - First set */}
            {[...Array(2)].map((_, setIndex) => (
              <div key={setIndex} className="carousel-slide flex gap-6 flex-shrink-0">
                {/* Step 1 */}
                <div className="w-[350px] md:w-[400px] flex-shrink-0 group">
                  <div className="glass-effect rounded-2xl p-6 h-full hover:scale-105 transition-all duration-300 hover:border-[#D6ED17] border border-transparent">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 neon-border rounded-full flex items-center justify-center text-xl font-bold group-hover:scale-110 transition-transform">1</div>
                      <h3 className="text-xl font-bold">Contract Submission</h3>
                    </div>
                    <p className="text-gray-300 mb-4 text-md">Upload your smart contracts through our secure platform. We support Solidity, Vyper, and other major languages.</p>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-sm text-lime-400">Average time: 5 minutes</span>
                    </div>
                  </div>
                </div>
                
                {/* Step 2 */}
                <div className="w-[350px] md:w-[400px] flex-shrink-0 group">
                  <div className="glass-effect rounded-2xl p-6 h-full hover:scale-105 transition-all duration-300 hover:border-[#D6ED17] border border-transparent">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 neon-border rounded-full flex items-center justify-center text-xl font-bold group-hover:scale-110 transition-transform">2</div>
                      <h3 className="text-xl font-bold">Automated Analysis</h3>
                    </div>
                    <p className="text-gray-300 mb-4 text-md">Our AI engines perform comprehensive static and dynamic analysis, checking for 200+ vulnerability patterns.</p>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-sm text-lime-400">Average time: 2-4 hours</span>
                    </div>
                  </div>
                </div>
                
                {/* Step 3 */}
                <div className="w-[350px] md:w-[400px] flex-shrink-0 group">
                  <div className="glass-effect rounded-2xl p-6 h-full hover:scale-105 transition-all duration-300 hover:border-[#D6ED17] border border-transparent">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 neon-border rounded-full flex items-center justify-center text-xl font-bold group-hover:scale-110 transition-transform">3</div>
                      <h3 className="text-xl font-bold">Expert Review</h3>
                    </div>
                    <p className="text-gray-300 mb-4 text-md">Senior auditors manually review findings, test edge cases, and analyze business logic vulnerabilities.</p>
                    <p> </p>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-sm text-lime-400">Average time: 1-3 days</span>
                    </div>
                  </div>
                </div>
                
                {/* Step 4 */}
                <div className="w-[350px] md:w-[400px] flex-shrink-0 group">
                  <div className="glass-effect rounded-2xl p-6 h-full hover:scale-105 transition-all duration-300 hover:border-[#D6ED17] border border-transparent">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 neon-border rounded-full flex items-center justify-center text-xl font-bold group-hover:scale-110 transition-transform">4</div>
                      <h3 className="text-xl font-bold">Report Generation</h3>
                    </div>
                    <p className="text-gray-300 mb-4 text-md">Comprehensive report with findings, severity ratings, and detailed remediation recommendations.</p>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-sm text-lime-400">Average time: 4-6 hours</span>
                    </div>
                  </div>
                </div>
                
                {/* Step 5 */}
                <div className="w-[350px] md:w-[400px] flex-shrink-0 group">
                  <div className="glass-effect rounded-2xl p-6 h-full hover:scale-105 transition-all duration-300 hover:border-[#D6ED17] border border-transparent">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 neon-border rounded-full flex items-center justify-center text-xl font-bold group-hover:scale-110 transition-transform">5</div>
                      <h3 className="text-xl font-bold">Remediation Support</h3>
                    </div>
                    <p className="text-gray-300 mb-4 text-md">Direct consultation with our team to resolve issues and validate fixes before deployment.</p>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-sm text-lime-400">Ongoing support included</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
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
              {/* Q4 2025 - COMPLETED */}
              <div className="relative">
                <div className="md:flex items-center">
                  {/* Timeline dot */}
                  <div className="hidden md:flex absolute left-1/2 transform -translate-x-1/2 w-8 h-8 bg-lime-400 rounded-full border-4 border-[#000E1B] z-10 items-center justify-center">
                    <svg className="w-4 h-4 text-black" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>

                  {/* Content */}
                  <div className="md:w-1/2 md:pr-12">
                    <div className="glass-effect rounded-2xl p-8 border border-lime-400/40">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-2xl font-bold gradient-text">Q4 2025</h3>
                        <span className="bg-lime-400 text-black px-3 py-1 rounded-full text-xs font-bold">
                          COMPLETED
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
                          <span className="text-white font-bold">100+ audits findings</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Q1 2026 - IN PROGRESS */}
              <div className="relative">
                <div className="md:flex items-center md:flex-row-reverse">
                  {/* Timeline dot */}
                  <div className="hidden md:flex absolute left-1/2 transform -translate-x-1/2 w-8 h-8 bg-lime-400 rounded-full border-4 border-[#000E1B] z-10 items-center justify-center">
                    <div className="w-3 h-3 bg-black rounded-full pulse-glow" />
                  </div>

                  {/* Content */}
                  <div className="md:w-1/2 md:pl-12">
                    <div className="glass-effect rounded-2xl p-8 neon-border">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-2xl font-bold gradient-text">Q1 2026</h3>
                        <span className="bg-lime-400 text-black px-3 py-1 rounded-full text-xs font-bold">
                          IN PROGRESS
                        </span>
                      </div>
                      <p className="text-gray-400 text-sm mb-6">Jan - Apr 2026</p>
                      
                      <h4 className="text-xl font-bold mb-4 text-white">AI Enhancement</h4>

                      <ul className="space-y-3">
                        <li className="flex items-start">
                          <div className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0 rounded-full border-2 border-lime-400 bg-transparent flex items-center justify-center">
                            <div className="w-1.5 h-0.5 bg-lime-400 rounded-full" />
                          </div>
                          <span className="text-gray-300">Utilize $HEXI token for enhanced AI audit capabilities</span>
                        </li>
                        <li className="flex items-start">
                          <div className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0 rounded-full border-2 border-lime-400 bg-transparent flex items-center justify-center">
                            <div className="w-1.5 h-0.5 bg-lime-400 rounded-full" />
                          </div>
                          <span className="text-gray-300">$HEXI buy back & burn program from platform revenue</span>
                        </li>
                        <li className="flex items-start">
                          <div className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0 rounded-full border-2 border-lime-400 bg-transparent flex items-center justify-center">
                            <div className="w-1.5 h-0.5 bg-lime-400 rounded-full" />
                          </div>
                          <span className="text-gray-300">Audit history storage (users want to see past audits)</span>
                        </li>
                        <li className="flex items-start">
                          <div className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0 rounded-full border-2 border-lime-400 bg-transparent flex items-center justify-center">
                            <div className="w-1.5 h-0.5 bg-lime-400 rounded-full" />
                          </div>
                          <span className="text-gray-300">Email notifications when audit completes</span>
                        </li>
                        <li className="flex items-start">
                          <svg className="w-5 h-5 text-lime-400 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
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

              {/* Q2 2026 - PLANNED */}
              {/* <div className="relative">
              <div className="md:flex items-center">
                
                <div className="hidden md:flex absolute left-1/2 transform -translate-x-1/2 w-8 h-8 bg-lime-400/30 rounded-full border-4 border-[#000E1B] z-10 items-center justify-center">
                <div className="w-3 h-3 bg-lime-400/50 rounded-full" />
                </div>

                
                <div className="md:w-1/2 md:pr-12">
                <div className="glass-effect rounded-2xl p-8 border border-lime-400/20 hover:border-lime-400/40 transition-all">
                  <div className="flex items-center justify-between mb-4">
                  <h3 className="text-2xl font-bold gradient-text">Q2 2026</h3>
                  <span className="bg-gray-700 text-lime-400 px-3 py-1 rounded-full text-xs font-bold">
                    PLANNED
                  </span>
                  </div>
                  <p className="text-gray-400 text-sm mb-6">May - Aug 2026</p>
                  
                  <h4 className="text-xl font-bold mb-4 text-white">Platform Expansion</h4>
                  
                  <ul className="space-y-3">
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-lime-400/60 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <span className="text-gray-300">Advanced security scanning features</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-lime-400/60 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span className="text-gray-300">Community-driven vulnerability database</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-lime-400/60 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <span className="text-gray-300">Detailed analytics dashboard for audit insights</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-lime-400/60 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    <span className="text-gray-300">Referral program for community growth</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-lime-400/60 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                    </svg>
                    <span className="text-gray-300">API access for enterprise integrations</span>
                  </li>
                  </ul>

                  <div className="mt-6 pt-6 border-t border-lime-400/20">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-lime-400">Goal:</span>
                    <span className="text-white font-bold">1000+ audits findings</span>
                  </div>
                  </div>
                </div>
                </div>
              </div>
              </div> */}

              {/* Continuous Improvements */}
              <div className="relative">
                <div className="md:flex items-center justify-center">
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
            <div className="border-t border-lime-400/20 pt-8">
            <div className="flex flex-col items-center space-y-6">
              {/* Social Links */}
              <div className="flex space-x-8">
              <a 
                href="https://x.com/hexific" 
                className="text-gray-400 hover:text-lime-400 transition-all hover:scale-110 transform"
                aria-label="Twitter"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" /></svg>
              </a>
              <a 
                href="https://www.linkedin.com/company/hexific/" 
                className="text-gray-400 hover:text-lime-400 transition-all hover:scale-110 transform"
                aria-label="LinkedIn"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
              </a>
              <a 
                href="https://discord.gg/5v8v3X9Qhf" 
                className="text-gray-400 hover:text-lime-400 transition-all hover:scale-110 transform"
                aria-label="Discord"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>
              </a>
              </div>
              
              {/* Copyright */}
              <p className="text-gray-400 text-sm">© 2025 Hexific. All rights reserved.</p>
            </div>
            </div>
        </div>
      </footer>
    </div>
  );
};
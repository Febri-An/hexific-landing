# Hexific Landing Page

[![MIT License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Vercel](https://img.shields.io/badge/deployed%20on-Vercel-000)](https://hexific.com)

*A minimal, modern landing page for [Hexific](https://hexific.com), implemented in Next.js with Tailwind CSS.*

---

## 🚀 Overview

Hexific is the next-gen smart contract auditing platform combining manual expertise and AI-powered analysis. This repository holds the source code for the Hexific landing site, built with Next.js (App Router) and styled using Tailwind CSS.

Key highlights:

* **Lightning-Fast**: Blazing load times and instant navigation.
* **Professional & Trusted**: Clean, polished design that communicates credibility.
* **Modular & Maintainable**: Structured for easy updates and scaling.

---

## 📖 Table of Contents

- [Hexific Landing Page](#hexific-landing-page)
  - [🚀 Overview](#-overview)
  - [📖 Table of Contents](#-table-of-contents)
  - [🎬 Demo](#-demo)
  - [✨ Features Section](#-features-section)
  - [🛠 Tech Stack](#-tech-stack)
  - [🎯 Getting Started](#-getting-started)
  - [📂 Project Structure](#-project-structure)
  - [⚙️ Deployment](#️-deployment)
  - [🤝 Contributing](#-contributing)
  - [📝 License](#-license)
  - [📬 Contact](#-contact)

---

## 🎬 Demo

Live demo: [https://hexific.com](https://hexific.com)

---

## ✨ Features Section

* **Hero Section**: Bold headline, concise subtext, clear CTA button.
* **Features Cards**: Highlights key selling points in responsive layout.
* **Footer**: Simple, informative, with links to Terms, Privacy, and Contact.
* **Responsive Design**: Optimized for mobile, tablet, and desktop.

---

## 🛠 Tech Stack

* **Framework**: [Next.js](https://nextjs.org/) (App Router)
* **Styling**: [Tailwind CSS](https://tailwindcss.com/)
* **Deployment**: [Vercel](https://vercel.com/)
* **Fonts**: Google Fonts (Inter)

---

## 🎯 Getting Started

1. **Clone the repo**

   ```bash
   git clone https://github.com/yourusername/hexific-landing.git
   cd hexific-landing
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Run development server**

   ```bash
   npm run dev
   ```

4. **Open** [http://localhost:3000](http://localhost:3000)

---

## 📂 Project Structure

```
.
├── public/                  # Static assets (SVG icons, images, fonts)
│   ├── favicon.svg
│   ├── logo.svg
│   └── ...
├── src/
│   └── app/                 # Next.js App Router
│       ├── globals.css      # Global Tailwind imports
│       ├── layout.tsx       # Root layout (applies to all pages)
│       ├── page.tsx         # Main landing page (JSX entry)
│       ├── page.module.css  # Scoped CSS (if any)
│       └── page.html        # Original HTML reference (static)
├── .gitignore
├── LICENSE                  # MIT License
├── package.json
├── postcss.config.js        # Tailwind/PostCSS config
├── tailwind.config.js       # Tailwind configuration
└── README.md
```

---

## ⚙️ Deployment

Automatic deployments on Vercel:

1. Push to `main`.
2. Vercel triggers build and deploy.
3. Live at [https://hexific.com](https://hexific.com).

---

## 🤝 Contributing

Contributions welcome! Feel free to open issues or PRs:

* Bug fixes & improvements
* Accessibility enhancements
* New sections or translations

Please follow the [Contributor Covenant](https://www.contributor-covenant.org/) code of conduct.

---

## 📝 License

This project is licensed under the [MIT License](LICENSE).

---

## 📬 Contact

Built by **Febri Anjy Nirwana**.
Email: [febri@hexific.com](mailto:febri@hexific.com)
Twitter: [@hexific](https://twitter.com/hexific)

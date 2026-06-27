<div align="center">
  <img src="demo/image/logo.png" alt="Ruceriji Logo" width="120" />
</div>

<h1 align="center">Ruceriji (如厕日记) — Understand What Your Poop Is Telling You</h1>

<div align="center">
  <a href="https://ruceriji.com" target="_blank">
    <img src="https://img.shields.io/badge/Web-ruceriji.com-blue?style=flat-square" alt="Website" />
  </a>
  <img src="https://img.shields.io/badge/Framework-Vue3%20%7C%20uni--app%20%7C%20TypeScript-blue?style=flat-square" alt="Framework" />
  <img src="https://img.shields.io/badge/Platform-Android%20%7C%20iOS%20%7C%20WeChat-9cf?style=flat-square" alt="Platform" />
  <img src="https://img.shields.io/badge/License-Apache--2.0-green?style=flat-square" alt="License" />
  <br/>
  <strong>English</strong> · <a href="./README.md">简体中文</a>
</div>

<p align="center">
  <strong>Ruceriji (如厕日记)</strong> is a cross-platform health tracking app built with <strong>uni-app + Vue 3 + TypeScript</strong>. It helps users record, analyze, and understand their bowel movements through an intuitive interface, providing personalized health insights and AI-powered analysis to promote better gut health.
</p>

<p align="center">
  <b>Open Source · Privacy-First · Cross-Platform · Smart Analysis</b>
</p>

<p align="center">
  Download the <strong>Android</strong> / <strong>iOS</strong> app directly, or search for <strong>"如厕日记"</strong> in WeChat Mini Program to start using it instantly.
</p>

> **Open Source Notice**: This repository currently contains only the client-side source code. The backend service code is being prepared for open source release. The client supports packaging for <strong>Android</strong>, <strong>iOS</strong>, and <strong>WeChat Mini Program</strong> platforms.

---

## 🖼️ Screenshots

| WC Record | Calendar View |
|:---------:|:-------------:|
| <img src="demo/image/pages-wc.png" width="220" alt="WC Record" /> | <img src="demo/image/pages-calendar.png" width="220" alt="Calendar View" /> |
| One-tap timer · Multi-dimension logging · Health tips | Monthly overview · Color indicators · Trend tracking |

| User Profile | Achievements |
|:------------:|:------------:|
| <img src="demo/image/pages-member.png" width="220" alt="User Profile" /> | <img src="demo/image/pages-award-index.png" width="220" alt="Achievements" /> |
| Data dashboard · Privacy settings · Theme toggle | Milestone badges · Fun titles · Health trophies |

---

## ✨ Features

### 💩 Smart Recording & Timing

Start a timer with one tap when you visit the toilet, record the duration, and log detailed attributes. The app supports comprehensive data entry including time, duration, shape, color, consistency, and more.

### 📋 Comprehensive Attribute Classification

Classify your bowel movements across multiple dimensions:
- **Shape** — Bristol Stool Scale visualization
- **Color** — Color reference chart
- **Weight & Volume** — Approximate measurement
- **Consistency & Feel** — Subjective comfort assessment
- **Duration** — Track time spent

Each attribute comes with visual icons and educational tooltips to help users better understand their gut health signals.

### 📅 Calendar Timeline

A clean calendar view displays your daily records at a glance. Tap any date to review details, spot patterns, and track your bowel movement frequency over weeks and months.

- Monthly overview with record count per day
- Color-coded indicators for quick status recognition
- Quick-add for missed entries
- Swipe through months to review historical data

### 📊 Data Analysis & Charts

Visualize your gut health trends with interactive charts powered by uCharts:

- **Monthly frequency trends**
- **Shape distribution analytics**
- **Color variation tracking**
- **Duration statistics**
- **Weekly habit patterns**

Navigate to the analysis page from the calendar tab for deeper insights.

### 🤖 AI-Powered Health Insights

Each recorded entry can be analyzed by AI to generate personalized health insights:

- **Deep analysis** of stool characteristics
- **Personalized dietary & lifestyle suggestions**
- **Trend identification** and early warning signs
- **Natural language** explanations in plain terms

The AI analysis module (powered by integration with major AI providers) transforms raw data into actionable health advice.

### 🏆 Achievement System

Stay motivated with a gamified achievement system:

- **Usage milestones** — 7-day streak, 30-day streak, etc.
- **Record count badges** — 100, 500, 1000 records
- **Health improvement trophies**
- **Fun unlockable titles**

Achievements are auto-detected and celebrated with in-app animations.

### 👤 User Profile & Statistics

Your personal dashboard showing key metrics at a glance:

- **Days used** — Total active days
- **Total records** — Lifetime entry count
- **Estimated total weight** — Cumulative statistics
- **Height/Weight settings** — Personal health baseline

### 🔒 Privacy Protection

Your data is yours. The app provides:

- **Lock screen password** — App-level passcode protection
- **Biometric authentication** — Fingerprint / Face ID support
- **Local-first architecture** — Data processed on device
- **Privacy-first design** — No unnecessary data collection

### 🌙 Dark Mode

Support for **Light**, **Dark**, and **Follow System** themes for a comfortable experience day or night.

### 🌍 Internationalization

Built-in support for multiple languages with easy switching:

- **简体中文** (Simplified Chinese)
- **English**

---

## 📦 Download

| Platform | Link |
|----------|------|
| **Android** | [Download from App Store](https://sj.qq.com/appdetail/com.ruceriji) |
| **iOS** | Available on App Store |
| **WeChat Mini Program** | <img src="demo/image/qr-miniapp.png" width="120" alt="WeChat Mini Program QR Code" /><br/>Scan to use instantly, no install needed |

---

## 🚀 Development

> Tested with **Node.js 20** only.

```bash
# Clone the repository
git clone https://github.com/your-org/ruceriji-pro.git
cd ruceriji-pro

# Install dependencies
npm install

# Start development (H5 / Web preview)
npm run dev:h5

# Build for specific platforms
npm run build:mp-weixin      # WeChat Mini Program
npm run build:mp-alipay      # Alipay Mini Program
npm run build:h5             # H5 / Web
npm run build:app-android    # Android App
npm run build:app-ios        # iOS App

# Code quality
npm run lint                 # Lint check
npm run format               # Format with Prettier
```

### Available Development Commands

| Command | Description |
|---------|-------------|
| `npm run dev:h5` | Start H5 dev server |
| `npm run dev:mp-weixin` | WeChat Mini Program dev mode |
| `npm run dev:app` | App dev mode (Android/iOS) |
| `npm run build:custom` | Custom platform build |
| `npm run check` | Format + lint check |

## 💬 Join Group Chat

> When adding a friend, please leave a note: **Ruceriji**

| WeChat Group | QQ Group |
|:------------:|:--------:|
| <img src="https://open.tecmz.com/code_dynamic/wx" width="200" alt="WeChat Group" /> | <img src="https://open.tecmz.com/code_dynamic/qq" width="200" alt="QQ Group" /> |

---

## 📄 License

This project is licensed under the [Apache-2.0](./LICENSE) License.



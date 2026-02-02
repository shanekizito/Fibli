# Fibli 📚 -> ✨

> **AI-Powered Interactive Bedtime Stories**
> *Where Generative AI meets Native Mobile Experiences.*

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white) ![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB) ![Expo](https://img.shields.io/badge/Expo-1B1F23?style=for-the-badge&logo=expo&logoColor=white) ![Supabase](https://img.shields.io/badge/Supabase-181818?style=for-the-badge&logo=supabase&logoColor=3ECF8E)

Fibli is a production-grade React Native application that demonstrates the integration of **LLMs (OpenAI)** and **Generative Image Models (Stability AI)** into a seamless mobile user experience. It focuses on performance, type safety, and scalable architecture.

---

## 📱 Technical Highlights for Recruiters

This project showcases advanced mobile engineering capabilities:

### **1. Architecture & Design Patterns**
- **Feature-First Architecture**: Codebase organized by domain features (`src/features/story`, `src/features/library`) rather than technical layers, enabling scalable team development.
- **Service Layer Abstraction**: API integrations (OpenAI, Supabase) are decoupled from UI components via a dedicated service layer, adhering to **SoC (Separation of Concerns)**.
- **Custom Hooks**: Business logic is extracted into re-usable hooks (`useStoryConfig`, `usePurchase`), keeping views pure and testable.

### **2. Performance & user Experience**
- **Optimized Rendering**: Utilization of **FlashList** (via `@shopify/flash-list`) for performant list rendering (60FPS scrolling).
- **Image Optimization**: Custom caching strategy for AI-generated images using file system access to minimize bandwidth and latency.
- **Deep Linking**: Full integration with **Expo Router** for handling universal links and state restoration.

### **3. Native Integration & Monetization**
- **In-App Purchases (IAP)**: Robust implementation of subscription models using `react-native-iap`, handling receipt validation and subscription lifecycle states securely.
- **Haptics & Gestures**: Enhanced UX with haptic feedback (`expo-haptics`) and fluid gestures (`react-native-gesture-handler`) for a tactile feel.

### **4. Security & Compliance**
- **Environment Management**: Strict separation of secrets using `process.env` and strict TypeScript configuration to prevent accidental leaks.
- **Row Level Security (RLS)**: Supabase database configured with RLS policies to ensure users can only access their own private data.

---

## 🛠 Tech Stack

| Category | Technology | Rationale |
|----------|------------|-----------|
| **Core** | React Native (Expo SDK 52) | Rapid cross-platform development with native module support via Config Plugins. |
| **Language** | TypeScript (Strict) | Enterprise-grade type safety; zero `any` policy. |
| **Navigation** | Expo Router (v3) | File-system-based routing with deep linking capabilities out of the box. |
| **State** | React Context + Hooks | Lightweight state management sufficient for current complexity; easily scalable to Zustand/Jotai. |
| **Backend** | Supabase | Managed Postgres/Auth providing real-time capabilities and instant APIs. |
| **AI** | OpenAI GPT-4o + Stability AI | State-of-the-art generation for text and visuals. |

---

## 🏗 Directory Structure

```bash
src/
├── app/                  # Expo Router file-based navigation
├── components/           # Atomic, reusable UI components (Buttons, Inputs)
├── feature/              # Domain-specific logic (Library, StoryGenerator)
├── services/             # External API clients (Singleton pattern)
├── hooks/                # Global custom hooks (Auth, Theme)
├── config/               # Environment and constants configuration
└── utils/                # Pure helper functions
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- iOS Simulator (Xcode) or Android Emulator (Android Studio)

### Installation

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/shanekizito/Fibli
    cd fibli
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Environment Setup**:
    Create a `.env` file in the root directory:
    ```bash
    cp .env.example .env
    ```
    *See `.env.example` for required keys (Supabase, OpenAI, Stability AI).*

4.  **Run the application**:
    ```bash
    npx expo start
    ```

---

## 🔮 Future Improvements

- **Offline Mode**: Implement `TanStack Query` (React Query) for robust offline caching and optimistic updates.
- **Testing**: Add unit tests via **Jest** and integration tests using **Maestro** flow.
- **CI/CD**: Setup **GitHub Actions** for automated linting and **EAS Build** for preview channels.

---

## 📜 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

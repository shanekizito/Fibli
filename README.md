# Fibli 📚

> **AI-Powered Bedtime Stories for Kids**
> *Magical stories, illustrated instantly.*

Fibli is a React Native application that uses advanced AI to generate personalized bedtime stories for children. It combines OpenAI's storytelling capabilities with Stability AI's image generation to create immersive, illustrated narratives on demand.

---

## 🛠 Tech Stack

### Core
- **React Native (Expo)**: Managed workflow for cross-platform support.
- **TypeScript**: Statically typed for reliability.
- **Expo Router**: File-based routing.

### AI & Services
- **OpenAI (GPT-4o)**: Generates age-appropriate story content and characters.
- **Stability AI**: Creates Pixar-style 3D illustrations for each chapter.
- **Supabase**: Handles database, storage (images), and authentication state.

### Monetization
- **In-App Purchases (IAP)**: Subscription model for unlimited story generation.

---

## 🏗 Architecture

The project is organized to separate concerns clearly:

```
src/
├── app/            # Navigation & Screens
├── components/     # Reusable UI elements
├── services/       # External API integrations
│   ├── config.ts   # Centralized configuration
│   ├── openai.ts   # Story generation logic
│   ├── stability.ts# Image generation logic
│   └── supabase.ts # Data persistence
└── hooks/          # Custom business logic hooks
```

### Key Features
- **Personalized Stories**: Customizable by age, mood, and length.
- **Dynamic Illustrations**: AI-generated images for every chapter.
- **Library Management**: Save and re-read favorite stories.
- **Secure Architecture**: Centralized secret management and strict typing.

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js & npm
- Expo CLI (`npm install -g expo-cli`)

### 2. Installation

```bash
git clone https://github.com/shanekizito/Fibli
cd fibli
npm install
```

### 3. Configuration

Fibli requires several API keys to function. 

1.  **Environment File**:
    ```bash
    cp .env.example .env
    ```

2.  **Required Credentials**:
    - **OpenAI**: Get an API Key from [platform.openai.com](https://platform.openai.com).
    - **Stability AI**: Get an API Key from [platform.stability.ai](https://platform.stability.ai).
    - **Supabase**: Create a project at [supabase.com](https://supabase.com) and get your URL and Anon Key.

### 4. Running the App

```bash
npx expo start
```

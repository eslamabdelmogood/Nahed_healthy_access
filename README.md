# 🎗️ Nahed Health Access Engine
**Empowering Cancer Patients with Gemini 3 Flash & ElevenLabs AI Voice Assistance.**

---

## 🌟 Inspiration
Nahed is a tribute to my mother, who fought cancer. During her journey, we realized the diagnosis is only half the struggle; the other half is navigating the complex maze of treatment costs and clinical logistics. This project bridges that "Information Gap" to ensure no patient faces the silence of not knowing their next step.

## 🚀 Key Features
- **Intelligent Medical Roadmap:** Automatically transforms complex medical reports into a structured patient care plan.
- **AI Voice Assistant (ElevenLabs):** A human-like voice navigator that reads the roadmap aloud, ensuring accessibility for elderly or visually impaired patients.
- **Financial Matching:** Uses Gemini 3 to match patient profiles with Egyptian health initiatives (like 100 Million Seha) and NGOs.
- **Multilingual Support:** Seamlessly switches between English and localized Arabic for patient comfort.

## 🛠️ Technological Stack
- **AI Engine:** Google Gemini 3 Flash (via Vertex AI / AI Studio) for high-speed, structured reasoning.
- **Voice Synthesis:** ElevenLabs Multilingual v2 for empathetic, natural speech.
- **Frontend:** React + Tailwind CSS (Prototyped with v0.dev).
- **Deployment:** Firebase Hosting (Google Cloud Infrastructure).
- **CI/CD:** Automated deployment via GitHub Actions.

## 📂 Project Architecture (Next.js & React)
To ensure scalability and clean code, the project is structured as follows:

- **`/app`**: Contains the core logic and routing (using Next.js App Router).
- **`/components`**: Reusable UI components including the `VoiceAssistant`, `RoadmapCard`, and `Navigation`.
- **`/hooks`**: Custom React hooks for managing ElevenLabs audio states and Gemini 3 data fetching.
- **`/lib`**: Utility functions for parsing medical JSON and connecting to Google Cloud/ElevenLabs APIs.
- **`/public`**: Static assets, brand icons, and localized voice samples.
- **`/styles`**: Tailwind CSS configurations for a modern, accessible medical UI.

  
## ⚙️ How to Run Locally
1. Clone the repository: `git clone [YOUR_REPO_URL]`
2. Install dependencies: `npm install`
3. Start the development server: `npm run dev`

## 🌍 Impact
Nahed reduces the **Time-to-Treatment (TTT)** by automating the search for funding and logistics, which is a critical factor in cancer survival rates globally.

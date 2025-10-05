# Simulateur LMNP - Micro-BIC vs Réel
https://take-at-home.vercel.app

## Table des matières
1. [Stack](#1-stack)
2. [Structure du projet](#2-structure-du-projet)
3. [Installation et Développement](#3-installation-et-développement)
4. [Autres informations utiles pour la compréhension](#4-autres-informations-utiles-pour-la-compréhension)

## 1. Stack
- **Framework & Core** : Next.js, React, Typescript
- **State Management** : zustand
- **UI & Styling** : tailwindcss, shadcn/ui
- **IA** : génération de texte et STT via Openai API, avec la base url de Groq

## 2. Structure du Projet
Globalement on a :
- `app/` : définition du router frontend et des routes API Next.js
- `components/` : Composants React d'UI
- `styles/` : styles CSS tailwind
- `hooks/` : Hooks pour l'enregistrement audio (STT)
- `stores/` : Stores pour stocker les messages du chat et les données extraites du client
- `services/` : gère les communications entre API et client
- `types/` : types pour l'api, les chat et les simulations
- `lib/` : logique des API + prompts + utilitaires
- `__tests__/` : tests du service de simulation
- `env.js` : validation des variables d'environnement

### Structure complète
```
src/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes
│   │   ├── chat/                 # Endpoint de chat avec streaming
│   │   │   └── route.ts
│   │   └── transcribe/           # Endpoint de transcription audio
│   │       └── route.ts
│   ├── layout.tsx                # Layout racine
│   └── page.tsx                  # Page d'accueil
│
├── components/                   # Composants React
│   ├── chat/                     # Composants du chat
│   │   ├── chat-container.tsx    # Container principal du chat
│   │   ├── chat-input.tsx        # Input avec audio/texte
│   │   ├── markdown-renderer.tsx # Rendu des messages markdown
│   │   ├── message-bubble.tsx    # Bulle de message
│   │   ├── message-list.tsx      # Liste des messages
│   │   └── message-suggestions.tsx # Suggestions de démarrage
│   ├── simulation/               # Composants de simulation
│   │   ├── comparison-table.tsx  # Tableau comparatif Micro-BIC vs Réel
│   │   ├── simulation-chart.tsx  # Graphique d'évolution
│   │   └── simulation-sheet.tsx  # Panel latéral de simulation
│   └── ui/                       # Composants UI génériques (shadcn)
│       ├── button.tsx
│       ├── card.tsx
│       ├── input.tsx
│       └── ...
│
├── services/                     # Couche de services (logique métier)
│   ├── chat.service.ts          # Gestion des appels API chat
│   ├── simulation.service.ts    # Calculs de simulation LMNP
│   ├── transcription.service.ts # Service de transcription audio
│   └── index.ts                 # Point d'entrée centralisé
│
├── stores/                       # State management (Zustand)
│   ├── chat.store.ts            # Store du chat et messages
│   ├── property.store.ts        # Store des données d'investissement
│   └── index.ts                 # Exports centralisés
│
├── hooks/                        # Hooks React personnalisés
│   ├── use-audio-recorder.ts    # Hook d'enregistrement audio
│   └── index.ts                 # Exports centralisés
│
├── types/                        # Types et schémas TypeScript
│   ├── chat.types.ts            # Types du chat
│   ├── simulation.types.ts      # Types de simulation
│   ├── api.types.ts             # Types API
│   └── index.ts                 # Point d'entrée centralisé
│
├── lib/                          # Utilitaires et fonctions helpers
│   ├── chat.ts                  # Logique de traitement du chat
│   ├── openai.ts                # Client OpenAI
│   ├── json-extractor.ts        # Extraction et validation JSON
│   ├── utils.ts                 # Utilitaires généraux
│   └── prompts/                 # Prompts LLM
│       ├── chat-response.ts     # Prompt pour réponses conversationnelles
│       ├── extract-json.ts      # Prompt pour extraction de données
│       └── fix-json.ts          # Prompt pour correction JSON
│
├── __tests__/                    # Tests unitaires
│   ├── setup.ts                 # Configuration Vitest
│   └── services/
│       └── simulation.service.test.ts
│
├── styles/
│   └── globals.css              # Styles globaux
│
└── env.js                        # Validation des variables d'environnement
```

## 3. Installation et Développement

### Prérequis

- Node.js 20+
- pnpm 10+
- une clé API pour un provider de LLM 

### Installation

```bash
pnpm install
pnpm dev
```

### Configuration
Compléter les variables d'environnement. J'ai utilisé Groq car API gratuite et super rapide (idéal pour le STT et l'extraction de données), mais pour utiliser un autre provider, il suffit de remplacer la base url.

OPENAI_API_BASE_URL         -> Modèle de réponse dans le chat
OPENAI_API_EXTRACT_BASE_URL -> Modèle d'extraction de données
OPENAI_API_AUDIO_BASE_URL   -> Modèle pour le STT

```bash
#src/.env
OPENAI_API_BASE_URL=https://api.groq.com/openai/v1
OPENAI_API_EXTRACT_BASE_URL=https://api.groq.com/openai/v1
OPENAI_API_AUDIO_BASE_URL=https://api.groq.com/openai/v1
OPENAI_API_KEY=
OPENAI_API_AUDIO_KEY=
OPENAI_API_EXTRACT_KEY=
EXTRACT_MODEL_NAME=openai/gpt-oss-120b
MODEL_NAME=meta-llama/llama-4-scout-17b-16e-instruct
```
> Par défaut, whisper-large-v3-turbo comme STT model.


# 4. Autres informations utiles pour la compréhension

## Flux de Données

```
User Input → Store (Zustand) → Service → API → OpenAI → Stream → Store → UI
```

## Description des dépendances

Pour l'UI avec shadc/ni :
- "@radix-ui/react-avatar": "^1.1.10",
...
- "@radix-ui/react-slot": "^1.2.3",
- "sonner": "^2.0.7", // Pour les toasters

Pour le cache des query :
- "@tanstack/react-query": "^5.69.0",

Pour le styling :
- "class-variance-authority": "^0.7.1",
- "clsx": "^2.1.1",
- "tailwind-merge": "^3.3.1",
- "lucide-react": "^0.544.0",

Next et React :
- "next": "^15.2.3",
- "next-themes": "^0.4.6",
- "react": "^19.0.0",
- "react-dom": "^19.0.0",
- "server-only": "^0.0.1",

Pour l'affichage markdown des messages du chat :
- "react-markdown": "^10.1.0",
- "react-syntax-highlighter": "^15.6.6",
- "remark-gfm": "^4.0.1",

Pour l'affichage des charts :
- "recharts": "^3.2.1"

Le reste :
- "openai": "^6.1.0",
- "dotenv": "^17.2.3",
- "zod": "^3.24.2",
- "zustand": "^5.0.8"

# Ce qui aurait pu être fait/amélioré
- Utiliser gpt-5 pour la réponse de chat
# Bibliothèque de fonctions Chat avec OpenAI

Cette bibliothèque fournit des fonctions pour interagir avec l'API OpenAI dans le cadre de conversations chat avec extraction de contexte et streaming.

## Structure

```
src/
├── types/
│   └── index.ts             # Schémas Zod et types TypeScript inférés
├── lib/
│   ├── prompts/             # Prompts système pour OpenAI
│   │   ├── extract-json.ts      # Prompt pour extraire le contexte JSON
│   │   ├── chat-response.ts     # Prompt pour générer la réponse
│   │   └── fix-json.ts          # Prompt pour corriger un JSON malformé
│   ├── openai.ts            # Client et fonctions OpenAI de base
│   ├── json-extractor.ts    # Extraction et parsing JSON avec retry
│   └── chat.ts              # Fonctions principales d'orchestration
└── server/api/routers/
    └── chat.ts              # Router tRPC pour les procédures de chat
```

## Fonctionnalités

### 1. Client OpenAI (`openai.ts`)

- **`getOpenAIClient()`**: Obtient un client OpenAI singleton
- **`callGPT()`**: Appelle GPT avec des messages (non-streaming)
- **`callGPTStream()`**: Appelle GPT en mode streaming

### 2. Extraction JSON (`json-extractor.ts`)

- **`extractJsonBlock(text)`**: Extrait un bloc JSON d'un texte contenant \`\`\`json...\`\`\`
- **`parseJson(jsonString)`**: Parse une chaîne JSON
- **`extractAndParseJson(text, maxRetries)`**: Extrait et parse avec retry automatique
  - Si l'extraction ou le parsing échoue, demande à GPT-4o-mini de reformater le JSON
  - Jusqu'à 3 tentatives par défaut

### 3. Orchestration Chat (`chat.ts`)

#### `extractContextFromMessages(messages)`

Extrait le contexte structuré d'une conversation :

```typescript
const context = await extractContextFromMessages([
  { role: "user", content: "Je cherche un bon restaurant italien" }
]);

// Retourne:
// {
//   topic: "restaurants",
//   intent: "recherche de recommandation",
//   entities: ["restaurant", "italien"],
//   sentiment: "neutre",
//   context: "Recherche de restaurant italien"
// }
```

#### `generateStreamingResponse(messages, context)`

Génère une réponse en streaming basée sur le contexte :

```typescript
for await (const chunk of generateStreamingResponse(messages, context)) {
  console.log(chunk); // Affiche chaque morceau de la réponse
}
```

#### `processChatMessages(messages)`

Fonction principale qui combine les deux étapes :

```typescript
for await (const result of processChatMessages(messages)) {
  if (result.type === "context") {
    console.log("Contexte extrait:", result.data);
  } else if (result.type === "chunk") {
    console.log("Chunk de réponse:", result.data);
  }
}
```

## Utilisation via tRPC

### Router Chat (`server/api/routers/chat.ts`)

Le router tRPC expose une procédure `processMessages` qui :

1. Prend une liste de messages en entrée
2. Extrait le contexte JSON via GPT-4o
3. Stream la réponse basée sur ce contexte
4. Envoie le contexte JSON à la fin

#### Exemple d'utilisation côté client

```typescript
// Utilisation avec tRPC subscription
const subscription = api.chat.processMessages.useSubscription(
  {
    messages: [
      { role: "user", content: "Bonjour, comment ça va?" }
    ]
  },
  {
    onData: (data) => {
      if (data.type === "context") {
        console.log("Contexte:", data.data);
      } else if (data.type === "chunk") {
        // Ajouter le chunk à la réponse affichée
        appendToResponse(data.data);
      } else if (data.type === "done") {
        console.log("Réponse terminée");
      }
    },
    onError: (error) => {
      console.error("Erreur:", error);
    }
  }
);
```

## Configuration requise

### Variables d'environnement

Ajouter dans `.env` (je suppose que c'est bien configuré) :

```env
OPENAI_API_KEY=sk-...
```

## Modèles utilisés

- **GPT-4o** : Extraction de contexte et génération de réponse (précision maximale)
- **GPT-4o-mini** : Correction de JSON malformé (plus rapide et économique pour cette tâche simple)

## Flux de données

```
Messages utilisateur
    ↓
[1. Extraction de contexte]
    → GPT-4o avec prompt extract-json
    → Extraction du bloc ```json```
    → Si échec : GPT-4o-mini corrige le JSON
    ↓
Contexte JSON
    ↓
[2. Génération de réponse]
    → GPT-4o avec contexte + prompt chat-response
    → Streaming de la réponse
    ↓
Réponse + Contexte JSON
```

## Gestion des erreurs

- Retry automatique pour l'extraction JSON (jusqu'à 3 tentatives)
- Erreurs explicites avec messages détaillés
- Gestion des erreurs de streaming
- Validation des schémas avec Zod au niveau tRPC

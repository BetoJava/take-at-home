## Interface :
- Chat qui pose des question et met à jour en direct la comparaison. Dès qu'il a assez d'informations pour afficher le ROI estimé, le fait
- un bouton contacter


## Charts :
- Tableau Micro-BIC vs Réel : Revenu imposable, impôt estimé -> Réel vous ferait économiser X par an
- ROI sur durée de l'emprunt 
    - Courbe 
        - abscisse : Années 1 -> durée de détention
        - ordonnée : ROI cumulé (%)
        - Deux courbes : Micro-BIC et Réel
    - Barres : Cashflow net cumulé
    - Indicateurs : Économie d'impôts annuel et totale + Cashflow net annuel


## Micro-BIC
revenu_imposable = loyers_annuels × (1 - 0.5)
## Réel
revenu_imposable = loyers_annuels - charges_annuelles - prix_achat × 0.03
revenu_imposable = loyers_annuels
                   - charges_annuelles
                   - interets_emprunt
                   - (prix_achat × 0.03)


## Données à récupérer :
Principales :
- purchasePrice
- monthlyRent
- annualCharges
- projectedDuration

Structure :
```ts
type LmnpSimulationData = {
  // Property
  purchasePrice: number | null; // à demander
  // Loan
  loanAmount?: number; // à demander, sinon considéré payé cash
  loanRate?: number; // 0.035 si 15 ans, 0.039 si 20 ans
  loanDuration?: number; // à demander
  downPayment?: number; // utile seulement pour déduire loanAmount à partir du purchasePrice ou l'inverse

  // Income & Expenses
  monthlyRent: number | null; // à demander
  occupancyRate?: number | null; // si donné, sinon 100% 
  expenses: { // Permet de calculer charges annuelles et l'amortissement
    annualExpenses: list<tuple<string, int>>;
    monthlyExpenses: list<tuple<string, int>>;
    renovationCosts?: number | null; // si données
    furnitureValue?: number | null; // si données
  } 

  // Simulation
  projectionDuration?: number; // slider, entre 5 et 25 ans, 10 ans de base
  rentIncreaseRate?: number; // 1.5% à voir si je garde
};
```

## Modules
- pas de db, ni auth
- stockage en context
- chat avec streaming + right sheet avec informations calculées + inputs utilisateur (slider durée projet)

## Prompts (avec garde fou)
Commencer avec groq pour la rapidité et moins d'intelligence, puis passer à gpt-5.
1. Prompt pour extraire les informations depuis la conversation sous forme JSON + retry
2. Prompt pour répondre à l'utilisateur en streaming

## Process
1. L'utilisateur décrit son projet
2. Une fois le message envoyé, l'interface affiche un loader qui explique que l'IA réfléchie
3. L'IA extrait les informations et en déduit une réponse où il peut poser des questions pour récupérer des informations manquantes
4. Lorsque les données suffisantes sont disponibles, on met à jour l'affichage de la sheet à droite. A chaque modification des données, elle est recalculée.

5. L'utilisateur clique sur le bouton d'enregistrement, enregistre et termine l'enregistrement.
6. Enregistrement traité par whisper avant d'être envoyé dans le flux classique.
7. (optionel) Si on appuie sur le bouton "Lire à haute voix" sous le message de l'IA, on utilise un TTS pour lire le message, et on sauvegarde en mémoire le mp3 associé.

# Durées
- (1h13) compréhension du problème et spécifications
- (8min) setup project (next, trpc, tailwindcss, shadcn/ui)
- (8min) définition et organisation des tâches
- (39min) todo
# Todo
Backend
- [x] Récupérer clés API (6min)
- [x] Écrire les prompts (28min)
- [ ] définir les procédures
    - [ ] réponse à un message (json extract + response + validation ?) (20)
    - [ ] réponse à un message par voix
    - [ ] génération de l'audio


Frontend
- [ ] créer un composant de chat modulaire avec contexte, gérant le streaming 
- [ ] créer la sheet latérale
    - [ ] Inputs
    - [ ] Tableau Micro-BIC vs Réel
    - [ ] Courbe ROI


Après
- [ ] remplacer env.js

Améliorations : 
- [ ] Mieux formatter les messages dans le prompt



# Liste des prompts donnés à Crusor/Claude-4.5 :
1. Création de la procédure de réposne
```md
Créer dans lib, les fonctions qui seront utilisées dans les procédures trpc.

Une première procédure qui prend "messages" et qui :
1. appelle la lib openai, gpt-5, à partir d'un prompt défini dans lib/prompts/ qui intègre les messages de l'utilisateur. La sortie sera du texte et il faudra créer une fonction externe qui extrait le block "```json" de ce texte, avec un retry : si le parse échou, demander à gpt-5-mini de reformatter correctement le json.
2. Une fois le json récupéré, on le donne, ainsi qu'un prompt et la liste des messages, à gpt-5, qui doit répondre en streaming. Une fois la réponse terminée, il faut envoyer le json généré.
```
2. 
```md

```
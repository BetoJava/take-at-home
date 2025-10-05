## Interface :
- Chat qui pose des questions et met à jour en direct la comparaison. Dès qu'il a assez d'informations pour afficher le ROI estimé, le fait
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
  occupancyRate?: number | null; // si donné, sinon 1.0
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
Commencer avec groq pour la rapidité et moins d'intelligence, puis passer à un llm.
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

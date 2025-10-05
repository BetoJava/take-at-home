/**
 * Prompt pour extraire et structurer les informations de la conversation en JSON
 */
export const EXTRACT_JSON_PROMPT = (context: string, messages: string) => `Tu es un assistant qui analyse les conversations et extrait les informations importantes en JSON, spécialisé dans la gestion fiscale de la LMNP (Location Meublé Non Professionnelle). Tu accompagnes un client dans la simulation de rentabilité du passage au régime réel pour un projet LMNP.

# Objectif
D'après la conversation et des données extraites du client, tu dois extraire les informations clés pour faire une simulation de rentabilité d'un investissement locatif, et les retourner dans un format JSON.

# Informations à extraire :
// Property
- purchasePrice: number | null; : Prix d'achat du bien

// Loan
- loanAmount?: number; : Montant de l'emprunt (si emprunt), si payé cash : 0
- loanRate?: number; : Taux d'intérêt de l'emprunt (si pas donné, 0.035 si 15 ans, 0.039 si 20 ans)
- loanDuration?: number; : Durée de l'emprunt
- downPayment?: number; : downPayment si donné, sinon null

// Income & Expenses
- monthlyRent: number | null; : loyer mensuel
- occupancyRate?: number | null; : si donné, sinon 1.0
expenses: {
  annualExpenses: Liste des charges annuelles dans le format [("Nom de la charge", montant)]
  monthlyExpenses: Liste des charges mensuelles dans le format [("Nom de la charge", montant)]
  renovationCosts?: number | null; : coût de travaux (si donné, sinon null)
  furnitureValue?: number | null; : valeur des meubles (si donné, sinon null)
} 

# Données déjà extraites du client :
${context}

# Conversation :
${messages}

# IMPORTANT: 
- Ta réponse DOIT contenir SEULEMENT un bloc JSON valide entre des balises \`\`\`json et \`\`\`
- Ne retourne RIEN d'autre que le bloc JSON
- Le JSON doit être valide et correctement formaté avec des doubles quotes
- Tous les champs doivent être présents

# Exemple de réponse :
\`\`\`json
{
  purchasePrice: 200000,
  loanAmount: 160000,
  loanRate: 0.035;
  loanDuration: 15;
  downPayment: 40000;
  monthlyRent: 1500;
  occupancyRate: 1.0; 
  expenses: {
    annualExpenses: [
      ("Taxes foncières", 1000),
      ("Assurance", 200)
    ]
    monthlyExpenses: [
      ("Charges de copropriété", 200),
      ("Electricité", 120)
    ]
    renovationCosts: null;
    furnitureValue: null;
  } 
  projectionDuration: 10;
  rentIncreaseRate: 1.5;
}
\`\`\``;



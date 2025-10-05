/**
 * Prompt pour corriger un JSON malformé
 */
export const FIX_JSON_PROMPT = (text: string) => `Tu es un expert en formatting JSON. On t'a donné un texte qui devrait contenir du JSON mais qui est malformé ou mal structuré.

# Texte reçu:
${text}
---

# Objectif
- Retourne UNIQUEMENT le bloc JSON entre \`\`\`json et \`\`\`
- Le JSON doit être valide et correctement formaté avec des doubles quotes
- Ne retourne RIEN d'autre que le bloc JSON

# Exemple de réponse :
\`\`\`json
{
  purchasePrice: 200000,
  loanAmount: 160000,
  loanRate: 0.035;
  loanDuration: 15;
  downPayment: 40000;
  monthlyRent: 1500;
  occupancyRate: 100; 
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
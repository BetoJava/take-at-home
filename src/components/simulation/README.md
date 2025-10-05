# Composants de simulation LMNP

Ce dossier contient les composants pour afficher la simulation de l'investissement LMNP (Loueur Meublé Non Professionnel).

## Composants

### `simulation-sheet.tsx`
Sheet latéral principal qui contient :
- Un slider pour ajuster la durée de détention (5-25 ans)
- L'affichage des données du projet (prix d'achat, loyer, emprunt)
- Le tableau de comparaison Micro-BIC vs Réel
- Les graphiques ROI et cashflow
- Les indicateurs clés d'économies fiscales

### `comparison-table.tsx`
Tableau comparatif affichant pour la première année :
- Revenus locatifs
- Revenu imposable
- Impôt estimé
- Cashflow net
- La différence entre les deux régimes

### `simulation-chart.tsx`
Graphiques Recharts affichant :
- **ROI Cumulé (%)** : Évolution du retour sur investissement en ligne
- **Cashflow Net Cumulé (€)** : Évolution du cashflow en barres

## Fonctionnement

1. Les données sont extraites de la conversation via le context `PropertyInvestmentContext`
2. Quand des données minimales sont disponibles (prix d'achat + loyer), la simulation s'affiche
3. L'utilisateur peut ajuster la durée de détention avec le slider
4. Les calculs sont effectués via `lib/simulation.ts`
5. Les graphiques et tableaux se mettent à jour automatiquement

## Formules

### Micro-BIC
```
revenu_imposable = loyers_annuels × 0.5 (abattement 50%)
```

### Régime Réel
```
revenu_imposable = loyers_annuels
                   - charges_annuelles
                   - intérêts_emprunt
                   - amortissement (3% du prix d'achat + travaux/meubles)
```

## Dépendances
- `recharts` pour les graphiques
- shadcn/ui pour les composants UI
- `lib/simulation.ts` pour les calculs

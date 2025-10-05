
# Durées
- (1h13) compréhension du problème et spécifications
- (8min) setup project (next, trpc, tailwindcss, shadcn/ui)
- (8min) définition et organisation des tâches
- (39min) todo
# Todo
Backend
- [x] Récupérer clés API (6min)
- [x] Écrire les prompts (28min)
- [x] définir la procédure principale
    - [x] réponse à un message (json extract + response + validation ?) (26)

Frontend (43)
- [x] créer un composant de chat modulaire avec contexte, gérant le streaming (10min)
- [x] créer la sheet latérale (33)
    - [x] données de base
    - [x] Tableau Comparaison des régimes fiscaux
    - [x] Courbe d'Évolution des impôts cumulés
    
Features
- [x] réponse à un message par voix
- [ ] génération de l'audio 


Améliorations : 
- [ ] Mieux formatter les messages dans le prompt



# Liste des prompts donnés à Crusor/Claude-4.5 :
1. Création de la procédure de réponse
```md
Créer dans lib, les fonctions qui seront utilisées dans les procédures trpc.

Une première procédure qui prend "messages" et qui :
1. appelle la lib openai, un llm, à partir d'un prompt défini dans lib/prompts/ qui intègre les messages de l'utilisateur. La sortie sera du texte et il faudra créer une fonction externe qui extrait le block "```json" de ce texte, avec un retry : si le parse échou, demander à un llm de reformatter correctement le json.
2. Une fois le json récupéré, on le donne, ainsi qu'un prompt et la liste des messages, à un llm, qui doit répondre en streaming. Une fois la réponse terminée, il faut envoyer le json généré.
```
2. 
```md
Bien, maintenant créer la procédure de réponse à un message (json extract + response)
```
3. 
```md
Au lieu d'avoir 2 fichiers, je veux un seul fichiers de types, dans src/types/index.ts qui utilise zod, et infère le type à partir du schema zod. @types.ts @chat.ts 
```

4. 
```md
Frontend
- [ ] créer un composant de chat modulaire avec contexte, gérant le streaming 
- [ ] créer la sheet latérale
    - [ ] Inputs
    - [ ] Tableau Micro-BIC vs Réel
    - [ ] Courbe ROI

Créer ce frontend :
- utilise shadcnui, et les couleurs définies dans @globals.css
- utilise les procédures @chat.ts et les composants dans @chat/ ainsi que le context du chat.
- créer un context pour stocker les données extraites de la conversation de type PropertyInvestmentData
- initialise les contexts à la racine layout

Pour construire le front end, tu trouveras les spécifications dans  :
@README.md ```

5.
```md
Il me faut un bouton dans l'input du chat pour pouvoir l'écouter plutôt que de le faire écrire. Pour ça, il faut :
- créer un bouton avec icon audio qui lance l'enregistrement en mono, max 20kHz. Lors de l'enregistrement, changer l'icone avec un carré pour arrêter l'enregistrement (max 1min)
- quand l'enregistrement est terminé, envoyer le flux audio à une procédure qui va transcrire l'audio puis appeler "processChatMessages"
- créer une fonction dans lib pour transformer l'audio en texte avec l'api d'openai, et la base url "OPENAI_API_AUDIO_BASE_URL", en utilisant le modèle whisper. ```
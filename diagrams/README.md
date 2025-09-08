# Diagrammes de Classes - Application de Transfert d'Argent

Ce dossier contient plusieurs diagrammes Mermaid qui décrivent l'architecture et la structure de données de l'application de transfert d'argent.

## Fichiers de Diagrammes

### 1. `class-diagram.md` - Diagramme Complet

Diagramme de classes détaillé incluant :

- Toutes les entités avec attributs complets
- Méthodes principales de chaque classe
- Énumérations (UserRole, TransferStatus, etc.)
- Classes de service (PaymentService, NotificationService, etc.)
- Classes d'audit et de monitoring
- Relations complètes avec multiplicités

### 2. `simplified-class-diagram.md` - Diagramme Simplifié

Version simplifiée se concentrant sur :

- Entités principales uniquement
- Attributs essentiels
- Relations importantes avec multiplicités
- Explications détaillées pour chaque entité

### 3. `entity-relationship-diagram.md` - Diagramme ERD

Représentation de la base de données :

- Structure des tables avec types de données
- Clés primaires et étrangères
- Contraintes et index
- Énumérations au niveau base de données

### 4. `multiplicities-diagram.md` - Diagramme des Multiplicités

Focus sur les relations et cardinalités :

- Relations clairement annotées
- Multiplicités détaillées (1:1, 1:N, etc.)
- Règles métier importantes
- Contraintes de domaine

## Entités Principales

### User

- **Rôle** : Entité centrale du système
- **Types** : CLIENT, ADMIN, MADAGASCAR_TEAM
- **Relations** : 1:N avec Beneficiary, Subscription, Transfer, Notification

### Beneficiary

- **Rôle** : Destinataires des transferts à Madagascar
- **Contrainte** : Obligatoirement au Madagascar
- **Relations** : N:1 avec User, 1:N avec Transfer et Subscription

### Subscription

- **Rôle** : Transferts récurrents automatisés
- **Intégration** : Stripe pour les paiements récurrents
- **Relations** : N:1 avec User et Beneficiary, 1:N avec Transfer

### Transfer

- **Rôle** : Transaction financière principale
- **Types** : ONE_TIME ou SUBSCRIPTION
- **Relations** : N:1 avec User, Beneficiary, et optionnellement Subscription

## Multiplicités Importantes

| Relation                | Multiplicité | Description                                             |
| ----------------------- | ------------ | ------------------------------------------------------- |
| User → Beneficiary      | 1:N          | Un utilisateur peut avoir plusieurs bénéficiaires       |
| User → Subscription     | 1:N          | Un utilisateur peut créer plusieurs abonnements         |
| User → Transfer         | 1:N          | Un utilisateur peut initier plusieurs transferts        |
| Beneficiary → Transfer  | 1:N          | Un bénéficiaire peut recevoir plusieurs transferts      |
| Subscription → Transfer | 1:N          | Un abonnement génère plusieurs transferts dans le temps |

## Règles Métier

1. **Sécurité** : Chaque action importante est auditée dans `AuditLog`
2. **Géographie** : Tous les bénéficiaires sont à Madagascar
3. **Paiements** : Intégration Stripe pour les paiements et abonnements
4. **Automatisation** : Les abonnements ACTIVE génèrent automatiquement des transferts
5. **Rôles** : Permissions différenciées selon le rôle utilisateur

## Comment Visualiser

Pour visualiser ces diagrammes, vous pouvez utiliser :

1. **GitHub/GitLab** : Rendu automatique des diagrammes Mermaid dans les fichiers Markdown
2. **VS Code** : Extension "Mermaid Markdown Syntax Highlighting"
3. **Mermaid Live Editor** : https://mermaid.live/ (copier le contenu des blocs mermaid)
4. **Extension VS Code** : "Markdown Preview Mermaid Support"
5. **Confluence/Notion** : Support natif des diagrammes Mermaid

## Technologies Utilisées

- **Base de Données** : PostgreSQL avec Prisma ORM
- **Paiements** : Stripe (PaymentIntents et Subscriptions)
- **Authentication** : NextAuth.js
- **Framework** : Next.js 14 avec TypeScript
- **UI** : Tailwind CSS avec shadcn/ui

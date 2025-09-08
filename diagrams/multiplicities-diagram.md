# Diagramme des Multiplicités - Application de Transfert d'Argent

```mermaid
classDiagram
    class User {
        +String id
        +String email
        +String name
        +UserRole role
        +UserStatus status
    }

    class Beneficiary {
        +String id
        +String name
        +String phone
        +String city
        +String country
    }

    class Subscription {
        +String id
        +Decimal amountCAD
        +String frequency
        +SubscriptionStatus status
    }

    class Transfer {
        +String id
        +Decimal amountCAD
        +Decimal amountMGA
        +TransferType type
        +TransferStatus status
    }

    class Notification {
        +String id
        +NotificationType type
        +String title
        +String message
    }

    class ExchangeRate {
        +String id
        +String fromCurrency
        +String toCurrency
        +Decimal rate
    }

    class AuditLog {
        +String id
        +String action
        +String resource
    }

    %% Relations avec multiplicités détaillées
    User ||--o{ Beneficiary : "1 to N"
    User ||--o{ Subscription : "1 to N"
    User ||--o{ Transfer : "1 to N"
    User ||--o{ Notification : "1 to N"
    User ||--o{ AuditLog : "1 to N"

    Beneficiary ||--o{ Subscription : "1 to N"
    Beneficiary ||--o{ Transfer : "1 to N"

    Subscription ||--o{ Transfer : "1 to N"
```

## 🔢 Multiplicités Détaillées

| Relation Source → Cible        | Multiplicité | Description                                                               |
| ------------------------------ | ------------ | ------------------------------------------------------------------------- |
| **User → Beneficiary**         | **1:N**      | Un utilisateur peut avoir plusieurs bénéficiaires (famille, amis)         |
| **User → Subscription**        | **1:N**      | Un utilisateur peut créer plusieurs abonnements récurrents                |
| **User → Transfer**            | **1:N**      | Un utilisateur peut initier plusieurs transferts (ponctuels + récurrents) |
| **User → Notification**        | **1:N**      | Un utilisateur reçoit plusieurs notifications système                     |
| **User → AuditLog**            | **1:N**      | Toutes les actions d'un utilisateur sont tracées                          |
| **Beneficiary → Subscription** | **1:N**      | Un bénéficiaire peut recevoir de multiples abonnements                    |
| **Beneficiary → Transfer**     | **1:N**      | Un bénéficiaire peut recevoir plusieurs transferts                        |
| **Subscription → Transfer**    | **1:N**      | Un abonnement génère des transferts récurrents                            |

## 📋 Entité Centrale - User

Le **User** est l'entité centrale du système avec les relations suivantes :

### 🔹 Cardinalités Sortantes

- **1 User → 0..∞ Beneficiaries** : Un utilisateur peut ne pas avoir de bénéficiaires (nouveau compte) ou en avoir plusieurs
- **1 User → 0..∞ Subscriptions** : Un utilisateur peut utiliser uniquement des transferts ponctuels ou créer plusieurs abonnements
- **1 User → 0..∞ Transfers** : Un utilisateur peut ne pas avoir encore fait de transfert ou en avoir plusieurs
- **1 User → 0..∞ Notifications** : Génération automatique de notifications selon les actions

## 🎯 Règles Métier et Contraintes

### 👤 Contraintes par Rôle Utilisateur

#### 🟢 CLIENT

- Peut créer/modifier ses propres Beneficiaries
- Peut créer/gérer ses propres Subscriptions
- Peut initier ses propres Transfers
- Reçoit ses propres Notifications

#### 🔴 ADMIN

- Accès complet à toutes les entités
- Peut consulter tous les AuditLogs
- Peut modifier les SystemSettings
- Peut gérer tous les utilisateurs

#### 🟡 MADAGASCAR_TEAM

- Peut confirmer les Transfers (confirmedBy)
- Peut consulter les détails des transferts
- Accès limité aux autres entités

### 🌍 Contraintes Géographiques

- **Beneficiary.country** = "Madagascar" (obligatoire)
- **ExchangeRate** : CAD → MGA uniquement

### 🔄 Automatisation des Abonnements

- **Subscription ACTIVE** → génère automatiquement des **Transfer SUBSCRIPTION**
- Fréquence respectée (mensuel, bimensuel, hebdomadaire)
- Paiement automatique via Stripe

### 📊 Audit et Conformité

- Toute action critique génère un **AuditLog**
- **StripeReliabilityLog** pour monitoring des paiements
- Conformité PCI DSS pour les données financières

## ⚠️ Contraintes d'Intégrité

1. **Un Transfer SUBSCRIPTION doit avoir un subscriptionId**
2. **Un Transfer ONE_TIME ne doit pas avoir de subscriptionId**
3. **Seuls les utilisateurs MADAGASCAR_TEAM peuvent confirmer des transferts**
4. **Les montants doivent être > 0**
5. **Un Beneficiary supprimé ne peut plus recevoir de nouveaux transferts**

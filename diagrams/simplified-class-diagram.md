# Diagramme de Classes Simplifié - Entités Principales

```mermaid
classDiagram
    %% Classes principales avec attributs essentiels
    class User {
        -String id PK
        -String email UNIQUE
        -String name
        -String password
        -String phone?
        -UserRole role
        -UserStatus status
        -String stripeCustomerId?
        -DateTime createdAt
        -DateTime updatedAt
    }

    class Beneficiary {
        -String id PK
        -String userId FK
        -String name
        -String phone
        -String city
        -String country
        -String operator?
        -Boolean isActive
        -DateTime createdAt
    }

    class Subscription {
        -String id PK
        -String userId FK
        -String beneficiaryId FK
        -Decimal amountCAD
        -String frequency
        -DateTime nextTransferDate
        -SubscriptionStatus status
        -String stripeSubscriptionId?
        -DateTime createdAt
    }

    class Transfer {
        -String id PK
        -String userId FK
        -String beneficiaryId FK
        -String subscriptionId? FK
        -Decimal amountCAD
        -Decimal amountMGA
        -Decimal exchangeRate
        -Decimal feeCAD
        -Decimal totalCAD
        -TransferType type
        -TransferStatus status
        -DateTime confirmedAt?
        -String confirmedBy?
        -DateTime createdAt
    }

    class Notification {
        -String id PK
        -String userId FK
        -NotificationType type
        -String title
        -String message
        -Boolean isRead
        -DateTime createdAt
    }

    class ExchangeRate {
        -String id PK
        -String fromCurrency
        -String toCurrency
        -Decimal rate
        -DateTime createdAt
    }

    class AuditLog {
        -String id PK
        -String userId?
        -String action
        -String resource
        -String ipAddress?
        -DateTime createdAt
    }

    %% Relations principales avec multiplicités
    User ||--o{ Beneficiary : "1..* owns"
    User ||--o{ Subscription : "0..* creates"
    User ||--o{ Transfer : "0..* initiates"
    User ||--o{ Notification : "0..* receives"
    User ||--o{ AuditLog : "tracked by"

    Beneficiary ||--o{ Subscription : "0..* receives from"
    Beneficiary ||--o{ Transfer : "0..* receives"

    Subscription ||--o{ Transfer : "0..* generates"
```

## Explications des Entités

### 🧑‍💼 User

L'utilisateur principal du système. Peut créer des bénéficiaires, des abonnements et des transferts.

**Rôles possibles :**

- `CLIENT` : Utilisateur standard
- `ADMIN` : Administrateur système
- `MADAGASCAR_TEAM` : Équipe locale Madagascar

### 👥 Beneficiary

Personne qui reçoit l'argent à Madagascar. Un utilisateur peut avoir plusieurs bénéficiaires.

**Contraintes :**

- Obligatoirement situé à Madagascar
- Peut avoir un opérateur de mobile money

### 🔄 Subscription

Représente un abonnement récurrent pour des transferts automatiques.

**Fréquences supportées :**

- Mensuel
- Bimensuel
- Hebdomadaire

### 💸 Transfer

Entité centrale qui représente un transfert d'argent du Canada vers Madagascar.

**Types :**

- `ONE_TIME` : Transfert ponctuel
- `SUBSCRIPTION` : Transfert généré par un abonnement

**Statuts :**

- `PENDING` → `PROCESSING` → `COMPLETED`
- Possibilité de `FAILED` ou `CANCELLED`

### 🔔 Notification

Messages envoyés aux utilisateurs pour les informer des événements importants.

### 💱 ExchangeRate

Taux de change CAD/MGA mis à jour régulièrement et utilisé pour tous les calculs.

### 📋 AuditLog

Logs d'audit pour tracer toutes les actions importantes (conformité PCI DSS).

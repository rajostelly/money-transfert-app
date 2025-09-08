# Diagramme Entité-Relation - Base de Données

```mermaid
erDiagram
    users {
        varchar id PK "VARCHAR(25)"
        varchar email UK "VARCHAR UNIQUE"
        varchar name "VARCHAR"
        varchar password "VARCHAR"
        varchar phone "VARCHAR NULL"
        enum role "ENUM CLIENT,ADMIN,MADAGASCAR_TEAM"
        enum status "ENUM ACTIVE,INACTIVE,SUSPENDED"
        varchar stripe_customer_id UK "VARCHAR NULL UNIQUE"
        boolean email_verified "BOOLEAN DEFAULT FALSE"
        varchar email_verification_token UK "VARCHAR NULL UNIQUE"
        timestamp email_verification_token_expires_at "TIMESTAMP NULL"
        varchar reset_token UK "VARCHAR NULL UNIQUE"
        timestamp reset_token_expiry "TIMESTAMP NULL"
        timestamp created_at "TIMESTAMP DEFAULT NOW"
        timestamp updated_at "TIMESTAMP DEFAULT NOW"
    }

    beneficiaries {
        varchar id PK "VARCHAR(25)"
        varchar user_id FK "VARCHAR(25)"
        varchar name "VARCHAR"
        varchar phone "VARCHAR"
        varchar address "VARCHAR NULL"
        varchar city "VARCHAR"
        varchar country "VARCHAR DEFAULT Madagascar"
        varchar operator "VARCHAR NULL"
        boolean is_active "BOOLEAN DEFAULT TRUE"
        timestamp created_at "TIMESTAMP DEFAULT NOW"
        timestamp updated_at "TIMESTAMP DEFAULT NOW"
    }

    subscriptions {
        varchar id PK "VARCHAR(25)"
        varchar user_id FK "VARCHAR(25)"
        varchar beneficiary_id FK "VARCHAR(25)"
        decimal amount_cad "DECIMAL(10,2)"
        varchar frequency "VARCHAR"
        timestamp next_transfer_date "TIMESTAMP"
        enum status "ENUM ACTIVE,PAUSED,CANCELLED,EXPIRED"
        varchar stripe_subscription_id UK "VARCHAR NULL UNIQUE"
        timestamp created_at "TIMESTAMP DEFAULT NOW"
        timestamp updated_at "TIMESTAMP DEFAULT NOW"
    }

    transfers {
        varchar id PK "VARCHAR(25)"
        varchar user_id FK "VARCHAR(25)"
        varchar beneficiary_id FK "VARCHAR(25)"
        varchar subscription_id FK "VARCHAR(25) NULL"
        decimal amount_cad "DECIMAL(10,2)"
        decimal amount_mga "DECIMAL(15,2)"
        decimal exchange_rate "DECIMAL(10,6)"
        decimal fee_cad "DECIMAL(10,2)"
        decimal total_cad "DECIMAL(10,2)"
        enum type "ENUM SUBSCRIPTION,ONE_TIME"
        enum status "ENUM PENDING,PROCESSING,COMPLETED,FAILED,CANCELLED"
        varchar stripe_payment_intent_id "VARCHAR NULL"
        timestamp confirmed_at "TIMESTAMP NULL"
        varchar confirmed_by "VARCHAR NULL"
        boolean auto_processed "BOOLEAN DEFAULT FALSE"
        varchar mobile_money_transaction_id "VARCHAR NULL"
        varchar mobile_money_error "VARCHAR NULL"
        timestamp created_at "TIMESTAMP DEFAULT NOW"
        timestamp updated_at "TIMESTAMP DEFAULT NOW"
    }

    notifications {
        varchar id PK "VARCHAR(25)"
        varchar user_id FK "VARCHAR(25)"
        enum type "ENUM TRANSFER_REMINDER,TRANSFER_COMPLETED,etc"
        varchar title "VARCHAR"
        text message "TEXT"
        boolean is_read "BOOLEAN DEFAULT FALSE"
        timestamp created_at "TIMESTAMP DEFAULT NOW"
    }

    exchange_rates {
        varchar id PK "VARCHAR(25)"
        varchar from_currency "VARCHAR DEFAULT CAD"
        varchar to_currency "VARCHAR DEFAULT MGA"
        decimal rate "DECIMAL(10,6)"
        timestamp created_at "TIMESTAMP DEFAULT NOW"
    }

    system_settings {
        varchar id PK "VARCHAR(25)"
        varchar key UK "VARCHAR UNIQUE"
        varchar value "VARCHAR"
        timestamp updated_at "TIMESTAMP DEFAULT NOW"
    }

    audit_logs {
        varchar id PK "VARCHAR(25)"
        varchar user_id "VARCHAR NULL"
        varchar action "VARCHAR"
        varchar resource "VARCHAR"
        varchar resource_id "VARCHAR NULL"
        text old_values "TEXT NULL"
        text new_values "TEXT NULL"
        varchar ip_address "VARCHAR NULL"
        varchar user_agent "VARCHAR NULL"
        text metadata "TEXT NULL"
        timestamp created_at "TIMESTAMP DEFAULT NOW"
    }

    stripe_reliability_logs {
        varchar id PK "VARCHAR(25)"
        varchar type "VARCHAR"
        boolean success "BOOLEAN"
        varchar stripe_id "VARCHAR"
        varchar error_code "VARCHAR NULL"
        varchar error_message "VARCHAR NULL"
        varchar amount "VARCHAR NULL"
        varchar currency "VARCHAR NULL"
        varchar user_id "VARCHAR NULL"
        timestamp timestamp "TIMESTAMP DEFAULT NOW"
    }

    stripe_metrics {
        varchar id PK "VARCHAR(25)"
        decimal failure_rate "DECIMAL(5,4)"
        integer total_transactions "INTEGER"
        integer failed_transactions "INTEGER"
        timestamp window_start "TIMESTAMP"
        timestamp window_end "TIMESTAMP"
        timestamp created_at "TIMESTAMP DEFAULT NOW"
    }

    %% Relations avec cardinalités
    users ||--o{ beneficiaries : "1 user has many beneficiaries"
    users ||--o{ subscriptions : "1 user has many subscriptions"
    users ||--o{ transfers : "1 user has many transfers"
    users ||--o{ notifications : "1 user has many notifications"
    users ||--o{ audit_logs : "1 user has many audit logs"

    beneficiaries ||--o{ subscriptions : "1 beneficiary has many subscriptions"
    beneficiaries ||--o{ transfers : "1 beneficiary receives many transfers"

    subscriptions ||--o{ transfers : "1 subscription generates many transfers"
```

## Index Principaux

### 🔍 Utilisateurs (users)

- `email` (UNIQUE) - Connexion utilisateur
- `stripe_customer_id` (UNIQUE) - Intégration Stripe
- `email_verification_token` (UNIQUE) - Vérification email
- `reset_token` (UNIQUE) - Réinitialisation mot de passe

### 🔍 Transferts (transfers)

- `user_id` - Recherche par utilisateur
- `beneficiary_id` - Recherche par bénéficiaire
- `subscription_id` - Transferts d'abonnement
- `status` - Filtrage par statut
- `created_at` - Tri chronologique
- `stripe_payment_intent_id` - Intégration Stripe

### 🔍 Logs d'audit (audit_logs)

- `user_id` - Actions par utilisateur
- `action` - Type d'action
- `resource` - Type de ressource
- `created_at` - Tri chronologique

### 🔍 Monitoring Stripe (stripe_reliability_logs)

- `timestamp` - Tri chronologique
- `success` - Filtrage succès/échec
- `type` - Type de transaction

## Contraintes de Domaine

- **beneficiaries.country** : Toujours 'Madagascar'
- **exchange_rates.from_currency** : Toujours 'CAD'
- **exchange_rates.to_currency** : Toujours 'MGA'
- **users.email** : Format email valide
- **Montants** : Toujours positifs

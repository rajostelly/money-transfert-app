# Diagramme de Classes Complet - Application de Transfert d'Argent

```mermaid
classDiagram
    %% Énumérations
    class UserRole {
        <<enumeration>>
        CLIENT
        ADMIN
        MADAGASCAR_TEAM
    }

    class UserStatus {
        <<enumeration>>
        ACTIVE
        INACTIVE
        SUSPENDED
    }

    class SubscriptionStatus {
        <<enumeration>>
        ACTIVE
        PAUSED
        CANCELLED
        EXPIRED
    }

    class TransferStatus {
        <<enumeration>>
        PENDING
        PROCESSING
        COMPLETED
        FAILED
        CANCELLED
    }

    class TransferType {
        <<enumeration>>
        SUBSCRIPTION
        ONE_TIME
    }

    class NotificationType {
        <<enumeration>>
        TRANSFER_REMINDER
        TRANSFER_COMPLETED
        TRANSFER_FAILED
        SUBSCRIPTION_CREATED
        SUBSCRIPTION_CANCELLED
        PAYMENT_FAILED
    }

    %% Classes principales
    class User {
        -String id PK
        -String email UNIQUE
        -String name
        -String password
        -String phone?
        -UserRole role
        -UserStatus status
        -String stripeCustomerId? UNIQUE
        -Boolean emailVerified
        -String emailVerificationToken? UNIQUE
        -DateTime emailVerificationTokenExpiresAt?
        -String resetToken? UNIQUE
        -DateTime resetTokenExpiry?
        -DateTime createdAt
        -DateTime updatedAt
        +createSubscription()
        +addBeneficiary()
        +initiateTransfer()
        +viewNotifications()
        +updateProfile()
    }

    class Beneficiary {
        -String id PK
        -String userId FK
        -String name
        -String phone
        -String address?
        -String city
        -String country
        -String operator?
        -Boolean isActive
        -DateTime createdAt
        -DateTime updatedAt
        +activate()
        +deactivate()
        +updateInfo()
    }

    class Subscription {
        -String id PK
        -String userId FK
        -String beneficiaryId FK
        -Decimal amountCAD
        -String frequency
        -DateTime nextTransferDate
        -SubscriptionStatus status
        -String stripeSubscriptionId? UNIQUE
        -DateTime createdAt
        -DateTime updatedAt
        +pause()
        +resume()
        +cancel()
        +updateAmount()
        +updateFrequency()
        +processScheduledTransfer()
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
        -String stripePaymentIntentId?
        -DateTime confirmedAt?
        -String confirmedBy?
        -Boolean autoProcessed
        -String mobileMoneyTransactionId?
        -String mobileMoneyError?
        -DateTime createdAt
        -DateTime updatedAt
        +process()
        +confirm()
        +cancel()
        +retry()
        +calculateFees()
    }

    class Notification {
        -String id PK
        -String userId FK
        -NotificationType type
        -String title
        -String message
        -Boolean isRead
        -DateTime createdAt
        +markAsRead()
        +markAsUnread()
    }

    class ExchangeRate {
        -String id PK
        -String fromCurrency
        -String toCurrency
        -Decimal rate
        -DateTime createdAt
        +getCurrentRate()
        +updateRate()
    }

    class SystemSettings {
        -String id PK
        -String key UNIQUE
        -String value
        -DateTime updatedAt
        +getValue()
        +setValue()
        +updateSetting()
    }

    %% Classes d'audit et monitoring
    class AuditLog {
        -String id PK
        -String userId?
        -String action
        -String resource
        -String resourceId?
        -String oldValues?
        -String newValues?
        -String ipAddress?
        -String userAgent?
        -String metadata?
        -DateTime createdAt
        +logAction()
        +searchLogs()
    }

    class StripeReliabilityLog {
        -String id PK
        -String type
        -Boolean success
        -String stripeId
        -String errorCode?
        -String errorMessage?
        -String amount?
        -String currency?
        -String userId?
        -DateTime timestamp
        +logTransaction()
        +getFailureRate()
    }

    class StripeMetrics {
        -String id PK
        -Decimal failureRate
        -Int totalTransactions
        -Int failedTransactions
        -DateTime windowStart
        -DateTime windowEnd
        -DateTime createdAt
        +calculateMetrics()
        +generateReport()
    }

    %% Classes de service
    class PaymentService {
        <<service>>
        +processPayment()
        +refundPayment()
        +createSubscription()
        +cancelSubscription()
    }

    class NotificationService {
        <<service>>
        +sendNotification()
        +sendEmail()
        +sendSMS()
    }

    class ExchangeRateService {
        <<service>>
        +getCurrentRate()
        +updateRates()
        +calculateAmount()
    }

    class MobileMoneyService {
        <<service>>
        +sendMoney()
        +checkOperator()
        +validateRecipient()
    }

    %% Relations principales
    User ||--o{ Beneficiary : "1 user has 0..* beneficiaries"
    User ||--o{ Subscription : "1 user has 0..* subscriptions"
    User ||--o{ Transfer : "1 user has 0..* transfers"
    User ||--o{ Notification : "1 user has 0..* notifications"
    User ||--o{ AuditLog : "1 user has 0..* audit logs"

    Beneficiary ||--o{ Subscription : "1 beneficiary can have 0..* subscriptions"
    Beneficiary ||--o{ Transfer : "1 beneficiary can receive 0..* transfers"

    Subscription ||--o{ Transfer : "1 subscription can generate 0..* transfers"

    %% Relations avec les énumérations
    User }--|| UserRole
    User }--|| UserStatus
    Subscription }--|| SubscriptionStatus
    Transfer }--|| TransferStatus
    Transfer }--|| TransferType
    Notification }--|| NotificationType

    %% Relations avec les services
    Transfer ..> PaymentService : uses
    Transfer ..> MobileMoneyService : uses
    Transfer ..> ExchangeRateService : uses
    Subscription ..> PaymentService : uses
    Notification ..> NotificationService : uses
```

## Notes importantes

- **User** : Utilisateur principal du système, peut être CLIENT, ADMIN ou MADAGASCAR_TEAM
- **Transfer** : Entité centrale pour les transferts, gère les paiements et les envois
- **Subscription** : Transferts récurrents, gère les abonnements Stripe
- **AuditLog** : Logs d'audit pour la conformité PCI DSS Requirement 10

# Utilisateurs de Test

Cette application contient des utilisateurs de test pour faciliter le développement et les tests.

## Comptes de Test Disponibles

### Clients
- **Email:** `client1@test.com` | **Mot de passe:** `password123`
  - Nom: Jean Dupont
  - Rôle: CLIENT
  - Statut: ACTIF
  - Bénéficiaires: 2 (Rakoto Andry, Rasoa Hery)
  - Abonnements: 2 actifs

- **Email:** `client2@test.com` | **Mot de passe:** `password123`
  - Nom: Marie Tremblay
  - Rôle: CLIENT
  - Statut: ACTIF
  - Bénéficiaires: 2 (Nirina Rasoamalala, Fara Randriamampionona)
  - Abonnements: 1 actif, 1 en pause

- **Email:** `client3@test.com` | **Mot de passe:** `password123`
  - Nom: Pierre Leblanc
  - Rôle: CLIENT
  - Statut: ACTIF
  - Bénéficiaires: 2 (Tiana Rakotondrazafy, Miora Andrianaivoravelona)
  - Abonnements: 1 actif, 1 annulé

- **Email:** `client4@test.com` | **Mot de passe:** `password123`
  - Nom: Sophie Martin
  - Rôle: CLIENT
  - Statut: INACTIF
  - Aucun bénéficiaire ni abonnement

### Administrateur
- **Email:** `admin@test.com` | **Mot de passe:** `password123`
  - Nom: Admin Principal
  - Rôle: ADMIN
  - Accès complet au panneau d'administration

### Équipe Madagascar
- **Email:** `madagascar1@test.com` | **Mot de passe:** `password123`
  - Nom: Ravo Andriamampianina
  - Rôle: MADAGASCAR_TEAM
  - Peut confirmer les transferts

- **Email:** `madagascar2@test.com` | **Mot de passe:** `password123`
  - Nom: Hery Rakotomalala
  - Rôle: MADAGASCAR_TEAM
  - Peut confirmer les transferts

## Données de Test Incluses

### Bénéficiaires
- 6 bénéficiaires répartis entre les clients
- Adresses réalistes à Madagascar
- Numéros de téléphone malgaches

### Abonnements
- 6 abonnements avec différents statuts (actif, en pause, annulé)
- Différentes fréquences (hebdomadaire, bi-hebdomadaire, mensuel)
- Montants variés (100-300 CAD)

### Transferts
- 11 transferts avec différents statuts
- Transferts d'abonnement et ponctuels
- Historique de transferts complétés
- Transferts en attente de confirmation
- Exemple de transfert échoué

### Notifications
- 8 notifications pour différents types d'événements
- Notifications lues et non lues
- Notifications pour tous les types d'utilisateurs

### Taux de Change
- Taux de change historiques
- Taux actuel CAD → MGA
- Variations réalistes des taux

## Instructions pour Tester

1. **Exécuter les scripts de seed:**
   \`\`\`sql
   -- Exécuter dans l'ordre:
   -- 1. scripts/005_seed_test_data.sql
   -- 2. scripts/006_create_test_users_with_passwords.sql
   \`\`\`

2. **Se connecter avec un compte de test:**
   - Aller sur `/auth/login`
   - Utiliser un des emails ci-dessus avec le mot de passe `password123`

3. **Tester les fonctionnalités:**
   - **Clients:** Créer des bénéficiaires, gérer des abonnements, voir l'historique
   - **Admin:** Gérer les utilisateurs, voir tous les transferts, modifier les paramètres
   - **Madagascar:** Confirmer les transferts en attente

## Réinitialisation des Données

Pour réinitialiser les données de test, exécuter à nouveau les scripts de seed après avoir vidé les tables concernées.

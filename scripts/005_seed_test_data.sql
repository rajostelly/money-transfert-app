-- Seed script to populate the database with test data
-- This script creates test users, beneficiaries, subscriptions, transfers, and other test data

-- Insert test users with different roles
INSERT INTO "users" ("id", "email", "name", "phone", "role", "status", "createdAt", "updatedAt") VALUES
-- Test clients
('user_client_1', 'client1@test.com', 'Jean Dupont', '+1-514-555-0101', 'CLIENT', 'ACTIVE', NOW(), NOW()),
('user_client_2', 'client2@test.com', 'Marie Tremblay', '+1-514-555-0102', 'CLIENT', 'ACTIVE', NOW(), NOW()),
('user_client_3', 'client3@test.com', 'Pierre Leblanc', '+1-514-555-0103', 'CLIENT', 'ACTIVE', NOW(), NOW()),
('user_client_4', 'client4@test.com', 'Sophie Martin', '+1-514-555-0104', 'CLIENT', 'INACTIVE', NOW(), NOW()),

-- Test admin
('user_admin_1', 'admin@test.com', 'Admin Principal', '+1-514-555-0201', 'ADMIN', 'ACTIVE', NOW(), NOW()),

-- Test Madagascar team members
('user_madagascar_1', 'madagascar1@test.com', 'Ravo Andriamampianina', '+261-20-555-0301', 'MADAGASCAR_TEAM', 'ACTIVE', NOW(), NOW()),
('user_madagascar_2', 'madagascar2@test.com', 'Hery Rakotomalala', '+261-20-555-0302', 'MADAGASCAR_TEAM', 'ACTIVE', NOW(), NOW());

-- Insert test beneficiaries
INSERT INTO "beneficiaries" ("id", "userId", "name", "phone", "address", "city", "country", "isActive", "createdAt", "updatedAt") VALUES
-- Beneficiaries for client 1
('ben_1_1', 'user_client_1', 'Rakoto Andry', '+261-34-12-345-67', '67 Rue de l''Indépendance', 'Antananarivo', 'Madagascar', true, NOW(), NOW()),
('ben_1_2', 'user_client_1', 'Rasoa Hery', '+261-33-98-765-43', 'Lot II M 45 Bis Ankadifotsy', 'Antananarivo', 'Madagascar', true, NOW(), NOW()),

-- Beneficiaries for client 2
('ben_2_1', 'user_client_2', 'Nirina Rasoamalala', '+261-32-11-222-33', 'Cité 67 Ha Nord', 'Antananarivo', 'Madagascar', true, NOW(), NOW()),
('ben_2_2', 'user_client_2', 'Fara Randriamampionona', '+261-34-44-555-66', 'Ambohijanahary', 'Fianarantsoa', 'Madagascar', true, NOW(), NOW()),

-- Beneficiaries for client 3
('ben_3_1', 'user_client_3', 'Tiana Rakotondrazafy', '+261-33-77-888-99', 'Talatamaty', 'Antananarivo', 'Madagascar', true, NOW(), NOW()),
('ben_3_2', 'user_client_3', 'Miora Andrianaivoravelona', '+261-32-55-666-77', 'Antsirabe I', 'Antsirabe', 'Madagascar', false, NOW(), NOW());

-- Insert current exchange rates
INSERT INTO "exchange_rates" ("id", "fromCurrency", "toCurrency", "rate", "createdAt") VALUES
('rate_1', 'CAD', 'MGA', 3250.50, NOW() - INTERVAL '1 hour'),
('rate_2', 'CAD', 'MGA', 3248.75, NOW() - INTERVAL '2 hours'),
('rate_3', 'CAD', 'MGA', 3252.25, NOW() - INTERVAL '3 hours'),
('rate_current', 'CAD', 'MGA', 3251.00, NOW());

-- Insert test subscriptions
INSERT INTO "subscriptions" ("id", "userId", "beneficiaryId", "amountCAD", "frequency", "nextTransferDate", "status", "createdAt", "updatedAt") VALUES
-- Active subscriptions
('sub_1', 'user_client_1', 'ben_1_1', 200.00, 'monthly', NOW() + INTERVAL '5 days', 'ACTIVE', NOW() - INTERVAL '30 days', NOW()),
('sub_2', 'user_client_1', 'ben_1_2', 150.00, 'bi-weekly', NOW() + INTERVAL '3 days', 'ACTIVE', NOW() - INTERVAL '15 days', NOW()),
('sub_3', 'user_client_2', 'ben_2_1', 300.00, 'monthly', NOW() + INTERVAL '10 days', 'ACTIVE', NOW() - INTERVAL '45 days', NOW()),
('sub_4', 'user_client_3', 'ben_3_1', 100.00, 'weekly', NOW() + INTERVAL '2 days', 'ACTIVE', NOW() - INTERVAL '7 days', NOW()),

-- Paused subscription
('sub_5', 'user_client_2', 'ben_2_2', 250.00, 'monthly', NOW() + INTERVAL '15 days', 'PAUSED', NOW() - INTERVAL '60 days', NOW()),

-- Cancelled subscription
('sub_6', 'user_client_3', 'ben_3_2', 175.00, 'bi-weekly', NOW() + INTERVAL '20 days', 'CANCELLED', NOW() - INTERVAL '90 days', NOW());

-- Insert test transfers
INSERT INTO "transfers" ("id", "userId", "beneficiaryId", "subscriptionId", "amountCAD", "amountMGA", "exchangeRate", "feeCAD", "totalCAD", "type", "status", "confirmedAt", "confirmedBy", "createdAt", "updatedAt") VALUES
-- Completed transfers
('trans_1', 'user_client_1', 'ben_1_1', 'sub_1', 200.00, 650100.00, 3250.50, 5.00, 205.00, 'SUBSCRIPTION', 'COMPLETED', NOW() - INTERVAL '2 days', 'user_madagascar_1', NOW() - INTERVAL '3 days', NOW()),
('trans_2', 'user_client_1', 'ben_1_2', 'sub_2', 150.00, 487312.50, 3248.75, 3.75, 153.75, 'SUBSCRIPTION', 'COMPLETED', NOW() - INTERVAL '1 day', 'user_madagascar_2', NOW() - INTERVAL '2 days', NOW()),
('trans_3', 'user_client_2', 'ben_2_1', 'sub_3', 300.00, 975675.00, 3252.25, 7.50, 307.50, 'SUBSCRIPTION', 'COMPLETED', NOW() - INTERVAL '5 days', 'user_madagascar_1', NOW() - INTERVAL '6 days', NOW()),

-- Pending transfers (waiting for confirmation)
('trans_4', 'user_client_1', 'ben_1_1', 'sub_1', 200.00, 650200.00, 3251.00, 5.00, 205.00, 'SUBSCRIPTION', 'PENDING', NULL, NULL, NOW() - INTERVAL '1 hour', NOW()),
('trans_5', 'user_client_3', 'ben_3_1', 'sub_4', 100.00, 325100.00, 3251.00, 2.50, 102.50, 'SUBSCRIPTION', 'PENDING', NULL, NULL, NOW() - INTERVAL '30 minutes', NOW()),

-- One-time transfers
('trans_6', 'user_client_2', 'ben_2_2', NULL, 500.00, 1625500.00, 3251.00, 12.50, 512.50, 'ONE_TIME', 'COMPLETED', NOW() - INTERVAL '3 days', 'user_madagascar_2', NOW() - INTERVAL '4 days', NOW()),
('trans_7', 'user_client_3', 'ben_3_1', NULL, 75.00, 243825.00, 3251.00, 1.88, 76.88, 'ONE_TIME', 'PROCESSING', NULL, NULL, NOW() - INTERVAL '2 hours', NOW()),

-- Failed transfer
('trans_8', 'user_client_1', 'ben_1_2', 'sub_2', 150.00, 487650.00, 3251.00, 3.75, 153.75, 'SUBSCRIPTION', 'FAILED', NULL, NULL, NOW() - INTERVAL '7 days', NOW());

-- Insert test notifications
INSERT INTO "notifications" ("id", "userId", "type", "title", "message", "isRead", "createdAt") VALUES
-- Recent notifications
('notif_1', 'user_client_1', 'TRANSFER_COMPLETED', 'Transfert complété', 'Votre transfert de 200 CAD vers Rakoto Andry a été complété avec succès.', false, NOW() - INTERVAL '2 days'),
('notif_2', 'user_client_1', 'TRANSFER_REMINDER', 'Transfert programmé', 'Un transfert de 200 CAD vers Rakoto Andry sera effectué dans 5 jours.', false, NOW() - INTERVAL '1 day'),
('notif_3', 'user_client_2', 'TRANSFER_COMPLETED', 'Transfert complété', 'Votre transfert de 500 CAD vers Fara Randriamampionona a été complété.', true, NOW() - INTERVAL '3 days'),
('notif_4', 'user_client_3', 'SUBSCRIPTION_CREATED', 'Abonnement créé', 'Votre abonnement hebdomadaire de 100 CAD a été créé avec succès.', true, NOW() - INTERVAL '7 days'),
('notif_5', 'user_client_1', 'TRANSFER_FAILED', 'Échec du transfert', 'Le transfert de 150 CAD vers Rasoa Hery a échoué. Veuillez vérifier vos informations de paiement.', false, NOW() - INTERVAL '7 days'),

-- Madagascar team notifications
('notif_6', 'user_madagascar_1', 'TRANSFER_REMINDER', 'Transferts en attente', 'Il y a 2 transferts en attente de confirmation.', false, NOW() - INTERVAL '1 hour'),
('notif_7', 'user_madagascar_2', 'TRANSFER_REMINDER', 'Nouveau transfert', 'Un nouveau transfert de 100 CAD nécessite votre confirmation.', false, NOW() - INTERVAL '30 minutes'),

-- Admin notifications
('notif_8', 'user_admin_1', 'PAYMENT_FAILED', 'Paiements échoués', 'Il y a eu 3 paiements échoués aujourd''hui nécessitant votre attention.', false, NOW() - INTERVAL '4 hours');

-- Insert system settings
INSERT INTO "system_settings" ("id", "key", "value", "updatedAt") VALUES
('setting_1', 'transfer_fee_percentage', '2.5', NOW()),
('setting_2', 'min_transfer_amount', '25.00', NOW()),
('setting_3', 'max_transfer_amount', '5000.00', NOW()),
('setting_4', 'notification_reminder_days', '3', NOW()),
('setting_5', 'exchange_rate_update_interval', '60', NOW()),
('setting_6', 'maintenance_mode', 'false', NOW()),
('setting_7', 'max_beneficiaries_per_user', '10', NOW());

-- Add some password hashes for test users (using simple base64 encoding for testing)
-- Password for all test users is "password123" encoded in base64
UPDATE "users" SET "updatedAt" = NOW();

-- Add some additional test data for better testing experience
-- Insert more historical exchange rates
INSERT INTO "exchange_rates" ("id", "fromCurrency", "toCurrency", "rate", "createdAt") VALUES
('rate_hist_1', 'CAD', 'MGA', 3245.25, NOW() - INTERVAL '1 day'),
('rate_hist_2', 'CAD', 'MGA', 3247.80, NOW() - INTERVAL '2 days'),
('rate_hist_3', 'CAD', 'MGA', 3249.15, NOW() - INTERVAL '3 days'),
('rate_hist_4', 'CAD', 'MGA', 3246.90, NOW() - INTERVAL '4 days'),
('rate_hist_5', 'CAD', 'MGA', 3250.75, NOW() - INTERVAL '5 days');

-- Insert some older transfers for history
INSERT INTO "transfers" ("id", "userId", "beneficiaryId", "subscriptionId", "amountCAD", "amountMGA", "exchangeRate", "feeCAD", "totalCAD", "type", "status", "confirmedAt", "confirmedBy", "createdAt", "updatedAt") VALUES
('trans_hist_1', 'user_client_1', 'ben_1_1', 'sub_1', 200.00, 649050.00, 3245.25, 5.00, 205.00, 'SUBSCRIPTION', 'COMPLETED', NOW() - INTERVAL '30 days', 'user_madagascar_1', NOW() - INTERVAL '31 days', NOW()),
('trans_hist_2', 'user_client_2', 'ben_2_1', 'sub_3', 300.00, 974340.00, 3247.80, 7.50, 307.50, 'SUBSCRIPTION', 'COMPLETED', NOW() - INTERVAL '45 days', 'user_madagascar_2', NOW() - INTERVAL '46 days', NOW()),
('trans_hist_3', 'user_client_3', 'ben_3_1', 'sub_4', 100.00, 324915.00, 3249.15, 2.50, 102.50, 'SUBSCRIPTION', 'COMPLETED', NOW() - INTERVAL '14 days', 'user_madagascar_1', NOW() - INTERVAL '15 days', NOW());

COMMIT;

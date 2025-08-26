-- Seed initial data for the application

-- Insert initial exchange rate
INSERT INTO "exchange_rates" ("id", "fromCurrency", "toCurrency", "rate", "createdAt")
VALUES ('initial_rate', 'CAD', 'MGA', 3200.00, CURRENT_TIMESTAMP);

-- Insert system settings
INSERT INTO "system_settings" ("id", "key", "value", "updatedAt") VALUES
('fee_percentage', 'TRANSFER_FEE_PERCENTAGE', '2.5', CURRENT_TIMESTAMP),
('notification_days', 'NOTIFICATION_DAYS_BEFORE', '3', CURRENT_TIMESTAMP),
('min_transfer', 'MIN_TRANSFER_AMOUNT', '10.00', CURRENT_TIMESTAMP),
('max_transfer', 'MAX_TRANSFER_AMOUNT', '5000.00', CURRENT_TIMESTAMP);

-- Insert admin user (you'll need to update this with real data)
INSERT INTO "users" ("id", "email", "name", "role", "status", "createdAt", "updatedAt")
VALUES ('admin_user', 'admin@transferapp.com', 'Admin User', 'ADMIN', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Insert Madagascar team user
INSERT INTO "users" ("id", "email", "name", "role", "status", "createdAt", "updatedAt")
VALUES ('madagascar_user', 'madagascar@transferapp.com', 'Madagascar Team', 'MADAGASCAR_TEAM', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

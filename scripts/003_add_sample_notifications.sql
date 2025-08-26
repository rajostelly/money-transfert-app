-- Add sample notifications for testing
INSERT INTO "notifications" ("id", "userId", "type", "title", "message", "isRead", "createdAt") VALUES
('notif_1', 'admin_user', 'TRANSFER_COMPLETED', 'Transfer Completed', 'Your transfer of $100 CAD to John Doe has been completed successfully.', false, CURRENT_TIMESTAMP),
('notif_2', 'admin_user', 'SUBSCRIPTION_CREATED', 'Subscription Created', 'Your monthly subscription of $50 CAD to Jane Smith has been created successfully.', false, CURRENT_TIMESTAMP - INTERVAL '1 hour'),
('notif_3', 'admin_user', 'TRANSFER_REMINDER', 'Upcoming Transfer', 'Your recurring transfer of $75 CAD to Bob Johnson is scheduled in 2 days.', true, CURRENT_TIMESTAMP - INTERVAL '2 hours');

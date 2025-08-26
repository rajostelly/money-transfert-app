# Local PostgreSQL Database Setup

This guide will help you set up a local PostgreSQL database for the Money Transfer App.

## Prerequisites

1. **Install PostgreSQL**
   - Download PostgreSQL from: https://www.postgresql.org/download/windows/
   - During installation, remember the password you set for the `postgres` user
   - Default port is 5432 (keep this unless you have conflicts)

## Database Setup Steps

### 1. Start PostgreSQL Service

After installation, PostgreSQL should start automatically. If not:

- Open Services (Win + R, type `services.msc`)
- Find "postgresql-x64-XX" service and start it

### 2. Connect to PostgreSQL

Open Command Prompt or PowerShell as Administrator and run:

```bash
psql -U postgres -h localhost
```

Enter the password you set during installation.

### 3. Create Database

```sql
CREATE DATABASE moneytransferapp;
```

### 4. Create a New User (Optional but recommended)

```sql
CREATE USER moneytransfer_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE moneytransferapp TO moneytransfer_user;
```

### 5. Update Environment Variables

Update your `.env` file with the correct credentials:

**If using postgres user:**

```env
DATABASE_URL="postgresql://postgres:your_postgres_password@localhost:5432/moneytransferapp"
```

**If using the new user you created:**

```env
DATABASE_URL="postgresql://moneytransfer_user:your_secure_password@localhost:5432/moneytransferapp"
```

### 6. Run Database Migrations

In your project directory, run:

```bash
npx prisma migrate dev --name init
```

### 7. Generate Prisma Client

```bash
npx prisma generate
```

### 8. (Optional) Seed Database

If you have seed scripts, run:

```bash
npx prisma db seed
```

## Useful Commands

### Check if PostgreSQL is running:

```bash
pg_isready -h localhost -p 5432
```

### Connect to your database:

```bash
psql -U postgres -d moneytransferapp -h localhost
```

### View all databases:

```sql
\l
```

### Connect to your app database:

```sql
\c moneytransferapp
```

### View all tables:

```sql
\dt
```

### Exit psql:

```sql
\q
```

## Troubleshooting

### Connection Issues

1. Make sure PostgreSQL service is running
2. Check if the port 5432 is available
3. Verify your username and password
4. Ensure the database exists

### Permission Issues

- Run Command Prompt as Administrator
- Make sure your user has proper permissions on the database

### Port Conflicts

If port 5432 is in use, you can:

1. Change PostgreSQL port in `postgresql.conf`
2. Update your DATABASE_URL accordingly

## Alternative: Using Docker (Advanced)

If you prefer Docker, create a `docker-compose.yml`:

```yaml
version: "3.8"
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: moneytransferapp
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

Then run:

```bash
docker-compose up -d
```

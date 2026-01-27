```bash
docker-compose up -d
```

### 2. Setup Backend
```bash
cd server
npm install
npx prisma db push
npx prisma generate
npm run seed
npm run dev
```

### 3. Setup Frontend
```bash
cd client
npm install
npm run dev
```

## Default Users
- admin / admin123 (ADMIN)
- user / user123 (USER)
```
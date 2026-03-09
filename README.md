# Voter EPIC Lookup — Full Setup Guide

## Prerequisites
- Node.js 18+ installed
- MongoDB Atlas account (free) OR local MongoDB
- npm or yarn

---

## Step 1: Create Next.js Project

```bash
npx create-next-app@latest voter-epic-app --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
cd voter-epic-app
```

## Step 2: Install Dependencies

```bash
npm install mongoose axios
```

## Step 3: Environment Variables

Create a `.env.local` file in the root of the project:

```env
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/voter_db?retryWrites=true&w=majority
```

> Replace with your actual MongoDB connection string.
> For local MongoDB use: `MONGODB_URI=mongodb://localhost:27017/voter_db`

---

## Step 4: Create the Files

Create the following files (copy content from the source files provided):

```
src/
├── app/
│   ├── globals.css           ← Replace content
│   ├── layout.tsx            ← Replace content
│   ├── page.tsx              ← Replace content
│   └── api/
│       ├── voter/
│       │   └── route.ts      ← Create this
│       └── save/
│           └── route.ts      ← Create this
├── lib/
│   ├── mongodb.ts            ← Create this
│   └── models/
│       └── Voter.ts          ← Create this
```

---

## Step 5: Run the App

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## MongoDB Atlas Setup (Free Tier)

1. Go to [mongodb.com/atlas](https://www.mongodb.com/atlas/database)
2. Create free account → Create cluster (M0 free tier)
3. Database Access → Add user with password
4. Network Access → Allow from anywhere (0.0.0.0/0)
5. Connect → Drivers → Copy connection string
6. Paste into `.env.local`

---

## How It Works

1. Enter an EPIC ID → fetches voter data from BBMP electoral API
2. Data displays in a card (Name, Ward, Part No, Serial No, Polling School)
3. Enter mobile number → click Save
4. Confirmation dialog appears → confirm to save to MongoDB
5. All data (voter fields + mobile) saved to `voters` collection

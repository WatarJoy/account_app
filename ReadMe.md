# README: Financial Tracking App

This financial application allows users to manage and track their income, expenses, and deposits. It is developed using the following tech stack:

**Tech Stack:** React, TypeScript, Redux, PostgreSQL.

Users can register and log in to their accounts. All transactions are associated with a specific account and stored in the PostgreSQL database.

## Features

- User registration and authentication
- Adding income and expense records
- Grouping transactions with the same name
- Viewing detailed sub-items of each transaction by date
- Pie charts for financial visualization
- Expense calendar in the form of a heatmap

## Database

All data is stored in PostgreSQL. The database includes tables for users and transactions.

## Getting Started

To run the project locally, follow these steps:

```bash
# 1. Clone the repository
git clone https://github.com/WatarJoy/account_app
cd account_app

# 2. Set up environment variables and database connection in server/config

# 3. Run the frontend
cd client
npm install
npm run dev

# 4. Run the backend 
cd server
npm install
npm run dev
```

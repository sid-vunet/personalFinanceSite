# Family Financial Management App

A secure, self-hosted family finance management web application built with modern technologies.

## Features

- 📊 **Expense Tracking** - Add, edit, and categorize expenses with attachments
- 💰 **Budgeting** - Set monthly budgets per category with real-time alerts
- 🔄 **Recurring Expenses** - Track bills and scheduled transactions
- 🎯 **Financial Goals** - Set savings targets with progress tracking
- 📈 **Investment Tracking** - Monitor stocks, mutual funds, and insurance
- 👨‍👩‍👧‍👦 **Family Collaboration** - Multi-user support with role-based access
- 📱 **Mobile-First Design** - Responsive UI that works on all devices
- 📥 **Data Import/Export** - CSV import with column mapping, PDF reports

## Tech Stack

- **Frontend**: [Astro](https://astro.build) with React islands
- **Styling**: [Tailwind CSS](https://tailwindcss.com) v4
- **UI Components**: [shadcn/ui](https://ui.shadcn.com) + [Radix UI](https://radix-ui.com)
- **Data Tables**: [TanStack Table](https://tanstack.com/table)
- **Charts**: [Apache ECharts](https://echarts.apache.org)
- **Database**: PostgreSQL with [Drizzle ORM](https://orm.drizzle.team)
- **Authentication**: [Better Auth](https://better-auth.com) (Google OAuth + OTP)

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- Google OAuth credentials (for Google login)
- SMS API credentials (for OTP login, optional)

### Installation

1. Clone the repository:
   ```bash
   git clone <your-repo-url>
   cd FinancialExpenses
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create environment file:
   ```bash
   cp .env.example .env
   ```

4. Update `.env` with your configuration:
   - Add your PostgreSQL database URL
   - Add Google OAuth credentials
   - Add SMS API credentials (optional)

5. Push database schema:
   ```bash
   npm run db:push
   ```

6. Start the development server:
   ```bash
   npm run dev
   ```

7. Open [http://localhost:4321](http://localhost:4321) in your browser.

## Project Structure

```
src/
├── components/          # React components
│   ├── ui/             # shadcn/ui components
│   ├── charts/         # ECharts visualization components
│   ├── tables/         # TanStack Table components
│   ├── forms/          # Form components
│   └── dashboard/      # Dashboard widgets
├── layouts/            # Astro layouts
├── pages/              # Astro pages
│   ├── api/           # API routes
│   └── *.astro        # Page components
├── lib/                # Utilities
│   ├── db/            # Database schema and client
│   ├── auth/          # Authentication config
│   └── utils.ts       # Helper functions
└── styles/            # Global styles
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run db:generate` | Generate database migrations |
| `npm run db:push` | Push schema to database |
| `npm run db:studio` | Open Drizzle Studio |

## Configuration

### Database

The app uses PostgreSQL with Drizzle ORM. Update the `DATABASE_URL` in your `.env` file:

```
DATABASE_URL=postgresql://user:password@localhost:5432/family_finance
```

### Authentication

1. **Google OAuth**: Create credentials at [Google Cloud Console](https://console.cloud.google.com)
2. **OTP Login**: Configure your SMS provider (MSG91, Firebase, etc.)

## Deployment

### Fly.io (Recommended)

1. Install Fly CLI: `brew install flyctl`
2. Login: `fly auth login`
3. Launch: `fly launch`
4. Set secrets:
   ```bash
   fly secrets set DATABASE_URL=your-db-url
   fly secrets set GOOGLE_CLIENT_ID=your-client-id
   fly secrets set GOOGLE_CLIENT_SECRET=your-secret
   ```
5. Deploy: `fly deploy`

### Docker

```bash
docker build -t family-finance .
docker run -p 4321:4321 --env-file .env family-finance
```

## Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## License

This project is licensed under the MIT License.

# Family Financial Management App - Copilot Instructions

## Project Overview
This is a Next-Gen Family Financial Management Web Application built with:
- **Astro 5.x** with React islands architecture for optimal performance
- **React 19** for interactive components
- **TypeScript** for type safety
- **Tailwind CSS 4.x** for styling
- **shadcn/ui** for UI components
- **TanStack Table** for data tables
- **Apache ECharts** for visualizations
- **Go 1.21** backend with BoltDB (embedded database)

## Service Management
**IMPORTANT**: Use the `services.sh` script to manage the application services.

```bash
# Check service status (ALWAYS run this first)
./services.sh status

# Start all services (API + Frontend)
./services.sh start

# Stop all services
./services.sh stop

# Restart all services
./services.sh restart

# View logs
./services.sh logs api      # API server logs
./services.sh logs frontend # Frontend dev server logs

# Rebuild API binary
./services.sh build
```

**Service Ports:**
- Frontend: http://localhost:4321
- API: http://localhost:3001

## Project Structure
```
/src
  /components      # React components (islands)
    /ui            # shadcn/ui components
    /charts        # ECharts visualization components
    /tables        # TanStack Table components
    /forms         # Form components
  /layouts         # Astro layouts
  /pages           # Astro pages
    /api           # API routes
  /lib             # Utility functions
    /db            # Database schema and client
    /auth          # Authentication configuration
  /styles          # Global styles
/public            # Static assets
/backend           # Go API server
  main.go          # API entry point with all endpoints
  family-finance-api # Compiled binary
  uploads/         # Uploaded file attachments
services.sh        # Service manager script
```

## Key Features
1. **Expense Tracking** - Add, edit, categorize expenses with attachments
2. **Budgeting** - Monthly budgets per category with alerts
3. **Recurring Expenses** - Bill reminders and scheduled transactions
4. **Financial Goals** - Savings goals with progress tracking
5. **Investment Tracking** - Track stocks, mutual funds, insurance
6. **Family Collaboration** - Multi-user with role-based access
7. **Reports & Charts** - Visual dashboards with ECharts
8. **Data Import/Export** - CSV import with column mapping

## Development Guidelines
- Use Astro pages for static content, React islands for interactivity
- Follow mobile-first responsive design patterns
- Use TypeScript strict mode
- Follow shadcn/ui component patterns
- Implement proper error handling and validation
- After modifying backend Go code, rebuild with `./services.sh build` then restart

## Commands
- `./services.sh start` - Start all services
- `./services.sh status` - Check service status
- `npm run dev` - Start frontend only (prefer services.sh)
- `npm run build` - Build for production
- `npm run preview` - Preview production build

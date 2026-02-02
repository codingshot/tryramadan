# Contributing to TryRamadan

Thanks for your interest in contributing! This guide will help you get set up.

## Development Setup

```bash
# Clone the repo
git clone https://github.com/your-username/tryramadan.git
cd tryramadan

# Install dependencies (npm, yarn, or bun)
npm install

# Run the dev server
npm run dev
```

The app runs at `http://localhost:8080` by default.

## Build & Test

```bash
# Build for production
npm run build

# Preview production build
npm run preview

# Run tests
npm run test
```

## Environment

No environment variables are required for basic development. API URLs are configured in `src/lib/config.ts` for easier staging or mocking.

## Adding a New Page

1. Create a new page in `src/pages/` (e.g. `MyPage.tsx`)
2. Add the route in `src/App.tsx`
3. Add a link in the Navbar or relevant navigation
4. Use `PageSEO` for unique meta description and Open Graph tags

## Adding a New Feature

- Follow existing patterns for hooks, components, and data
- API base URLs: `src/lib/config.ts`
- Shared data: `src/data/`
- Styles: Tailwind CSS with existing theme tokens

## Code Style

- TypeScript for all new code
- ESLint: `npm run lint`
- Prefer `focus-visible:ring-2` for interactive elements (accessibility)

## Questions?

Open an issue or reach out to the maintainers.

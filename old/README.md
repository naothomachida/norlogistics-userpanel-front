# Shipment Tracker User Panel

## Technologies Used
- React
- Redux Toolkit
- TypeScript
- Tailwind CSS
- Vite
- React Router DOM

## Prerequisites
- Node.js (v18+)
- pnpm

## Setup Instructions

1. Clone the repository
```bash
git clone <repository-url>
cd shipment-tracker-user-panel
```

2. Install dependencies
```bash
pnpm install
```

3. Run the development server
```bash
pnpm dev
```

4. Build for production
```bash
pnpm build
```

## Project Structure
- `src/screens/`: Main application screens
  - `orders/`: Order-related components
    - `list/`: Order list view
    - `form/`: Order creation form
- `src/store/`: Redux store configuration
  - `ordersSlice.ts`: Orders state management

## Available Scripts
- `pnpm dev`: Start development server
- `pnpm build`: Create production build
- `pnpm preview`: Preview production build
- `pnpm lint`: Run linter

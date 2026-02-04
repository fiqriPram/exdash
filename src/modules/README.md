# Project Modules

This directory contains all business logic modules organized by domain.

## Structure

```
src/modules/
├── auth/           # Authentication module
│   ├── auth.service.ts
│   └── index.ts
├── file/           # File upload and parsing module
│   ├── file.service.ts
│   └── index.ts
└── report/         # Report generation module
    ├── csv/        # CSV utilities
    ├── generate/   # Report generators
    ├── mapping/    # Column mapping utilities
    ├── report.service.ts
    └── index.ts
```

## Module Design Principles

1. **Single Responsibility**: Each module handles one domain concern
2. **Thin Controllers**: API routes only handle HTTP concerns and delegate to services
3. **Reusable Services**: Business logic is extracted into reusable service functions
4. **Clear Interfaces**: All services export clear TypeScript interfaces

## Usage

### From API Routes

```typescript
import { authenticate } from "@/modules/auth";
import { generateReport } from "@/modules/report";
import { uploadFile } from "@/modules/file";
```

### From Components

```typescript
import { validateColumns } from "@/modules/report/csv";
```

## Adding New Modules

1. Create a new folder under `src/modules/`
2. Create a service file with business logic
3. Create an `index.ts` to export public API
4. Update `src/modules/index.ts` to include the new module

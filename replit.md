# Workflow Pro - White-Label Employment Management System

## Overview

Workflow Pro is a comprehensive white-label employee management and onboarding system designed for easy customization and deployment across multiple companies. The application facilitates complete employee lifecycle management from initial registration through daily operational tasks, with role-based access controls for employees, managers, and business owners.

**White-Label Features:**
- Company-specific branding and theming
- Customizable handbook content per company
- Industry-specific SOP templates
- Multi-tenant database architecture
- Easy fork-and-deploy workflow for new companies

The system provides digital employee handbook management with signature tracking, Standard Operating Procedures (SOPs) with step-by-step execution tracking, task assignment and management, incident reporting, comprehensive dashboard analytics, revenue/expense tracking with audit trails, duty assignment system, owner-manager messaging capabilities, and employee scheduling management. Built as a full-stack web application with modern React frontend and Express.js backend, it supports multiple companies through a white-label architecture.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The client-side application uses React 18 with TypeScript, built with Vite for fast development and optimized production builds. The UI is constructed using shadcn/ui components based on Radix UI primitives, providing accessible and consistent design patterns. Styling is handled through Tailwind CSS with a comprehensive design system including custom color variables and responsive breakpoints.

State management is handled through TanStack Query (React Query) for server state management and caching, while local component state uses React hooks. Routing is implemented with Wouter for lightweight client-side navigation. Form handling uses React Hook Form with Zod schema validation for type-safe form processing.

Key frontend patterns include:
- Component-based architecture with reusable UI components
- Hook-based patterns for shared logic (authentication, mobile detection, toasts)
- Query-based data fetching with automatic caching and background updates
- Form validation with type-safe schemas
- Responsive design with mobile-first approach

### Backend Architecture
The server uses Express.js with TypeScript in ESM module format. The application follows a layered architecture with clear separation between routes, business logic, and data access. Route handlers are organized by feature area (auth, users, handbook, SOPs, tasks, incidents) with consistent error handling and logging middleware.

Database operations are abstracted through a storage interface pattern, allowing for flexible data access implementation. The current implementation uses Drizzle ORM with PostgreSQL via Neon serverless driver. Authentication is implemented using JWT tokens with role-based authorization middleware.

Key backend patterns include:
- RESTful API design with consistent response formats
- Middleware-based request processing (auth, logging, error handling)
- Repository pattern for data access abstraction
- Role-based access control with middleware guards
- Structured error handling with appropriate HTTP status codes

### Data Storage Solutions
The application uses PostgreSQL as the primary database, accessed through Drizzle ORM for type-safe database operations. The database schema supports multi-tenancy through company-based data isolation, with comprehensive relationship modeling for users, handbook sections, SOPs, tasks, and incidents.

Database schema includes:
- Companies table for white-label multi-tenant support
- Users with role-based access (employee, manager, owner)
- Handbook sections with digital signature tracking
- SOPs with step-by-step execution tracking
- Task management with assignment and status tracking
- Incident reporting with severity and resolution tracking
- Notification system for user communications

File storage is handled through Google Cloud Storage integration with custom ACL (Access Control List) management for secure object access. The object storage service provides presigned URL generation for direct client uploads while maintaining security through custom access policies.

### Authentication and Authorization
Authentication uses JWT (JSON Web Tokens) with custom middleware for request validation. The system implements role-based authorization with three primary roles: employee, manager, and owner, each with distinct permissions and access levels.

Authorization patterns include:
- Token-based authentication with automatic refresh capabilities
- Role-based middleware guards protecting sensitive endpoints
- Company-based data isolation ensuring tenant security
- Custom object ACL system for file access control

### External Dependencies
The application integrates with several external services:

**Google Cloud Storage**: Used for file uploads and document storage with custom ACL policies for secure access control. Integration includes presigned URL generation for direct client uploads and server-side object management.

**Neon Database**: Serverless PostgreSQL provider for scalable database hosting with connection pooling and automatic scaling capabilities.

**Uppy File Upload**: Client-side file upload library providing dashboard interface, progress tracking, and multiple upload methods including drag-and-drop and AWS S3 direct uploads.

**Replit Integration**: Development environment integration with runtime error overlay, cartographer plugin for enhanced debugging, and sidecar authentication for Google Cloud services.

**UI Component Libraries**: Radix UI primitives for accessible component foundations, Lucide React for consistent iconography, and various specialized components for enhanced user interactions.

The system is designed for deployment flexibility with environment-based configuration and supports both development and production deployment scenarios.

## Recent Updates (January 2025)

**Enhanced Manager Dashboard Features:**
- Revenue and expense tracking with daily/weekly/monthly reporting
- Auditable financial entries with edit history tracking
- Duty assignment system for owner-to-manager task delegation
- Comprehensive messaging system for owner-manager communications
- Budget request functionality with priority levels
- Employee scheduling management with quick actions
- Real-time occupancy tracking and financial metrics
- Dropdown-style interface maintaining "huge dropdown menus" user experience

**Financial Management Integration:**
- Daily, weekly, and monthly revenue/expense categorization
- Editable and auditable financial entries from both manager and owner perspectives
- Integration points for external accounting software
- Current occupancy reporting under quick actions

**Communication System:**
- Multi-priority messaging (low, medium, high, urgent)
- Categorized message types (general, budget requests, support requests, duty assignments)
- Real-time notification badges for unread messages
- Audit trail for all communications

**Owner Dashboard Analytics:** 
- Manager performance tracking capabilities
- Property analytics and performance metrics integration points
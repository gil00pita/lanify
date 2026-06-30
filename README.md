# Lanify

_A lanyard and employee badge customisation accelerator for onboarding experiences._

> Lanify provides a reusable Next.js experience for creating on-brand employee lanyards and badge cards, contributing a polished onboarding asset to the AI Exchange ecosystem.

---

## Overview

Lanify helps new employees personalise their lanyard and badge card during onboarding while keeping every output aligned with approved brand rules. It exists as a reusable frontend accelerator that combines profile photo editing, badge design variation, and physical lanyard configuration into a fast guided flow.

- Solves the problem of collecting consistent, production-ready badge customisations without requiring manual design support.
- Benefits onboarding, HR, workplace experience, brand, and internal tooling teams that need a lightweight self-service personalisation flow.
- Provides guided profile image upload, portrait editing, background removal, badge variation selection, card customisation, and lanyard finish selection.

Example:

> This repository provides a reusable framework for building an employee badge and lanyard customisation journey using standard Next.js and CGI AI Exchange delivery patterns.

---

## Getting Started

Follow these steps to run Lanify locally or package it for deployment.

### Prerequisites

List tools, dependencies, or access requirements.

    node >= 20.9.0
    yarn
    docker >= 24.0.0              # Optional, for the background-removal service
    docker compose                # Optional, for local multi-container execution

### Installation / Setup

Clone the repository and install the frontend dependencies.

    git clone https://github.paeuinsource.ent.cgi.com/AI-Exchange/lanify.git
    cd lanify
    yarn install

Create a local environment file if you want to use the background-removal integration.

    cp .env.example .env.local

Default local value:

    REMBG_SERVICE_URL=http://localhost:7000

Run the Next.js development server.

    yarn dev

The application will be available at:

    http://localhost:3000

To run the web app together with the private Python `rembg` service, use Docker Compose.

    docker compose up --build

### Example Usage

Start the local app and complete the guided onboarding flow.

    yarn dev

Minimum happy path:

    1. Open http://localhost:3000
    2. Upload or capture a profile photo
    3. Edit crop, rotation, and filters
    4. Remove the background if needed
    5. Select a badge variation
    6. Customise card colours, SVG patterns, and pattern colours
    7. Choose lanyard colour and holder finish
    8. Submit the print request

Useful project commands:

    yarn build          # Create a production build
    yarn start          # Start the production server
    yarn lint           # Run ESLint
    yarn lint:fix       # Run ESLint with automatic fixes
    yarn format:check   # Check Prettier formatting
    yarn format         # Format the repository

## Repository Structure

Important directories and files:

    ├── docs/                         # Additional implementation documentation
    ├── public/                       # Static public assets
    ├── rembg-service/                # Python background-removal API service
    │   ├── app.py                    # rembg service application entry point
    │   ├── Dockerfile                # Container image for the rembg service
    │   └── requirements.txt          # Python service dependencies
    ├── src/                          # Next.js application source code
    │   ├── app/                      # App Router pages, layouts, and API routes
    │   ├── components/               # App and UI components
    │   ├── icons/                    # SVG icon components
    │   ├── illustrations/            # Illustration components
    │   ├── lib/                      # Domain rules, mock data, tokens, and utilities
    │   ├── store/                    # Zustand application store
    │   ├── theme/                    # Chakra UI theme configuration
    │   └── types/                    # Shared TypeScript domain types
    ├── docker-compose.yml            # Local multi-container setup
    ├── Dockerfile                    # Next.js app container image
    ├── eslint.config.mjs             # ESLint configuration
    ├── next.config.mjs               # Next.js configuration
    ├── package.json                  # Scripts and dependencies
    ├── tsconfig.json                 # TypeScript configuration
    └── README.md                     # Project overview and usage guide

## Outputs / Deliverables

Key deliverables from this repository include:

- A Next.js web application for employee lanyard and badge personalisation.
- A guided onboarding flow covering profile image upload, portrait editing, card selection, card customisation, and print request submission.
- A private `POST /api/remove-background` route that forwards uploaded images to the internal `rembg` service.
- A Dockerised Python background-removal service for generating transparent PNG profile images.
- Reusable UI components, domain rules, mock data, theme configuration, and card variation logic.
- Production build output generated through `yarn build` or the provided Dockerfile.

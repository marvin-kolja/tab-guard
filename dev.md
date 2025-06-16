# Development Guide

## Prerequisites

- Node.js (v20 or later)
- npm (v10 or later)

## Setup

1. Clone the repository:

```bash
git clone https://github.com/marvin-kolja/tab-guard && cd tab-guard
```

2. Install dev dependencies:

```bash
npm install
```

## Build

To build the extension, run:

```bash
npm run build:bundle
```

- This will create a production build of the extension in the `dist` directory.

## Package (optional)

To create a zip file using `web-ext`, run:

```bash
npm run package
```

- This will create a web-ext build from `dist` inside the `artifacts` directory.

# AI-Powered CV Generator

A Next.js application that uses AI to generate and optimize CVs and cover letters based on job descriptions.

## Features

- CV generation based on job descriptions
- PDF parsing of existing CVs
- ATS score calculation
- Keyword matching analysis
- Cover letter generation
- Real-time PDF preview
- Downloadable PDF exports

## Tech Stack

- Next.js 15.3
- React 19
- Tailwind CSS
- Google Gemini AI
- PDF parsing and generation (@react-pdf/renderer)
- Shadcn UI components

## Prerequisites

- Node.js
- Google Gemini API key

## Installation

```bash
npm install
# or
yarn install
```

## Environment Variables

Create a `.env.local` file with:

```
GOOGLE_API_KEY=your_gemini_api_key
```

## Development

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Building for Production

```bash
npm run build
npm start
# or
yarn build
yarn start
```

## License

Private - All rights reserved

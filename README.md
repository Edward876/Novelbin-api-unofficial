# NovelBin Unofficial API

An unofficial REST API for [NovelBin](https://novelbin.me/), built with Node.js, Express, and Puppeteer.

**Live Demo:** [https://novelbin-api-unofficial.vercel.app/](https://novelbin-api-unofficial.vercel.app/)

## Features

- **Popular Novels**: Get a list of popular novels.
- **Latest Novels**: Get the latest updated novels.
- **Search**: Search for novels by keyword.
- **Novel Details**: Get detailed information about a novel (author, genres, status, description, chapters).
- **Chapter Content**: Read the content of a specific chapter.
- **Lightweight**: Optimized for performance.

## Endpoints & Usage Examples

Base URL: `https://novelbin-api-unofficial.vercel.app`

### 1. Get Popular Novels
```bash
curl https://novelbin-api-unofficial.vercel.app/novels/popular
```

### 2. Get Latest Novels
```bash
curl https://novelbin-api-unofficial.vercel.app/novels/latest
```

### 3. Search Novels
```bash
curl "https://novelbin-api-unofficial.vercel.app/novels/search?keyword=shadow"
```

### 4. Get Novel Details
```bash
curl https://novelbin-api-unofficial.vercel.app/novels/shadow-slave
```

### 5. Get Novel Info (Metadata Only)
Returns details without the chapter list (faster response).
```bash
curl https://novelbin-api-unofficial.vercel.app/novels/shadow-slave/info
```

### 6. Get Novel Cover
Returns the cover image URL.
```bash
curl https://novelbin-api-unofficial.vercel.app/novels/shadow-slave/cover
```

### 7. Get Chapter Content
```bash
curl https://novelbin-api-unofficial.vercel.app/novels/shadow-slave/chapters/chapter-1-nightmare-begins
```

## Deployment

### Deploy to Vercel

This project is configured for easy deployment on Vercel.

1. Fork this repository.
2. Import the project into Vercel.
3. Vercel will automatically detect the configuration.
4. Deploy!

### Local Development

1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
   *Note: This project uses `puppeteer-core` and `@sparticuz/chromium` for serverless compatibility. For local development, ensure you have a Chrome executable available or install full `puppeteer`.*
3. Start the server:
   ```bash
   npm start
   ```
4. The API will be available at `http://localhost:3000`.

## License

This project is for educational purposes only. All content belongs to their respective owners.

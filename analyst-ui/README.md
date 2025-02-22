# Analyst Zero Frontend

A Next.js project for Analyst Zero platform.

## Prerequisites

- Node.js 23.x
- pnpm 8.10.5 or higher
- Docker (for containerized deployment)

## Local Development

1. Install dependencies:
```bash
# Using pnpm (recommended)
pnpm install
```

2. Set up environment variables:
```bash
# Copy the example env file and modify as needed
cp .env.example .env
```

3. Run the development server:
```bash
pnpm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

## Production Deployment

### Using Docker

1. Build the Docker image:
```bash
docker build -t analyst-ui:latest .
```

2. Run the container:
```bash
docker run -d \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -e PORT=3000 \
  --env-file .env \
  analyst-ui:latest
```

## Environment Variables

Required environment variables:
- `NODE_ENV`: Environment mode (development/production)
- `PORT`: Application port (default: 3000)


## License

(Add license information here)

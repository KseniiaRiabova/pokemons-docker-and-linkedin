# Docker Setup for Pokemon LinkedIn Application

This document provides detailed instructions and information about the Docker setup for the Pokemon LinkedIn application.

## Docker Configuration

### Dockerfile

The application uses a Node.js Alpine-based image for a small footprint:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci --only=production && npm cache clean --force

COPY . .

RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

RUN chown -R nodejs:nodejs /app

USER nodejs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node healthcheck.js

CMD ["node", "app.js"]
```

### Security Features

1. **Non-root User**: The application runs as a non-privileged user `nodejs` with UID 1001
2. **Minimal Base Image**: Using Alpine Linux for a smaller attack surface
3. **Production Dependencies Only**: `npm ci --only=production` excludes dev dependencies
4. **Cache Cleaning**: `npm cache clean` reduces image size

### Docker Compose

The application is configured with Docker Compose for easy deployment:

```yaml
version: '3.8'

services:
  web:
    build: .
    container_name: pokemon-app
    ports:
      - '3000:3000'
    environment:
      - NODE_ENV=production
      - PORT=3000
      - MONGODB_URI=mongodb://mongo:27017/pokemon_db
    depends_on:
      - mongo
    restart: unless-stopped
    volumes:
      - ./data:/app/data:ro # Mount data directory as read-only
    networks:
      - pokemon-network

  mongo:
    image: mongo:7.0
    container_name: pokemon-mongo
    ports:
      - '27017:27017'
    environment:
      - MONGO_INITDB_ROOT_USERNAME=admin
      - MONGO_INITDB_ROOT_PASSWORD=pokemon123
      - MONGO_INITDB_DATABASE=pokemon_db
    volumes:
      - mongodb_data:/data/db
      - ./mongo-init:/docker-entrypoint-initdb.d:ro
    restart: unless-stopped
    networks:
      - pokemon-network

volumes:
  mongodb_data:
    driver: local

networks:
  pokemon-network:
    driver: bridge
```

## Usage Instructions

### Basic Usage

```bash
# Start the application with Docker Compose
docker-compose up -d

# Check logs
docker-compose logs -f

# Stop the application
docker-compose down
```

### Development with Docker

For development with hot-reload:

```bash
# Create a development-specific docker-compose.override.yml
cat > docker-compose.override.yml << 'EOL'
version: '3.8'

services:
  web:
    command: npm run dev
    volumes:
      - .:/app
      - /app/node_modules
    environment:
      - NODE_ENV=development
EOL

# Start development environment
docker-compose up
```

### Container Management

```bash
# List running containers
docker-compose ps

# View container resource usage
docker stats

# Restart a specific service
docker-compose restart web

# Execute commands in the container
docker-compose exec web sh
```

## Container Health Monitoring

The Dockerfile includes a health check that runs every 30 seconds:

```javascript
// healthcheck.js
const http = require('http');

const options = {
  hostname: 'localhost',
  port: process.env.PORT || 3000,
  path: '/',
  method: 'GET',
  timeout: 2000,
};

const request = http.request(options, (response) => {
  console.log(`Health check status: ${response.statusCode}`);
  if (response.statusCode === 200) {
    process.exit(0);
  } else {
    process.exit(1);
  }
});

request.on('error', (error) => {
  console.error('Health check failed:', error.message);
  process.exit(1);
});

request.on('timeout', () => {
  console.error('Health check timed out');
  request.destroy();
  process.exit(1);
});

request.end();
```

## MongoDB Setup

Although the current application uses JSON files for data storage, MongoDB is included for future development:

1. **Initial Setup**: MongoDB is initialized with a root user and database
2. **Custom Initialization**: Scripts can be placed in `./mongo-init/` to run on startup
3. **Data Persistence**: MongoDB data is stored in a named volume `mongodb_data`

## Future Docker Enhancements

Planned improvements for the Docker setup:

1. **Multi-stage Builds**: Further optimize image size with build stages
2. **Production vs Development**: Dedicated Docker Compose files for different environments
3. **CI/CD Integration**: Automated building and testing with GitHub Actions
4. **Kubernetes Support**: Kubernetes manifests for orchestrated deployment
5. **Image Signing**: Implementing Docker Content Trust for security

## Troubleshooting

Common issues and solutions:

1. **Container fails to start**:

   - Check logs: `docker-compose logs web`
   - Verify port availability: `netstat -tulpn | grep 3000`

2. **MongoDB connection issues**:

   - Ensure MongoDB container is running: `docker-compose ps mongo`
   - Check MongoDB logs: `docker-compose logs mongo`
   - Verify network connectivity: `docker-compose exec web ping mongo`

3. **Volume permission issues**:
   - Ensure proper ownership: `sudo chown -R 1001:1001 ./data`
   - Check volume mounts: `docker-compose exec web ls -la /app/data`

#!/bin/bash
# Helper script for Docker operations

# Color definitions
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color
BOLD='\033[1m'

# Print header
echo -e "${BOLD}========================================${NC}"
echo -e "${BOLD} Pokemon LinkedIn Docker Helper Script ${NC}"
echo -e "${BOLD}========================================${NC}"
echo

# Function to check if docker is running
check_docker() {
  if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}Error: Docker is not running.${NC}"
    echo "Please start Docker and try again."
    exit 1
  fi
}

# Display usage information
usage() {
  echo -e "Usage: ${YELLOW}$0 COMMAND${NC}"
  echo
  echo "Commands:"
  echo -e "  ${GREEN}start${NC}        Start the application"
  echo -e "  ${GREEN}stop${NC}         Stop the application"
  echo -e "  ${GREEN}restart${NC}      Restart the application"
  echo -e "  ${GREEN}logs${NC}         View container logs"
  echo -e "  ${GREEN}status${NC}       View container status"
  echo -e "  ${GREEN}shell${NC}        Open shell in web container"
  echo -e "  ${GREEN}mongo-shell${NC}  Open MongoDB shell"
  echo -e "  ${GREEN}clean${NC}        Remove all containers and volumes"
  echo -e "  ${GREEN}rebuild${NC}      Rebuild and restart containers"
  echo -e "  ${GREEN}help${NC}         Display this help message"
  echo
}

# Check for command argument
if [ $# -lt 1 ]; then
  usage
  exit 1
fi

# Check if docker is running
check_docker

# Process command
case "$1" in
  start)
    echo -e "${YELLOW}Starting Pokemon LinkedIn application...${NC}"
    docker-compose up -d
    echo -e "${GREEN}Application is running at http://localhost:3000${NC}"
    ;;
    
  stop)
    echo -e "${YELLOW}Stopping Pokemon LinkedIn application...${NC}"
    docker-compose down
    echo -e "${GREEN}Application stopped${NC}"
    ;;
    
  restart)
    echo -e "${YELLOW}Restarting Pokemon LinkedIn application...${NC}"
    docker-compose restart
    echo -e "${GREEN}Application restarted${NC}"
    ;;
    
  logs)
    echo -e "${YELLOW}Showing logs (Ctrl+C to exit)...${NC}"
    docker-compose logs -f
    ;;
    
  status)
    echo -e "${YELLOW}Container status:${NC}"
    docker-compose ps
    ;;
    
  shell)
    echo -e "${YELLOW}Opening shell in web container...${NC}"
    docker-compose exec web sh
    ;;
    
  mongo-shell)
    echo -e "${YELLOW}Opening MongoDB shell...${NC}"
    docker-compose exec mongo mongosh -u admin -p pokemon123 pokemon_db
    ;;
    
  clean)
    echo -e "${RED}WARNING: This will remove all containers and volumes!${NC}"
    read -p "Are you sure you want to continue? (y/N) " choice
    if [[ "$choice" =~ ^[Yy]$ ]]; then
      echo -e "${YELLOW}Removing containers and volumes...${NC}"
      docker-compose down -v
      echo -e "${GREEN}Cleanup complete${NC}"
    else
      echo "Operation cancelled"
    fi
    ;;
    
  rebuild)
    echo -e "${YELLOW}Rebuilding and restarting containers...${NC}"
    docker-compose down
    docker-compose build --no-cache
    docker-compose up -d
    echo -e "${GREEN}Rebuild complete. Application is running at http://localhost:3000${NC}"
    ;;
    
  help|*)
    usage
    ;;
esac

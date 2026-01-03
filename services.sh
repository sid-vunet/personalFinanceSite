#!/bin/bash

# Family Finance App - Service Manager
# Usage: ./services.sh [start|stop|status|restart]

# Configuration
PROJECT_DIR="/Users/sidharthan/Documents/FinancialExpenses"
BACKEND_DIR="$PROJECT_DIR/backend"
FRONTEND_DIR="$PROJECT_DIR"
API_PORT=3001
FRONTEND_PORT=4321
API_BINARY="family-finance-api"
API_LOG="$BACKEND_DIR/api.log"
FRONTEND_LOG="$PROJECT_DIR/frontend.log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print colored status
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if a port is in use
is_port_in_use() {
    lsof -i ":$1" -sTCP:LISTEN >/dev/null 2>&1
}

# Get PID of process on a port
get_pid_on_port() {
    lsof -t -i ":$1" -sTCP:LISTEN 2>/dev/null | head -1
}

# Check API status
check_api_status() {
    if is_port_in_use $API_PORT; then
        local pid=$(get_pid_on_port $API_PORT)
        echo -e "  API Server:      ${GREEN}●${NC} Running (PID: $pid, Port: $API_PORT)"
        return 0
    else
        echo -e "  API Server:      ${RED}○${NC} Stopped"
        return 1
    fi
}

# Check Frontend status
check_frontend_status() {
    if is_port_in_use $FRONTEND_PORT; then
        local pid=$(get_pid_on_port $FRONTEND_PORT)
        echo -e "  Frontend:        ${GREEN}●${NC} Running (PID: $pid, Port: $FRONTEND_PORT)"
        return 0
    else
        echo -e "  Frontend:        ${RED}○${NC} Stopped"
        return 1
    fi
}

# Build the API if needed
build_api() {
    print_status "Building API..."
    cd "$BACKEND_DIR"
    if go build -o "$API_BINARY" 2>&1; then
        print_success "API built successfully"
        return 0
    else
        print_error "Failed to build API"
        return 1
    fi
}

# Start API server
start_api() {
    if is_port_in_use $API_PORT; then
        print_warning "API server already running on port $API_PORT"
        return 0
    fi

    cd "$BACKEND_DIR"
    
    # Build if binary doesn't exist or source is newer
    if [ ! -f "$API_BINARY" ] || [ "main.go" -nt "$API_BINARY" ]; then
        build_api || return 1
    fi

    print_status "Starting API server..."
    PORT=$API_PORT nohup ./"$API_BINARY" > "$API_LOG" 2>&1 &
    
    # Wait for startup
    sleep 2
    
    if is_port_in_use $API_PORT; then
        print_success "API server started on port $API_PORT"
        return 0
    else
        print_error "Failed to start API server. Check $API_LOG for details"
        return 1
    fi
}

# Start Frontend
start_frontend() {
    if is_port_in_use $FRONTEND_PORT; then
        print_warning "Frontend already running on port $FRONTEND_PORT"
        return 0
    fi

    cd "$FRONTEND_DIR"
    
    print_status "Starting frontend dev server..."
    nohup npm run dev > "$FRONTEND_LOG" 2>&1 &
    
    # Wait for startup
    sleep 3
    
    if is_port_in_use $FRONTEND_PORT; then
        print_success "Frontend started on port $FRONTEND_PORT"
        return 0
    else
        print_error "Failed to start frontend. Check $FRONTEND_LOG for details"
        return 1
    fi
}

# Stop API server
stop_api() {
    if ! is_port_in_use $API_PORT; then
        print_warning "API server is not running"
        return 0
    fi

    local pid=$(get_pid_on_port $API_PORT)
    print_status "Stopping API server (PID: $pid)..."
    kill "$pid" 2>/dev/null
    sleep 1
    
    if is_port_in_use $API_PORT; then
        print_warning "Graceful stop failed, forcing..."
        kill -9 "$pid" 2>/dev/null
        sleep 1
    fi
    
    if ! is_port_in_use $API_PORT; then
        print_success "API server stopped"
        return 0
    else
        print_error "Failed to stop API server"
        return 1
    fi
}

# Stop Frontend
stop_frontend() {
    if ! is_port_in_use $FRONTEND_PORT; then
        print_warning "Frontend is not running"
        return 0
    fi

    local pid=$(get_pid_on_port $FRONTEND_PORT)
    print_status "Stopping frontend (PID: $pid)..."
    kill "$pid" 2>/dev/null
    sleep 1
    
    if is_port_in_use $FRONTEND_PORT; then
        print_warning "Graceful stop failed, forcing..."
        kill -9 "$pid" 2>/dev/null
        sleep 1
    fi
    
    if ! is_port_in_use $FRONTEND_PORT; then
        print_success "Frontend stopped"
        return 0
    else
        print_error "Failed to stop frontend"
        return 1
    fi
}

# Show status
show_status() {
    echo ""
    echo "╔══════════════════════════════════════════════╗"
    echo "║     Family Finance App - Service Status      ║"
    echo "╠══════════════════════════════════════════════╣"
    echo "║                                              ║"
    check_api_status
    check_frontend_status
    echo "║                                              ║"
    echo "╠══════════════════════════════════════════════╣"
    echo "║  URLs:                                       ║"
    if is_port_in_use $FRONTEND_PORT; then
        echo -e "║    Frontend: ${GREEN}http://localhost:$FRONTEND_PORT${NC}        ║"
    else
        echo "║    Frontend: Not available                   ║"
    fi
    if is_port_in_use $API_PORT; then
        echo -e "║    API:      ${GREEN}http://localhost:$API_PORT${NC}           ║"
    else
        echo "║    API:      Not available                   ║"
    fi
    echo "╚══════════════════════════════════════════════╝"
    echo ""
}

# Start all services
start_all() {
    echo ""
    echo "Starting Family Finance App services..."
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    start_api
    start_frontend
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    show_status
}

# Stop all services
stop_all() {
    echo ""
    echo "Stopping Family Finance App services..."
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    stop_frontend
    stop_api
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    show_status
}

# Restart all services
restart_all() {
    echo ""
    echo "Restarting Family Finance App services..."
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    stop_all
    sleep 1
    start_all
}

# Show logs
show_logs() {
    case "$1" in
        api)
            if [ -f "$API_LOG" ]; then
                print_status "API logs (last 50 lines):"
                tail -50 "$API_LOG"
            else
                print_warning "No API logs found"
            fi
            ;;
        frontend)
            if [ -f "$FRONTEND_LOG" ]; then
                print_status "Frontend logs (last 50 lines):"
                tail -50 "$FRONTEND_LOG"
            else
                print_warning "No frontend logs found"
            fi
            ;;
        *)
            print_status "Usage: $0 logs [api|frontend]"
            ;;
    esac
}

# Print usage
print_usage() {
    echo ""
    echo "Family Finance App - Service Manager"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "Usage: $0 <command>"
    echo ""
    echo "Commands:"
    echo "  start      Start all services (API + Frontend)"
    echo "  stop       Stop all services"
    echo "  restart    Restart all services"
    echo "  status     Show service status"
    echo "  logs       Show logs (usage: $0 logs [api|frontend])"
    echo "  build      Rebuild the API binary"
    echo ""
    echo "Examples:"
    echo "  $0 start           # Start both services"
    echo "  $0 status          # Check if services are running"
    echo "  $0 logs api        # View API logs"
    echo "  $0 restart         # Restart everything"
    echo ""
}

# Main command handler
case "$1" in
    start)
        start_all
        ;;
    stop)
        stop_all
        ;;
    restart)
        restart_all
        ;;
    status)
        show_status
        ;;
    logs)
        show_logs "$2"
        ;;
    build)
        build_api
        ;;
    *)
        print_usage
        ;;
esac

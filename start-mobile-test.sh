#!/bin/bash
# Start HEARTH dev server for mobile testing

cd "$(dirname "$0")"

echo "🔥 HEARTH Mobile Testing"
echo "========================"
echo ""

# Get IP addresses
TAILSCALE_IP=$(ip addr show tailscale0 2>/dev/null | grep -oP 'inet \K[\d.]+' || echo "Not available")
LOCAL_IP=$(hostname -I | awk '{print $1}')

echo "📱 Access HEARTH on your iPhone at:"
echo ""
echo "   Via Tailscale (recommended):"
echo "   http://$TAILSCALE_IP:3000"
echo ""
echo "   Via local network:"
echo "   http://$LOCAL_IP:3000"
echo ""
echo "Starting dev server..."
echo "Press Ctrl+C to stop"
echo ""

# Start Vite dev server
npm run dev

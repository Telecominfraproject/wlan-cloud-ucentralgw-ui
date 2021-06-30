#!/bin/ash
# Check if variables are set
export DEFAULT_GATEWAY_URL="${DEFAULT_GATEWAY_URL:-https://ucentral.dpaas.arilia.com:16001}"
export ALLOW_GATEWAY_CHANGE="${ALLOW_GATEWAY_CHANGE:-false}"

echo '{"DEFAULT_GATEWAY_URL": "'$DEFAULT_GATEWAY_URL'","ALLOW_GATEWAY_CHANGE": '$ALLOW_GATEWAY_CHANGE'}' > /usr/share/nginx/html/config.json

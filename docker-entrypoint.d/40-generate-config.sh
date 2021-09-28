#!/bin/ash
# Check if variables are set
export DEFAULT_OWSEC_URL="${DEFAULT_OWSEC_URL:-https://ucentral.dpaas.arilia.com:16001}"
export ALLOW_OWSEC_CHANGE="${ALLOW_OWSEC_CHANGE:-false}"

echo '{"DEFAULT_UCENTRALSEC_URL": "'$DEFAULT_UCENTRALSEC_URL'","ALLOW_UCENTRALSEC_CHANGE": '$ALLOW_UCENTRALSEC_CHANGE'}' > /usr/share/nginx/html/config.json

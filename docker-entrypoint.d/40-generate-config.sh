#!/bin/ash

ENV_CONFIG_PATH=/usr/share/nginx/html/env-config.js

# Recreate config file
rm -rf $ENV_CONFIG_PATH
touch $ENV_CONFIG_PATH

# Add assignment
echo "window._env_ = {" >> $ENV_CONFIG_PATH

# Read each line in .env file
# Each line represents key=value pairs
env | grep REACT_ | while read -r line || [[ -n "$line" ]];
do
  echo $line
  # Split env variables by character `=`
  if printf '%s\n' "$line" | grep -q -e '='; then
    varname=$(printf '%s\n' "$line" | sed -e 's/=.*//')
    varvalue=$(printf '%s\n' "$line" | sed -e 's/^[^=]*=//')
  fi

  # Read value of current variable if exists as Environment variable
  value=$(printf '%s\n' "${!varname}")
  # Otherwise use value from .env file
  [[ -z $value ]] && value=${varvalue}

  # Append configuration property to JS file
  echo "  $varname: \"$value\"," >> $ENV_CONFIG_PATH
done

echo "}" >> $ENV_CONFIG_PATH

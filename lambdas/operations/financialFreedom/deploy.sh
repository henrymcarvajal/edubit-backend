#!/bin/bash

RED=$(tput setaf 1)
YELLOW=$(tput setaf 3)
CYAN=$(tput setaf 6)
GREEN=$(tput setaf 2)
NC=$(tput sgr0)
STACK='Financial Freedom'

date '+%Y-%m-%d %H:%M:%S'
echo

serverless="serverless deploy -s $1"
if [ -n "$2" ]
then
  serverless+=" --$2"
fi
serverless+=" --verbose"

echo "Deploying to ${RED}$1${NC} environment:"
echo
echo "${CYAN}Deploying ${STACK} stack...${NC}"
echo "${YELLOW}> Updating Node dependencies...${NC}"
npm install
echo
echo "${YELLOW}> Running serverless profile...${NC}"
$serverless
echo
echo "${GREEN}+ ${STACK} stack deployed.${NC}"
echo

date '+%Y-%m-%d %H:%M:%S'
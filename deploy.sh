#!/bin/bash

RED=$(tput setaf 1)
YELLOW=$(tput setaf 3)
CYAN=$(tput setaf 6)
GREEN=$(tput setaf 2)
NC=$(tput sgr0)
BASE_PATH=$(pwd)

date '+%Y-%m-%d %H:%M:%S'

serverless="serverless deploy -s $1"
if [ -n "$2" ]
then
  serverless+=" --$2"
fi
serverless+=" --verbose"

echo
echo "Deploying to ${RED}$1${NC} environment:"
echo "${YELLOW}> Updating Node dependencies...${NC}"
npm install
echo

cd "${BASE_PATH}"/lambdas/commons/database/ || exit
echo "${CYAN}Deploying database stack...${NC}"
echo "${YELLOW}> Updating Node dependencies...${NC}"
npm install
echo
echo "${YELLOW}> Running serverless profile...${NC}"
$serverless
echo
echo "${GREEN}+ Database stack deployed.${NC}"
echo

cd "${BASE_PATH}"/lambdas/admin/ || exit
echo "${CYAN}Deploying Admin stack...${NC}"
echo "${YELLOW}> Updating Node dependencies...${NC}"
npm install
echo
echo "${YELLOW}> Running serverless profile...${NC}"
$serverless
echo
echo "${GREEN}+ Admin stack deployed.${NC}"
echo

cd "${BASE_PATH}"/lambdas/users/ || exit
echo "${CYAN}Deploying Users stack...${NC}"
echo "${YELLOW}> Updating Node dependencies...${NC}"
npm install
echo
echo "${YELLOW}> Running serverless profile...${NC}"
$serverless
echo
echo "${GREEN}+ Users stack deployed.${NC}"
echo

cd "${BASE_PATH}"/lambdas/workshops/ || exit
echo "${CYAN}Deploying workshops stack...${NC}"
echo "${YELLOW}> Updating Node dependencies...${NC}"
npm install
echo
echo "${YELLOW}> Running serverless profile...${NC}"
$serverless
echo
echo "${GREEN}+ Workshops stack deployed.${NC}"
echo

cd "${BASE_PATH}"/lambdas/schedulers/ || exit
echo "${CYAN}Deploying schedulers stack...${NC}"
echo "${YELLOW}> Updating Node dependencies...${NC}"
npm install
echo
echo "${YELLOW}> Running serverless profile...${NC}"
$serverless
echo
echo "${GREEN}+ Schedulers stack deployed.${NC}"
echo

cd "${BASE_PATH}"/lambdas/members/ || exit
echo "${CYAN}Deploying members stack...${NC}"
echo "${YELLOW}> Updating Node dependencies...${NC}"
npm install
echo
echo "${YELLOW}> Running serverless profile...${NC}"
$serverless
echo
echo "${GREEN}+ Members stack deployed.${NC}"
echo

date '+%Y-%m-%d %H:%M:%S'
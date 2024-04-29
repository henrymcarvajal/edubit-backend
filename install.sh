RED=$(tput setaf 1)
YELLOW=$(tput setaf 3)
CYAN=$(tput setaf 6)
GREEN=$(tput setaf 2)
NC=$(tput sgr0)
BASE_PATH=$(pwd)

date '+%Y-%m-%d %H:%M:%S'

echo
#echo "Updating to ${RED}$1${NC} environment:"
echo "${YELLOW}> Updating Node dependencies...${NC}"
npm install
echo

cd "${BASE_PATH}"/lambdas/commons/database/ || exit
echo "${CYAN}Updating database stack...${NC}"
echo "${YELLOW}> Updating Node dependencies...${NC}"
npm install
echo
#echo "${YELLOW}> Running #serverless profile...${NC}"
#serverless deploy -s "$1" --verbose
echo
echo "${GREEN}+ Database stack installed.${NC}"
echo

cd "${BASE_PATH}"/lambdas/admin/ || exit
echo "${CYAN}Updating Admin stack...${NC}"
echo "${YELLOW}> Updating Node dependencies...${NC}"
npm install
echo
#echo "${YELLOW}> Running #serverless profile...${NC}"
#serverless deploy -s "$1" --verbose
echo
echo "${GREEN}+ Admin stack installed.${NC}"
echo

cd "${BASE_PATH}"/lambdas/users/ || exit
echo "${CYAN}Updating Users stack...${NC}"
echo "${YELLOW}> Updating Node dependencies...${NC}"
npm install
echo
#echo "${YELLOW}> Running #serverless profile...${NC}"
#serverless deploy -s "$1" --verbose
echo
echo "${GREEN}+ Users stack installed.${NC}"
echo

cd "${BASE_PATH}"/lambdas/workshops/ || exit
echo "${CYAN}Updating workshops stack...${NC}"
echo "${YELLOW}> Updating Node dependencies...${NC}"
npm install
echo
#echo "${YELLOW}> Running #serverless profile...${NC}"
#serverless deploy -s "$1" --verbose
echo
echo "${GREEN}+ Workshops stack installed.${NC}"
echo

cd "${BASE_PATH}"/lambdas/schedulers/ || exit
echo "${CYAN}Updating schedulers stack...${NC}"
echo "${YELLOW}> Updating Node dependencies...${NC}"
npm install
echo
#echo "${YELLOW}> Running #serverless profile...${NC}"
#serverless deploy -s "$1" --verbose
echo
echo "${GREEN}+ Schedulers stack installed.${NC}"
echo

cd "${BASE_PATH}"/lambdas/members/ || exit
echo "${CYAN}Updating members stack...${NC}"
echo "${YELLOW}> Updating Node dependencies...${NC}"
npm install
echo
#echo "${YELLOW}> Running #serverless profile...${NC}"
#serverless deploy -s "$1" --verbose
echo
echo "${GREEN}+ Members stack installed.${NC}"
echo

date '+%Y-%m-%d %H:%M:%S'
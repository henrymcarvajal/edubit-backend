# <span style="color:#83A2FF">Schedulers</span>
All operations related to the timers belonging to scheduled workshops.

- ### <span style="color:#FFE3BB">Get scheduler</span>
curl --request GET \ <br/>
--url https://bzyw0cecwc.execute-api.us-east-1.amazonaws.com/dev/schedulers/{id} \ <br/>
--header 'Authorization: Bearer {token}'

- ### <span style="color:#FFE3BB">Start scheduler</span>
curl --request POST \ <br/>
--url https://bzyw0cecwc.execute-api.us-east-1.amazonaws.com/dev/schedulers/{id}/start \ <br/>
--header 'Authorization: Bearer {token}'

- ### <span style="color:#FFE3BB">Pause scheduler</span>
curl --request PATCH \ <br/>
--url https://bzyw0cecwc.execute-api.us-east-1.amazonaws.com/dev/schedulers/{id}/pause \ <br/>
--header 'Authorization: Bearer {token}'

- ### <span style="color:#FFE3BB">Resume scheduler</span>
curl --request PATCH \ <br/>
--url https://bzyw0cecwc.execute-api.us-east-1.amazonaws.com/dev/schedulers/{id}/resume \ <br/>
--header 'Authorization: Bearer {token}'

- ### <span style="color:#FFE3BB">Stop scheduler</span>
curl --request DELETE \ <br/>
--url https://bzyw0cecwc.execute-api.us-east-1.amazonaws.com/dev/schedulers/{id}/stop \ <br/>
--header 'Authorization: Bearer {token}'
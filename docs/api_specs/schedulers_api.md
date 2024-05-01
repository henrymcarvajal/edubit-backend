# ${\textsf{\color{#83A2FF}Schedulers}}$
All operations related to the timers belonging to scheduled workshops.

- ### ${\textsf{\color{#FFE3BB}Get scheduler}}$
curl --request GET \ <br/>
--url https://bzyw0cecwc.execute-api.us-east-1.amazonaws.com/dev/schedulers/{id} \ <br/>
--header 'Authorization: Bearer {token}'

- ### ${\textsf{\color{#FFE3BB}Start scheduler}}$
curl --request POST \ <br/>
--url https://bzyw0cecwc.execute-api.us-east-1.amazonaws.com/dev/schedulers/{id}/start \ <br/>
--header 'Authorization: Bearer {token}'

- ### ${\textsf{\color{#FFE3BB}Pause scheduler}}$
curl --request PATCH \ <br/>
--url https://bzyw0cecwc.execute-api.us-east-1.amazonaws.com/dev/schedulers/{id}/pause \ <br/>
--header 'Authorization: Bearer {token}'

- ### ${\textsf{\color{#FFE3BB}Resume scheduler}}$
curl --request PATCH \ <br/>
--url https://bzyw0cecwc.execute-api.us-east-1.amazonaws.com/dev/schedulers/{id}/resume \ <br/>
--header 'Authorization: Bearer {token}'

- ### ${\textsf{\color{#FFE3BB}Stop scheduler}}$
curl --request DELETE \ <br/>
--url https://bzyw0cecwc.execute-api.us-east-1.amazonaws.com/dev/schedulers/{id}/stop \ <br/>
--header 'Authorization: Bearer {token}'
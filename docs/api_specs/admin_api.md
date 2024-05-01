# ${\textsf{\color{#83A2FF}Admin}}$
All operations related to managed entities, like activities, institutions, etc.

## ${\textsf{\color{#FD8A8A}Activities}}$
All operations specific to the activities participants can carry out during a workshop 

- ### ${\textsf{\color{#FFE3BB}Get all activities}}$
   curl --request GET \ <br/> 
--url https://78vxincnn2.execute-api.us-east-1.amazonaws.com/dev/admin/activities \ <br/>
--header 'Authorization: Bearer {token}'

- ### ${\textsf{\color{#FFE3BB}Get activity}}$
   curl --request GET \ <br/>
--url https://78vxincnn2.execute-api.us-east-1.amazonaws.com/dev/admin/activities/{id} \ <br/>
--header 'Authorization: Bearer {token}'

- ### ${\textsf{\color{#FFE3BB}Update activity}}$
   curl --request PATCH \ <br/>
--url https://78vxincnn2.execute-api.us-east-1.amazonaws.com/dev/admin/activities/{id} \ <br/>
--header 'Authorization: Bearer {token}' \ <br/>
--header 'Content-Type: application/json' \ <br/>
--data '{<br/>
"id": "{id}",<br/>
"name": "{name}",<br/>
"levels": "{levels}",<br/>
"abilities": "{abilities}",<br/>
"description": "{description}"<br/>
}'

- ### ${\textsf{\color{#FFE3BB}Disable activity (Logical)}}$
   curl --request DELETE \ <br/>
--url https://78vxincnn2.execute-api.us-east-1.amazonaws.com/dev/admin/activities/{id} \ <br/>
--header 'Authorization: Bearer {token}'

## ${\textsf{\color{#FD8A8A}Assets}}$
All operations specific to the assets participants can buy during a workshop

- ### ${\textsf{\color{#FFE3BB}Get all assets}}$
   curl --request GET \ <br/>
--url https://78vxincnn2.execute-api.us-east-1.amazonaws.com/dev/admin/assets \ <br/>
--header 'Authorization: Bearer {token}'

- ### ${\textsf{\color{#FFE3BB}Get asset}}$
   curl --request GET \ <br/>
--url https://78vxincnn2.execute-api.us-east-1.amazonaws.com/dev/admin/assets/{id} \ <br/>
--header 'Authorization: Bearer {token}'

- ### ${\textsf{\color{#FFE3BB}Update asset}}$
   curl --request PATCH \ <br/>
--url https://78vxincnn2.execute-api.us-east-1.amazonaws.com/dev/admin/assets/{id} \ <br/>
--header 'Authorization: Bearer {token}' \ <br/>
--header 'Content-Type: application/json' \ <br/>
--data '{<br/>
"id": "{id}",<br/>
"title": "{title}",<br/>
"description": "{description}",<br/>
"price": "{price}"<br/>
}'

- ### ${\textsf{\color{#FFE3BB}Delete asset (Logical)}}$
   curl --request DELETE \ <br/>
--url https://78vxincnn2.execute-api.us-east-1.amazonaws.com/dev/admin/assets/{id} \ <br/>
--header 'Authorization: Bearer {token}'

## ${\textsf{\color{#FD8A8A}Improvements}}$
All operations specific to the improvements participants can acquire during a workshop

- ### ${\textsf{\color{#FFE3BB}Get all improvements}}$
   curl --request GET \ <br/>
--url https://78vxincnn2.execute-api.us-east-1.amazonaws.com/dev/admin/improvements \ <br/>
--header 'Authorization: Bearer {token}'

- ### ${\textsf{\color{#FFE3BB}Get improvement}}$
   curl --request GET \ <br/>
--url https://78vxincnn2.execute-api.us-east-1.amazonaws.com/dev/admin/improvements/{id} \ <br/>
--header 'Authorization: Bearer {token}'

- ### ${\textsf{\color{#FFE3BB}Update improvement}}$
   curl --request PATCH \ <br/>
--url https://78vxincnn2.execute-api.us-east-1.amazonaws.com/dev/admin/improvements/{id} \ <br/>
--header 'Authorization: Bearer {token}' \ <br/>
--header 'Content-Type: application/json' \ <br/>
--data '{<br/>
"id": "{id}",<br/>
"name": "{name}",<br/>
"description": "{description}",<br/>
"price": "{price}"<br/>
}'

- ### ${\textsf{\color{#FFE3BB}Delete improvement (Logical)}}$
   curl --request DELETE \ <br/>
--url https://78vxincnn2.execute-api.us-east-1.amazonaws.com/dev/admin/improvements/{id} \ <br/>
--header 'Authorization: Bearer {token}'

## ${\textsf{\color{#FD8A8A}Institutions}}$
All operations specific to the institutions where workshops can take place at

- ### ${\textsf{\color{#FFE3BB}Get all institutions}}$
   curl --request GET \ <br/>
--url https://78vxincnn2.execute-api.us-east-1.amazonaws.com/dev/admin/institutions \ <br/>
--header 'Authorization: Bearer {token}'

- ### ${\textsf{\color{#FFE3BB}Get institution}}$
   curl --request GET \ <br/>
--url https://78vxincnn2.execute-api.us-east-1.amazonaws.com/dev/admin/institutions/{id} \ <br/>
--header 'Authorization: Bearer {token}'

- ### ${\textsf{\color{#FFE3BB}Update institution}}$
   curl --request PATCH \ <br/>
--url https://78vxincnn2.execute-api.us-east-1.amazonaws.com/dev/admin/institutions/{id} \ <br/>
--header 'Authorization: Bearer {token}' \ <br/>
--header 'Content-Type: application/json' \ <br/>
--data '{<br/>
"id": "{id}",<br/>
"name": "{name}"<br/>
}'

- ### ${\textsf{\color{#FFE3BB}Delete institution (Logical)}}$
   curl --request DELETE \ <br/>
--url https://78vxincnn2.execute-api.us-east-1.amazonaws.com/dev/admin/institutions/{id} \ <br/>
--header 'Authorization: Bearer {token}'
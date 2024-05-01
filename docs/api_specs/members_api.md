# ${\textsf{\color{#83A2FF}Members}}$
All operations related to involved members related to workshop executions.

## ${\textsf{\color{#FD8A8A}Participants}}$
All operations specific to participants, who are the people taking the workshop for learning.

- ### ${\textsf{\color{#FFE3BB}Get participant}}$
   curl --request GET \ <br/>
--url https://ar0elk0gz9.execute-api.us-east-1.amazonaws.com/dev/participants/{id} \ <br/>
--header 'Authorization: Bearer {token}'

- ### ${\textsf{\color{#FFE3BB}Update participant}}$
   curl --request PATCH \ <br/>
--url https://ar0elk0gz9.execute-api.us-east-1.amazonaws.com/dev/participants/ef7d63e2-a1c9-42c3-9b56-b6b539d76010 \ <br/>
--header 'Authorization: Bearer {token}' \ <br/>
--header 'Content-Type: application/json' \ <br/>
--data '{<br/>
"id": "{id}",<br/>
"name": "{name}",<br/>
"email": "{email}",<br/>
"grade": {grade},<br/>
"activities": {<br/>
"0": "{uuid}",<br/>
"1": "{uuid}",<br/>
"2": "{uuid}",
...<br/>
}<br/>
}'

- ### ${\textsf{\color{#FFE3BB}Enroll participant}}$
   curl --request POST \ <br/>
--url https://ar0elk0gz9.execute-api.us-east-1.amazonaws.com/dev/participants/{id}/enrollment \ <br/>
--header 'Authorization: Bearer {token}' \ <br/>
--header 'Content-Type: application/json' \ <br/>
--data '{<br/>
"activities": {<br/>
"0": "{uuid}",<br/>
"1": "{uuid}",<br/>
**"2": "{uuid}",
...<br/>
},<br/>
"workshopExecutionId": "{uuid}"<br/>
}'

- ### ${\textsf{\color{#FFE3BB}Delete participant (Logical)}}$
   curl --request DELETE \ <br/>
--url https://ar0elk0gz9.execute-api.us-east-1.amazonaws.com/dev/participants/{id} \ <br/>
--header 'Authorization: Bearer {token}'

## ${\textsf{\color{#FD8A8A}Mentors}}$
All operations specific to the members that will act as authority to participants

- ### ${\textsf{\color{#FFE3BB}Get mentor}}$
   curl --request GET \ <br/>
--url https://ar0elk0gz9.execute-api.us-east-1.amazonaws.com/dev/mentors/{id} \ <br/>
--header 'Authorization: Bearer {token}'

- ### ${\textsf{\color{#FFE3BB}Update mentor}}$
   curl --request PATCH \ <br/>
--url https://ar0elk0gz9.execute-api.us-east-1.amazonaws.com/dev/mentors/{id} \ <br/>
--header 'Authorization: Bearer {token}' \ <br/>
--header 'Content-Type: application/json' \ <br/>
--data '{<br/>
"id": "{id}",<br/>
"email": "{email}",<br/>
"phone": {phone},<br/>
"activities": {<br/>
"0": "{uuid}",<br/>
"1": "{uuid}",<br/>
"2": "{uuid}",
...<br/>
}<br/>
}'

- ### ${\textsf{\color{#FFE3BB}Enroll mentor}}$
  curl --request POST \ <br/>
--url https://ar0elk0gz9.execute-api.us-east-1.amazonaws.com/dev/mentors/{id}/enrollment \ <br/>
--header 'Authorization: Bearer {token}' \ <br/>
--header 'Content-Type: application/json' \ <br/>
--data '{<br/>
"activities": {<br/>
"0": "{uuid}",<br/>
"1": "{uuid}",<br/>
"2": "{uuid}",
...<br/>
},<br/>
"workshopExecutionId": "{uuid}"<br/>
}'

- ### ${\textsf{\color{#FFE3BB}Delete mentor (Logical)}}$
   curl --request DELETE \ <br/>
--url https://ar0elk0gz9**.execute-api.us-east-1.amazonaws.com/dev/admin/mentors/{id}  \ <br/>
--header 'Authorization: Bearer {token}'


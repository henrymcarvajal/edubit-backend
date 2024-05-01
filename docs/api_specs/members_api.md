# <span style="color:#83A2FF">Members</span>
All operations related to involved members related to workshop executions.

## <span style="color:#FD8A8A">Participants</span>
All operations specific to participants, who are the people taking the workshop for learning.

- ### <span style="color:#FFE3BB">Get participant</span>
   curl --request GET \ <br/>
--url https://ar0elk0gz9.execute-api.us-east-1.amazonaws.com/dev/participants/{id} \ <br/>
--header 'Authorization: Bearer {token}'

- ### <span style="color:#FFE3BB">Update participant</span>
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

- ### <span style="color:#FFE3BB">Enroll participant</span>
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

- ### <span style="color:#FFE3BB">Delete participant (Logical)</span>
   curl --request DELETE \ <br/>
--url https://ar0elk0gz9.execute-api.us-east-1.amazonaws.com/dev/participants/{id} \ <br/>
--header 'Authorization: Bearer {token}'

## <span style="color:#FD8A8A">Mentors</span>
All operations specific to the members that will act as authority to participants

- ### <span style="color:#FFE3BB">Get mentor</span>
   curl --request GET \ <br/>
--url https://ar0elk0gz9.execute-api.us-east-1.amazonaws.com/dev/mentors/{id} \ <br/>
--header 'Authorization: Bearer {token}'

- ### <span style="color:#FFE3BB">Update mentor</span>
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

- ### <span style="color:#FFE3BB">Enroll mentor</span>
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

- ### <span style="color:#FFE3BB">Delete mentor (Logical)</span>
   curl --request DELETE \ <br/>
--url https://ar0elk0gz9**.execute-api.us-east-1.amazonaws.com/dev/admin/mentors/{id}  \ <br/>
--header 'Authorization: Bearer {token}'


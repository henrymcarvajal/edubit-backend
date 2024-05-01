# <span style="color:#83A2FF">Workshops</span>
All operations related with workshop (their definitions and instances).

## <span style="color:#FD8A8A">Definitions</span>
All operations specific to workshop definitions.

- ### <span style="color:#FFE3BB">Get definition</span>
   curl --request GET \ <br/>
--url https://ohfjp11sb7.execute-api.us-east-1.amazonaws.com/dev/workshops/definitions \ <br/>
--header 'Authorization: Bearer {token}'

- ### <span style="color:#FFE3BB">Update definition</span>
   curl --request PATCH \ <br/>
--url https://ohfjp11sb7.execute-api.us-east-1.amazonaws.com/dev/workshops/definitions/{id} \ <br/>
--header 'Authorization: Bearer {token}' \ <br/>
--header 'Content-Type: application/json' \ <br/>
--data '{<br/>
"id": "{id}",<br/>
"name": "{name}",<br/>
"schedule": {<br/>
"0": {<br/>
"duration": {duration},<br/>
"description": "{description}"<br/>
},<br/>
"1": {<br/>
"duration": {duration},<br/>
"description": "{description}"<br/>
},<br/>
"2": {<br/>
"duration": {duration},<br/>
"description": "{description}"<br/>
},<br/>
...<br/>
}<br/>
}'

- ### <span style="color:#FFE3BB">Delete definition (Logical)</span>
   curl --request DELETE \ <br/>
--url https://ohfjp11sb7.execute-api.us-east-1.amazonaws.com/dev/workshops/definitions/{id} \ <br/>
--header 'Authorization: Bearer {token}'

## <span style="color:#FD8A8A">Executions</span>
All operations specific to the dates the workshop is scheduled 

- ### <span style="color:#FFE3BB">Get execution</span>
   curl --request GET \ <br/>
--url https://ohfjp11sb7.execute-api.us-east-1.amazonaws.com/dev/workshops/executions/{id} \ <br/>
--header 'Authorization: Bearer {token}'

- ### <span style="color:#FFE3BB">Update execution</span>
   curl --request PATCH \ <br/>
--url https://ohfjp11sb7.execute-api.us-east-1.amazonaws.com/dev/workshops/executions/{id} \ <br/>
--header 'Authorization: Bearer {token}' \ <br/>
--header 'Content-Type: application/json' \ <br/>
--data '{<br/>
"id": "{id}",<br/>
"workshopDefinitionId": "{workshopDefinitionId}",<br/>
"scheduledDate": "YYYY-MM-DD",<br/>
"remainingTime": remainingTime,<br/>
"participants": {<br/>
"0": {<br/>
"participantId": "{uuid}",<br/>
"inscriptionDate": "{YYYY-MM-DDTHH:mm:ss.sssZ}"<br/>
},<br/>
"1": {<br/>
"participantId": "{uuid}",<br/>
"inscriptionDate": "{YYYY-MM-DDTHH:mm:ss.sssZ}"<br/>
},<br/>
"2": {<br/>
"participantId": "{uuid}",<br/>
"inscriptionDate": "{YYYY-MM-DDTHH:mm:ss.sssZ}"<br/>
},<br/>
...<br/>
},<br/>
"activities": {<br/>
"0": "{uuid}",<br/>
"1": "{uuid}",<br/>
"2": "{uuid}",
...<br/>
}<br/>
}'



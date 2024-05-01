# <span style="color:#83A2FF">Admin</span>
All operations related to managed entities, like activities, institutions, etc.

## <span style="color:#FD8A8A">Activities</span>
All operations specific to the activities participants can carry out during a workshop 

- ### <span style="color:#FFE3BB">Get all activities</span>
   curl --request GET \ <br/> 
--url https://78vxincnn2.execute-api.us-east-1.amazonaws.com/dev/admin/activities \ <br/>
--header 'Authorization: Bearer {token}'

- ### <span style="color:#FFE3BB">Get activity</span>
   curl --request GET \ <br/>
--url https://78vxincnn2.execute-api.us-east-1.amazonaws.com/dev/admin/activities/{id} \ <br/>
--header 'Authorization: Bearer {token}'

- ### <span style="color:#FFE3BB">Update activity</span>
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

- ### <span style="color:#FFE3BB">Disable activity (Logical)</span>
   curl --request DELETE \ <br/>
--url https://78vxincnn2.execute-api.us-east-1.amazonaws.com/dev/admin/activities/{id} \ <br/>
--header 'Authorization: Bearer {token}'

## <span style="color:#FD8A8A">Assets</span>
All operations specific to the assets participants can buy during a workshop

- ### <span style="color:#FFE3BB">Get all assets</span>
   curl --request GET \ <br/>
--url https://78vxincnn2.execute-api.us-east-1.amazonaws.com/dev/admin/assets \ <br/>
--header 'Authorization: Bearer {token}'

- ### <span style="color:#FFE3BB">Get asset</span>
   curl --request GET \ <br/>
--url https://78vxincnn2.execute-api.us-east-1.amazonaws.com/dev/admin/assets/{id} \ <br/>
--header 'Authorization: Bearer {token}'

- ### <span style="color:#FFE3BB">Update asset</span>
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

- ### <span style="color:#FFE3BB">Delete asset (Logical)</span>
   curl --request DELETE \ <br/>
--url https://78vxincnn2.execute-api.us-east-1.amazonaws.com/dev/admin/assets/{id} \ <br/>
--header 'Authorization: Bearer {token}'

## <span style="color:#FD8A8A">Improvements</span>
All operations specific to the improvements participants can acquire during a workshop

- ### <span style="color:#FFE3BB">Get all improvements</span>
   curl --request GET \ <br/>
--url https://78vxincnn2.execute-api.us-east-1.amazonaws.com/dev/admin/improvements \ <br/>
--header 'Authorization: Bearer {token}'

- ### <span style="color:#FFE3BB">Get improvement</span>
   curl --request GET \ <br/>
--url https://78vxincnn2.execute-api.us-east-1.amazonaws.com/dev/admin/improvements/{id} \ <br/>
--header 'Authorization: Bearer {token}'

- ### <span style="color:#FFE3BB">Update improvement</span>
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

- ### <span style="color:#FFE3BB">Delete improvement (Logical)</span>
   curl --request DELETE \ <br/>
--url https://78vxincnn2.execute-api.us-east-1.amazonaws.com/dev/admin/improvements/{id} \ <br/>
--header 'Authorization: Bearer {token}'

## <span style="color:#FD8A8A">Institutions</span>
All operations specific to the institutions where workshops can take place at

- ### <span style="color:#FFE3BB">Get all institutions</span>
   curl --request GET \ <br/>
--url https://78vxincnn2.execute-api.us-east-1.amazonaws.com/dev/admin/institutions \ <br/>
--header 'Authorization: Bearer {token}'

- ### <span style="color:#FFE3BB">Get institution</span>
   curl --request GET \ <br/>
--url https://78vxincnn2.execute-api.us-east-1.amazonaws.com/dev/admin/institutions/{id} \ <br/>
--header 'Authorization: Bearer {token}'

- ### <span style="color:#FFE3BB">Update institution</span>
   curl --request PATCH \ <br/>
--url https://78vxincnn2.execute-api.us-east-1.amazonaws.com/dev/admin/institutions/{id} \ <br/>
--header 'Authorization: Bearer {token}' \ <br/>
--header 'Content-Type: application/json' \ <br/>
--data '{<br/>
"id": "{id}",<br/>
"name": "{name}"<br/>
}'

- ### <span style="color:#FFE3BB">Delete institution (Logical)</span>
   curl --request DELETE \ <br/>
--url https://78vxincnn2.execute-api.us-east-1.amazonaws.com/dev/admin/institutions/{id} \ <br/>
--header 'Authorization: Bearer {token}'
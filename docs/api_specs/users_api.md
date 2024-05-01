# <span style="color:#83A2FF">Users</span>
Operations related to security operations like signing up, logging in, password change, etc.

- ### <span style="color:#FFE3BB">Sign up participant</span>
   curl --request POST \ <br/>
--url https://3392q94usk.execute-api.us-east-1.amazonaws.com/dev/users/signup/participant \ <br/>
--header 'Content-Type: application/json' \ <br/>
--data '{ <br/>
"name": "{name}",<br/>
"email": "{email}",<br/>
"password": "{password}",<br/>
"parentEmail": "{parentEmail}",<br/>
"parentPhone": {parentPhone},<br/>
"grade": {grade},<br/>
"activities": {<br/>
"0": "{uuid}",<br/>
"1": "{uuid}",<br/>
"2": "{uuid}",
...<br/>
}<br/>
}'

- ### <span style="color:#FFE3BB">Sign up mentor</span>
   curl --request POST \ <br/>
--url https://3392q94usk.execute-api.us-east-1.amazonaws.com/dev/users/signup/mentor \ <br/>
--header 'Content-Type: application/json' \ <br/>
--data '{<br/>
"name": "{name}",<br/>
"email": "{email}",<br/>
"password": "{password}",<br/>
"phone": {phone},<br/>
"activities": {<br/>
"0": "{uuid}",<br/>
"1": "{uuid}",<br/>
"2": "{uuid}",
...<br/>
}<br/>
}'

- ### <span style="color:#FFE3BB">Log in</span>
   curl --request POST \ <br/>
--url https://3392q94usk.execute-api.us-east-1.amazonaws.com/dev/users/login \ <br/>
--header 'Content-Type: application/json' \ <br/>
--data '{<br/>
"email": "{email}",<br/>
"password": "{password}"<br/>
}'

- ### <span style="color:#FFE3BB">Change password</span>
   curl --request POST \ <br/>
--url https://3392q94usk.execute-api.us-east-1.amazonaws.com/dev/users/password/change \ <br/>
--header 'Content-Type: application/json' \ <br/>
--data '{<br/>
"email": "{email}"<br/>
}'

- ### <span style="color:#FFE3BB">Confirm change password</span>
   curl --request POST \ <br/>
--url https://3392q94usk.execute-api.us-east-1.amazonaws.com/dev/users/password/change/confirm \ <br/>
--header 'Content-Type: application/json' \ <br/>
--data '{<br/>
"email": "{email}",<br/>
"newPassword": "{newPassword}",<br/>
"token": "{token}"<br/>
}'
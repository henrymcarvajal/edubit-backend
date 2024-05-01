# ${\textsf{\color{#83A2FF}Users}}$
Operations related to security operations like signing up, logging in, password change, etc.

- ### ${\textsf{\color{#FFE3BB}Sign up participant}}$
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

- ### ${\textsf{\color{#FFE3BB}Sign up mentor}}$
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

- ### ${\textsf{\color{#FFE3BB}Log in}}$
   curl --request POST \ <br/>
--url https://3392q94usk.execute-api.us-east-1.amazonaws.com/dev/users/login \ <br/>
--header 'Content-Type: application/json' \ <br/>
--data '{<br/>
"email": "{email}",<br/>
"password": "{password}"<br/>
}'

- ### ${\textsf{\color{#FFE3BB}Change password}}$
   curl --request POST \ <br/>
--url https://3392q94usk.execute-api.us-east-1.amazonaws.com/dev/users/password/change \ <br/>
--header 'Content-Type: application/json' \ <br/>
--data '{<br/>
"email": "{email}"<br/>
}'

- ### ${\textsf{\color{#FFE3BB}Confirm change password}}$
   curl --request POST \ <br/>
--url https://3392q94usk.execute-api.us-east-1.amazonaws.com/dev/users/password/change/confirm \ <br/>
--header 'Content-Type: application/json' \ <br/>
--data '{<br/>
"email": "{email}",<br/>
"newPassword": "{newPassword}",<br/>
"token": "{token}"<br/>
}'
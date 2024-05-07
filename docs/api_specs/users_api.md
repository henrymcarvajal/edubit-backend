# ${\textsf{\color{#83A2FF}Users}}$
Operations related to security operations like signing up, logging in, password change, etc.

### Sign up participant
```bash
curl --request POST \
--url https://3392q94usk.execute-api.us-east-1.amazonaws.com/dev/users/signup/participant \
--header 'Content-Type: application/json' \
--data '{
  "name": "{name}",
  "email": "{email}",
  "password": "{password}",
  "parentEmail": "{parentEmail}",
  "parentPhone": {parentPhone},
  "grade": {grade},
  "activities": {
    "0": "{uuid}",
    "1": "{uuid}",
    "2": "{uuid}",
    ...
  }
}'
```

### Sign up mentor
```bash
curl --request POST \
--url https://3392q94usk.execute-api.us-east-1.amazonaws.com/dev/users/signup/mentor \
--header 'Content-Type: application/json' \
--data '{
  "name": "{name}",
  "email": "{email}",
  "password": "{password}",
  "phone": {phone},
  "activities": {
    "0": "{uuid}",
    "1": "{uuid}",
    "2": "{uuid}",
    ...
  }
}'
```

### Log in
```bash
curl --request POST \
--url https://3392q94usk.execute-api.us-east-1.amazonaws.com/dev/users/login \
--header 'Content-Type: application/json' \
--data '{
  "email": "{email}",
  "password": "{password}"
}'
```

### Change password
```bash
curl --request POST \
--url https://3392q94usk.execute-api.us-east-1.amazonaws.com/dev/users/password/change \
--header 'Content-Type: application/json' \
--data '{
  "email": "{email}"
}'
```

### Confirm change password
```bash
curl --request POST \
--url https://3392q94usk.execute-api.us-east-1.amazonaws.com/dev/users/password/change/confirm \
--header 'Content-Type: application/json' \
--data '{
  "email": "{email}",
  "newPassword": "{newPassword}",
  "token": "{token}"
}'
```
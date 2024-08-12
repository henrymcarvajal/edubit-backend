# ${\textsf{\color{#83A2FF}Members}}$
All operations related to involved members related to workshop executions.

## ${\textsf{\color{#FD8A8A}Participants}}$
All operations specific to participants, who are the people taking the workshop for learning.

### Get participant
```bash
curl --request GET \
--url https://ar0elk0gz9.execute-api.us-east-1.amazonaws.com/dev/participants/{id} \
--header 'Authorization: Bearer {token}'
```

### Update participant
```bash
curl --request PATCH \
--url https://ar0elk0gz9.execute-api.us-east-1.amazonaws.com/dev/participants/ef7d63e2-a1c9-42c3-9b56-b6b539d76010 \
--header 'Authorization: Bearer {token}' \
--header 'Content-Type: application/json' \
--data '{
  "id": "{id}",
  "name": "{name}",
  "email": "{email}",
  "grade": {grade},
  "activities": {
    "0": "{uuid}",
    "1": "{uuid}",
    "2": "{uuid}",
    ...
  }
}'
```

### Enroll participant
```bash
curl --request POST \
--url https://ar0elk0gz9.execute-api.us-east-1.amazonaws.com/dev/participants/{id}/enrollment \
--header 'Authorization: Bearer {token}' \
--header 'Content-Type: application/json' \
--data '{
  "activities": {
    "0": "{uuid}",
    "1": "{uuid}",
    "2": "{uuid}",
    ...
  },
  "workshopExecutionId": "{uuid}"
}'
```

### Delete participant (Logical)
```bash
curl --request DELETE \
--url https://ar0elk0gz9.execute-api.us-east-1.amazonaws.com/dev/participants/{id} \
--header 'Authorization: Bearer {token}'
```

## ${\textsf{\color{#FD8A8A}Mentors}}$
All operations specific to the members that will act as authority to participants

### Get mentor
```bash
curl --request GET \
--url https://ar0elk0gz9.execute-api.us-east-1.amazonaws.com/dev/mentors/{id} \
--header 'Authorization: Bearer {token}'
```

### Update mentor
```bash
curl --request PATCH \
--url https://ar0elk0gz9.execute-api.us-east-1.amazonaws.com/dev/mentors/{id} \
--header 'Authorization: Bearer {token}' \
--header 'Content-Type: application/json' \
--data '{
  "id": "{id}",
  "email": "{email}",
  "phone": {phone},
  "activities": {
    "0": "{uuid}",
    "1": "{uuid}",
    "2": "{uuid}",
    ...
  }
}'
```

### Enroll mentor
```bash
curl --request POST \
--url https://ar0elk0gz9.execute-api.us-east-1.amazonaws.com/dev/mentors/{id}/enrollment \
--header 'Authorization: Bearer {token}' \
--header 'Content-Type: application/json' \
--data '{
  "activities": {
    "0": "{uuid}",
    "1": "{uuid}",
    "2": "{uuid}",
    ...
  },
  "workshopExecutionId": "{uuid}"
}'
```

### Delete mentor (Logical)
```bash
curl --request DELETE \
--url https://ar0elk0gz9.execute-api.us-east-1.amazonaws.com/dev/admin/mentors/{id}  \
--header 'Authorization: Bearer {token}'
```


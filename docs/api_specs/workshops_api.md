# ${\textsf{\color{#83A2FF}Workshops}}$
All operations related with workshop (their definitions and instances).

## ${\textsf{\color{#FD8A8A}Definitions}}$
All operations specific to workshop definitions.

### ${\textsf{\color{#FFE3BB}Get definition}}$
```bash
curl --request GET \
--url https://ohfjp11sb7.execute-api.us-east-1.amazonaws.com/dev/workshops/definitions \
--header 'Authorization: Bearer {token}'
```

### ${\textsf{\color{#FFE3BB}Update definition}}$
```bash
curl --request PATCH \
--url https://ohfjp11sb7.execute-api.us-east-1.amazonaws.com/dev/workshops/definitions/{id} \
--header 'Authorization: Bearer {token}' \
--header 'Content-Type: application/json' \
--data '{
  "id": "{id}",
  "name": "{name}",
  "schedule": {
    "0": {
      "duration": {duration},
      "description": "{description}"
    },
    "1": {
      "duration": {duration},
      "description": "{description}"
    },
    "2": {
      "duration": {duration},
      "description": "{description}"
    },
    ...
    "n": {
      "duration": {duration},
      "description": "{description}"
    },
  }
}'
```
### ${\textsf{\color{#FFE3BB}Delete definition (Logical)}}$
```bash
curl --request DELETE \
--url https://ohfjp11sb7.execute-api.us-east-1.amazonaws.com/dev/workshops/definitions/{id} \
--header 'Authorization: Bearer {token}'
```

## ${\textsf{\color{#FD8A8A}Executions}}$
All operations specific to the dates the workshop is scheduled

### ${\textsf{\color{#FFE3BB}Get execution}}$
```bash
curl --request GET \
--url https://ohfjp11sb7.execute-api.us-east-1.amazonaws.com/dev/workshops/executions/{id} \
--header 'Authorization: Bearer {token}'
```
### ${\textsf{\color{#FFE3BB}Get execution by institution id}}$
```bash
curl --request GET \
--url https://ohfjp11sb7.execute-api.us-east-1.amazonaws.com/dev/workshops/executions/institution/{id} \
--header 'Authorization: Bearer {token}'
```

### ${\textsf{\color{#FFE3BB}Update execution}}$
```bash
curl --request PATCH \
--url https://ohfjp11sb7.execute-api.us-east-1.amazonaws.com/dev/workshops/executions/{id} \
--header 'Authorization: Bearer {token}' \
--header 'Content-Type: application/json' \
--data '{
  "id": "{id}",
  "workshopDefinitionId": "{workshopDefinitionId}",
  "scheduledDate": "YYYY-MM-DD",
  "activities": {
    "0": "{uuid}",
    "1": "{uuid}",
    "2": "{uuid}",
    ...
  }
}'
```



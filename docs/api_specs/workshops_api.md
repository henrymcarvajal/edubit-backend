# ${\textsf{\color{#83A2FF}Workshops}}$
All operations related with workshop (their definitions and instances).

## ${\textsf{\color{#FD8A8A}Definitions}}$
All operations specific to workshop definitions.

### Get definition
```bash
curl --request GET \
--url https://ohfjp11sb7.execute-api.us-east-1.amazonaws.com/dev/workshops/definitions \
--header 'Authorization: Bearer {token}'
```

### Update definition
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
### Delete definition (Logical)
```bash
curl --request DELETE \
--url https://ohfjp11sb7.execute-api.us-east-1.amazonaws.com/dev/workshops/definitions/{id} \
--header 'Authorization: Bearer {token}'
```

## ${\textsf{\color{#FD8A8A}Executions}}$
All operations specific to the dates the workshop is scheduled

### Get execution
```bash
curl --request GET \
--url https://ohfjp11sb7.execute-api.us-east-1.amazonaws.com/dev/workshops/executions/{id} \
--header 'Authorization: Bearer {token}'
```
### Get execution by institution id
```bash
curl --request GET \
--url https://ohfjp11sb7.execute-api.us-east-1.amazonaws.com/dev/workshops/executions/institution/{id} \
--header 'Authorization: Bearer {token}'
```

### Update execution
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



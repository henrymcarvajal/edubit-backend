# ${\textsf{\color{#83A2FF}Admin}}$
All operations related to managed entities, like activities, institutions, etc.

## ${\textsf{\color{#FD8A8A}Activities}}$
All operations specific to the activities participants can carry out during a workshop

### ${\textsf{\color{#FFE3BB}Get all activities}}$
```bash
curl --request GET \
--url https://78vxincnn2.execute-api.us-east-1.amazonaws.com/dev/admin/activities \
--header 'Authorization: Bearer {token}'
```

### ${\textsf{\color{#FFE3BB}Get activity}}$
```bash
curl --request GET \
--url https://78vxincnn2.execute-api.us-east-1.amazonaws.com/dev/admin/activities/{id} \
--header 'Authorization: Bearer {token}'
```

### ${\textsf{\color{#FFE3BB}Update activity}}$
```bash
curl --request PATCH \
--url https://78vxincnn2.execute-api.us-east-1.amazonaws.com/dev/admin/activities/{id} \
--header 'Authorization: Bearer {token}' \
--header 'Content-Type: application/json' \
--data '{
  "id": "{id}",
  "name": "{name}",
  "levels": "{levels}",
  "abilities": "{abilities}",
  "description": "{description}"
}'
```

### ${\textsf{\color{#FFE3BB}Disable activity (Logical)}}$
```bash
curl --request DELETE \
--url https://78vxincnn2.execute-api.us-east-1.amazonaws.com/dev/admin/activities/{id} \
--header 'Authorization: Bearer {token}'
```

## ${\textsf{\color{#FD8A8A}Assets}}$
All operations specific to the assets participants can buy during a workshop

### ${\textsf{\color{#FFE3BB}Get all assets}}$
```bash
curl --request GET \
--url https://78vxincnn2.execute-api.us-east-1.amazonaws.com/dev/admin/assets \
--header 'Authorization: Bearer {token}'
```

### ${\textsf{\color{#FFE3BB}Get asset}}$
```bash
curl --request GET \
--url https://78vxincnn2.execute-api.us-east-1.amazonaws.com/dev/admin/assets/{id} \
--header 'Authorization: Bearer {token}'
```

### ${\textsf{\color{#FFE3BB}Update asset}}$
```bash
curl --request PATCH \
--url https://78vxincnn2.execute-api.us-east-1.amazonaws.com/dev/admin/assets/{id} \
--header 'Authorization: Bearer {token}' \
--header 'Content-Type: application/json' \
--data '{
  "id": "{id}",
  "title": "{title}",
  "description": "{description}",
  "price": "{price}"
}'
```

### ${\textsf{\color{#FFE3BB}Delete asset (Logical)}}$
```bash
curl --request DELETE \
--url https://78vxincnn2.execute-api.us-east-1.amazonaws.com/dev/admin/assets/{id} \
--header 'Authorization: Bearer {token}'
```

## ${\textsf{\color{#FD8A8A}Improvements}}$
All operations specific to the improvements participants can acquire during a workshop

### ${\textsf{\color{#FFE3BB}Get all improvements}}$
```bash
curl --request GET \
--url https://78vxincnn2.execute-api.us-east-1.amazonaws.com/dev/admin/improvements \
--header 'Authorization: Bearer {token}'
```

### ${\textsf{\color{#FFE3BB}Get improvement}}$
```bash
curl --request GET \
--url https://78vxincnn2.execute-api.us-east-1.amazonaws.com/dev/admin/improvements/{id} \
--header 'Authorization: Bearer {token}'
```

### ${\textsf{\color{#FFE3BB}Update improvement}}$
```bash
curl --request PATCH \
--url https://78vxincnn2.execute-api.us-east-1.amazonaws.com/dev/admin/improvements/{id} \
--header 'Authorization: Bearer {token}' \
--header 'Content-Type: application/json' \
--data '{
  "id": "{id}",
  "name": "{name}",
  "description": "{description}",
  "price": "{price}"
}'
```

### ${\textsf{\color{#FFE3BB}Delete improvement (Logical)}}$
```bash
curl --request DELETE \
--url https://78vxincnn2.execute-api.us-east-1.amazonaws.com/dev/admin/improvements/{id} \
--header 'Authorization: Bearer {token}'
```

## ${\textsf{\color{#FD8A8A}Institutions}}$
All operations specific to the institutions where workshops can take place at

### ${\textsf{\color{#FFE3BB}Get all institutions}}$
```bash
curl --request GET \
--url https://78vxincnn2.execute-api.us-east-1.amazonaws.com/dev/admin/institutions \
--header 'Authorization: Bearer {token}'
```

### ${\textsf{\color{#FFE3BB}Get institution}}$
```bash
curl --request GET \
--url https://78vxincnn2.execute-api.us-east-1.amazonaws.com/dev/admin/institutions/{id} \
--header 'Authorization: Bearer {token}'
```

### ${\textsf{\color{#FFE3BB}Update institution}}$
```bash
curl --request PATCH \
--url https://78vxincnn2.execute-api.us-east-1.amazonaws.com/dev/admin/institutions/{id} \
--header 'Authorization: Bearer {token}' \
--header 'Content-Type: application/json' \
--data '{
  "id": "{id}",
  "name": "{name}"
}'
```

### ${\textsf{\color{#FFE3BB}Delete institution (Logical)}}$
```bash
curl --request DELETE \
--url https://78vxincnn2.execute-api.us-east-1.amazonaws.com/dev/admin/institutions/{id} \
--header 'Authorization: Bearer {token}'
```
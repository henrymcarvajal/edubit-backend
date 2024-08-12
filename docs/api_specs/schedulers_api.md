# ${\textsf{\color{#83A2FF}Schedulers}}$
All operations related to the timers belonging to scheduled workshops.

### Get scheduler
```bash
curl --request GET \
--url https://bzyw0cecwc.execute-api.us-east-1.amazonaws.com/dev/schedulers/{id} \
--header 'Authorization: Bearer {token}'
```

### Start scheduler
```bash
curl --request POST \
--url https://bzyw0cecwc.execute-api.us-east-1.amazonaws.com/dev/schedulers/{id}/start \
--header 'Authorization: Bearer {token}'
```

### Pause scheduler
```bash
curl --request PATCH \
--url https://bzyw0cecwc.execute-api.us-east-1.amazonaws.com/dev/schedulers/{id}/pause \
--header 'Authorization: Bearer {token}'
```

### Resume scheduler
```bash
curl --request PATCH \
--url https://bzyw0cecwc.execute-api.us-east-1.amazonaws.com/dev/schedulers/{id}/resume \
--header 'Authorization: Bearer {token}'
```

### Stop scheduler
```bash
curl --request DELETE \
--url https://bzyw0cecwc.execute-api.us-east-1.amazonaws.com/dev/schedulers/{id}/stop \
--header 'Authorization: Bearer {token}'
```
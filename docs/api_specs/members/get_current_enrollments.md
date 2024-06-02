```bash
curl --request GET \
  --url https://ar0elk0gz9.execute-api.us-east-1.amazonaws.com/dev/participants/258aad98-7440-42e4-9a8b-73e68806ad0c/enrollments \
  --header 'Authorization: Bearer {token}'
```

```json
{
  "incoming": [
    {
      "workshopId": "9e08abe1-81e6-4706-9dde-5994bc46298a",
      "workshopName": "Conquer Financial Freedom 2024",
      "scheduledDate": "2024-06-04T00:00:00.000Z",
      "activities": {
        "0": {
          "id": "59319c7b-0398-4dc1-a8a6-ff1811eab7db",
          "name": "Block Builders",
          "mentor": {
            "id": "2e54bd72-aa19-46dc-95c0-eadf039c2dc9",
            "name": "Henry Mauricio Carvajal"
          }
        },
        "1": {
          "id": "d3053a7f-f27f-4041-a087-98c403172886",
          "name": "Danzas"
        },
        "2": {
          "id": "b8e090cf-543c-4747-88b7-d8ae9a5de901",
          "name": "Lab dev - scratch"
        }
      }
    }
  ],
  "current": {
    "workshopId": "8d813d27-9680-4040-9580-c970fb486d43",
    "workshopName": "Conquer Financial Freedom 2024",
    "scheduledDate": "2024-06-02T00:00:00.000Z",
    "startTimestamp": "2024-05-22T19:43:39.804Z",
    "activities": {
      "0": {
        "id": "9d15a7fd-11de-46ef-ae4a-05810a0b3706",
        "name": "Origami"
      },
      "1": {
        "id": "d3053a7f-f27f-4041-a087-98c403172886",
        "name": "Danzas"
      },
      "2": {
        "id": "b8e090cf-543c-4747-88b7-d8ae9a5de901",
        "name": "Lab dev - scratch"
      }
    }
  }
}
```

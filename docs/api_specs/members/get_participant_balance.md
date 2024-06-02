```bash
curl --request GET \
--url https://ar0elk0gz9.execute-api.us-east-1.amazonaws.com/dev/participants/258aad98-7440-42e4-9a8b-73e68806ad0c/workshop-execution/8d813d27-9680-4040-9580-c970fb486d43/balance \
--header 'Authorization: Bearer {token}'
```

```json
{
  "stats": {
    "balance": 9999659,
    "activeIncome": 213123,
    "passiveIncome": 213123,
    "borrowingPower": {
      "mortgage": 123123,
      "freeInvestment": 123123
    },
    "currentImprovementRate": 1
  },
  "history": {
    "balance": [
      1000000,
      2000000,
      3000000,
      4000000,
      5000000,
      6000000
    ]
  },
  "startingBalance": 10000000,
  "improvements": [
    {
      "id": "1f7cb400-657d-42ee-851c-474d0d97d33e",
      "name": "Sombrero de la sabiduria"
    },
    {
      "id": "053205c6-2463-41ed-aaa2-c99a6a6ab6b8",
      "name": "Estrella de la suerte"
    },
    {
      "id": "f8f44790-d5c2-402e-ad48-c1cf09c1942e",
      "name": "Martillo maravilla"
    }
  ],
  "assets": [
    {
      "id": "c511e021-52fd-48f2-ae47-6245b5786d90",
      "count": 2,
      "name": "Apartamento turistico"
    },
    {
      "id": "f7a57236-989e-490b-8e61-74d91d7d6570",
      "count": 2,
      "name": "Lote urbano"
    },
    {
      "id": "fe0fd0aa-96cd-4416-ba57-22696f0839a1",
      "count": 2,
      "name": "Apartamento en conjunto"
    }
  ]
}
```
# Smart Classifier API 🧠

## Endpoint
`POST /api/classify`

## Authentication
Headers:
```
x-admin-key: YOUR_SECRET_ADMIN_KEY
```
*(Set `ADMIN_API_KEY` in your `.env.local` to match this)*

## Request Body
```json
{
  "product": {
    "name": "Red Stroller",
    "description": "Lightweight baby stroller",
    "imageUrls": ["https://example.com/stroller.jpg"]
  }
}
```

## Response
```json
{
  "success": true,
  "data": {
    "category_id": "strollers-gear",
    "confidence": 45,
    "isAmbiguous": false
  }
}
```

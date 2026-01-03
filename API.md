# TomodachiShare API Reference

Welcome to the TomodachiShare API Reference!
Some routes may require authentication (see [Protected](#protected-endpoints) section - _TODO_).

## Public Endpoints

### **Search Miis**

`GET /api/search?q={query}`

Searches Miis by name, tags, and description.

#### **Query Parameters**

| Name   | Type   | Required | Description                                                       |
| ------ | ------ | -------- | ----------------------------------------------------------------- |
| **q**  | string | **Yes**  | The text to search for. Matches names, tags, and descriptions.    |
| sort   | string | No       | Sorting mode: `likes`, `newest`, `oldest`, or `random`.           |
| tags   | string | No       | Comma-separated list of tags. Example: `anime,frieren`.           |
| gender | string | No       | Gender filter: `MALE` or `FEMALE`.                                |
| limit  | number | No       | Number of results per page (1-100).                               |
| page   | number | No       | Page number. Defaults to `1`.                                     |
| seed   | number | No       | Seed used for `random` sorting to ensure unique results per page. |

#### **Examples**

```
https://tomodachishare.com/api/search?q=frieren
```

```
https://tomodachishare.com/api/search?q=frieren&sort=random&tags=anime,frieren&gender=MALE&limit=20&page=1&seed=1204
```

#### **Response**

Returns an array of Mii IDs:

```json
[1, 204, 295, 1024]
```

When no Miis are found:

```json
{ "error": "No Miis found!" }
```

---

### **Get Mii Image / QR Code / Metadata Image**

`GET /mii/{id}/image?type={type}`

Retrieves the Mii image, QR code, or metadata graphic.

#### **Path & Query Parameters**

| Name     | Type   | Required | Description                           |
| -------- | ------ | -------- | ------------------------------------- |
| **id**   | number | **Yes**  | The Mii’s ID.                         |
| **type** | string | **Yes**  | One of: `mii`, `qr-code`, `metadata`. |

#### **Examples**

```
https://tomodachishare.com/mii/1/image?type=mii
```

```
https://tomodachishare.com/mii/2/image?type=qr-code
```

```
https://tomodachishare.com/mii/3/image?type=metadata
```

#### **Response**

Returns the image file.

---

### **Get Mii Data**

`GET /mii/{id}/data`

Fetches metadata for a specific Mii.

#### **Path Parameters**

| Name   | Type   | Required | Description   |
| ------ | ------ | -------- | ------------- |
| **id** | number | **Yes**  | The Mii’s ID. |

#### **Example**

```
https://tomodachishare.com/mii/1/data
```

#### **Response**

```json
{
	"id": 1,
	"name": "Frieren",
	"platform": "THREE_DS",
	"imageCount": 3,
	"tags": ["anime", "frieren"],
	"description": "Frieren from 'Frieren: Beyond Journey's End'\r\nThe first Mii on the site!",
	"firstName": "Frieren",
	"lastName": "the Slayer",
	"gender": "FEMALE",
	"islandName": "Wuhu",
	"allowedCopying": false,
	"createdAt": "2025-05-04T12:29:41Z",
	"user": {
		"id": 1,
		"username": "trafficlunar",
		"name": "trafficlunar"
	},
	"likes": 29
}
```

## Protected Endpoints

_TODO_

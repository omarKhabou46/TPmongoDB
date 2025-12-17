# Products API

A Node.js REST API for managing and querying product data from MongoDB with advanced filtering, pagination, and statistics features.

## Features

- **Product Listing** with pagination, search, filtering, and sorting
- **Statistics Endpoints** for product analytics
- **Category Analysis** with pricing statistics
- **Top Products** by rating and price
- **Brand Statistics** with stock and value calculations

## Prerequisites

- Node.js (v14 or higher)
- MongoDB database
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd <project-directory>
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```env
MongoDBConnectionString=mongodb://localhost:27017
MongoDBDatabaseName=your_database_name
```

## Database Setup

Seed the database with sample products:
```bash
node seedProducts.js
```

This will fetch products from DummyJSON API and populate your MongoDB database.

## Running the Server

Start the application:
```bash
node server.js
```

The server will run on `http://localhost:3000`

## API Endpoints

### Get Products
```
GET /api/products
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `category` (optional): Filter by category
- `search` (optional): Search in title and description
- `sort` (optional): Sort by field (prefix with `-` for descending)

**Example:**
```bash
# Get products on page 2 with 20 items per page
GET /api/products?page=2&limit=20

# Filter by category
GET /api/products?category=smartphones

# Search products
GET /api/products?search=laptop

# Sort by price (ascending)
GET /api/products?sort=price

# Sort by price (descending)
GET /api/products?sort=-price
```

### Get Statistics

#### Global Category Statistics
```
GET /api/products/stats
```

Returns statistics for each category including total products, average price, max price, and min price.

#### Top Products
```
GET /api/products/stats?meilleursP=1
```

Returns top 5 products with price > 500, sorted by rating.

#### Brand Statistics
```
GET /api/products/stats?brandStats=1
```

Returns statistics for each brand including total stock and total inventory value.

## Response Examples

### Products List Response
```json
{
  "total": 100,
  "page": 1,
  "limit": 10,
  "products": [
    {
      "id": 1,
      "title": "Product Name",
      "description": "Product description",
      "price": 599.99,
      "category": "electronics",
      "brand": "BrandName",
      "stock": 50,
      "rating": 4.5
    }
  ]
}
```

### Category Statistics Response
```json
[
  {
    "categoryName": "smartphones",
    "totalProducts": 25,
    "averagePrice": 699.99,
    "maxPrice": 1299.99,
    "minPrice": 299.99
  }
]
```

## Project Structure

```
.
├── connectionDataB.js    # MongoDB connection handler
├── seedProducts.js       # Database seeding script
├── server.js            # Express server setup
├── routes/
│   └── products.js      # Product routes and controllers
├── .env                 # Environment variables
└── README.md           # This file
```

## Technologies Used

- **Express.js** - Web framework
- **MongoDB** - Database
- **Node.js MongoDB Driver** - Database client
- **dotenv** - Environment configuration

## Code Explanation

### connectionDataB.js
Ce fichier gère la connexion à MongoDB:
- **MongoClient**: Client MongoDB importé depuis le driver officiel
- **connectDB()**: Fonction asynchrone qui établit la connexion à la base de données. Elle utilise un pattern singleton (si `db` existe déjà, elle le retourne sans recréer la connexion)
- **logout()**: Ferme proprement la connexion MongoDB
- Les variables d'environnement (`MongoDBConnectionString` et `MongoDBDatabaseName`) sont chargées depuis le fichier `.env`

### seedProducts.js
Script de peuplement de la base de données:
- **insertProducts()**: Supprime tous les produits existants (`deleteMany({})`), puis insère les nouveaux produits en masse (`insertMany()`)
- **fetchData()**: Récupère les données depuis l'API externe DummyJSON, puis les insère dans MongoDB
- Utilise un bloc `try-catch-finally` pour garantir que la connexion se ferme même en cas d'erreur

### server.js
Point d'entrée de l'application:
- Crée une instance Express sur le port 3000
- Monte les routes produits sur `/api/`
- Établit la connexion à MongoDB au démarrage
- Définit une route racine `/` pour tester le serveur

### routes/products.js
Contient toute la logique métier et les routes:

#### Route GET /api/products
Cette route implémente un système complet de requêtage:
- **Pagination**: Utilise `page` et `limit` pour diviser les résultats
- **Filtrage par catégorie**: Ajoute un filtre `category` dans le pipeline MongoDB
- **Recherche textuelle**: Utilise `$regex` pour chercher dans `title` et `description`
- **Tri dynamique**: Parse le paramètre `sort` (préfixe `-` pour ordre décroissant)
- **Aggregation Pipeline**: Construit un pipeline MongoDB dynamique selon les paramètres
  1. `$match`: Filtre les documents
  2. `$sort`: Trie les résultats
  3. `$skip` et `$limit`: Implémente la pagination

#### Route GET /api/products/stats
Route avec trois modes selon les paramètres:
- Sans paramètre: Retourne `globalStatistique()`
- `?meilleursP=1`: Retourne `meilleursProduits()`
- `?brandStats=1`: Retourne `decompositionMarque()`

#### Fonction globalStatistique()
Calcule des statistiques par catégorie:
- **$group**: Regroupe les produits par catégorie et calcule:
  - `totalProducts`: Compte avec `$sum: 1`
  - `avgPrice`: Prix moyen avec `$avg`
  - `maxPrice` et `minPrice`: Prix extrêmes
- **$sort**: Trie par prix moyen décroissant
- **$project**: Reformate les champs pour une meilleure lisibilité (renomme `_id` en `categoryName`)

#### Fonction meilleursProduits()
Trouve les 5 meilleurs produits chers:
- **$match**: Filtre les produits avec `price > 500`
- **$sort**: Trie par `rating` décroissant
- **$limit**: Limite à 5 résultats
- **$project**: Sélectionne uniquement `title`, `price` et `rating`

#### Fonction decompositionMarque()
Analyse les marques par valeur:
- **$group**: Regroupe par `brand` et calcule:
  - `totalStock`: Somme des stocks
  - `totalValue`: Valeur totale (prix × stock) avec `$multiply`
- **$project**: Reformate en renommant `_id` en `brandName`
- **$sort**: Trie par valeur totale décroissante

### MongoDB Aggregation Pipeline
Le code utilise intensivement le framework d'agrégation MongoDB qui permet:
- De chaîner des opérations de transformation
- D'effectuer des calculs complexes
- De regrouper et analyser les données
- D'optimiser les performances (les calculs se font côté base de données)

## Error Handling

The API includes error handling for:
- Database connection failures
- Invalid query parameters
- Server errors (returns 500 status)

## Contributing

Feel free to submit issues and enhancement requests!

## License

MIT

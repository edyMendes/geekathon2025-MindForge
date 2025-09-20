# Food Recipe Manager API

A FastAPI application for managing food ingredients and recipes.

## Features

- **Ingredients Management**: Create, read, update, and delete ingredients
- **Recipe Management**: Create, read, update, and delete recipes with ingredient relationships
- **Search**: Search for recipes and ingredients by name
- **Database**: SQLite database with SQLAlchemy ORM

## Installation

1. Activate your virtual environment:
   ```bash
   source venv/bin/activate
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

## Running the Application

```bash
python main.py
```

The API will be available at `http://localhost:8000`

## API Documentation

Once the server is running, visit:
- Interactive API docs: `http://localhost:8000/docs`
- Alternative docs: `http://localhost:8000/redoc`

## API Endpoints

### Ingredients
- `POST /ingredients/` - Create a new ingredient
- `GET /ingredients/` - Get all ingredients
- `GET /ingredients/{id}` - Get ingredient by ID
- `PUT /ingredients/{id}` - Update ingredient
- `DELETE /ingredients/{id}` - Delete ingredient
- `GET /ingredients/search/{query}` - Search ingredients

### Recipes
- `POST /recipes/` - Create a new recipe
- `GET /recipes/` - Get all recipes
- `GET /recipes/{id}` - Get recipe by ID
- `PUT /recipes/{id}` - Update recipe
- `DELETE /recipes/{id}` - Delete recipe
- `GET /recipes/search/{query}` - Search recipes

## Example Usage

### Create an ingredient:
```json
POST /ingredients/
{
  "name": "Tomato",
  "category": "vegetable",
  "description": "Fresh red tomato"
}
```

### Create a recipe:
```json
POST /recipes/
{
  "name": "Spaghetti Carbonara",
  "description": "Classic Italian pasta dish",
  "instructions": "1. Cook pasta 2. Mix eggs and cheese 3. Combine with hot pasta",
  "prep_time": 10,
  "cook_time": 15,
  "servings": 4,
  "difficulty": "medium",
  "ingredients": [
    {
      "ingredient_id": 1,
      "quantity": 500,
      "unit": "g"
    }
  ]
}
```

# Q&A API Service

This is a Node.js REST API service for managing questions and answers. The service allows users to create, update, delete, and search for questions, as well as post answers and vote on both questions and answers. It also integrates Swagger for API documentation.

## Features

- **Questions**: Create, retrieve, update, delete, search, and vote on questions.
- **Answers**: Post, retrieve, delete, and vote on answers for specific questions.
- **Voting**: Vote on questions and answers with upvotes and downvotes.
- **Swagger Documentation**: Visualize API endpoints with Swagger.

## Technologies

- **Node.js** with **Express.js** as the framework
- **PostgreSQL** as the database
- **Swagger** for API documentation
- **dotenv** for environment variable management (not shown but recommended)
  
## Requirements

- **Node.js** v14 or later
- **PostgreSQL** installed and running

## Setup and Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/ArkornPat/backend-skill-checkpoint-express-server.git
   cd backend-skill-checkpoint-express-server

2. **Install dependencies**:
   ```bash
   npm install

3. **Configure database**:

   - Set up PostgreSQL with a database named `Backend Skill Checkpoint`.
   - Modify the connection string in `db.mjs` or use environment variables for the connection configuration.

4. **Run the server**:

   ```bash
   npm start

5. **Access Swagger API documentation**:

   - Go to `http://localhost:4000/swagger` in your browser to view the Swagger API documentation.

## API Endpoints

### Questions
- **POST** `/questions`: Create a new question
- **GET** `/questions`: Retrieve all questions
- **GET** `/questions/search`: Search questions by category and/or keyword
- **GET** `/questions/:questionId`: Retrieve a specific question by ID
- **PUT** `/questions/:questionId`: Update a question by ID
- **DELETE** `/questions/:questionId`: Delete a question by ID
- **POST** `/questions/:questionId/vote`: Vote on a question with vote value of `1` (upvote) or `-1` (downvote)

### Answers
- **POST** `/questions/:questionId/answer`: Post an answer to a specific question
- **GET** `/questions/:questionId/answer`: Retrieve all answers for a specific question
- **DELETE** `/questions/:questionId/answer`: Delete all answers associated with a question
- **POST** `/answers/:answerId/vote`: Vote on an answer with vote value of `1` (upvote) or `-1` (downvote)

## Testing the API

To test the API, use tools like **Postman** or **curl**.

## Database Structure

### Questions Table
- `id`: Integer (Primary Key)
- `title`: Text
- `description`: Text
- `category`: Text

### Answers Table
- `id`: Integer (Primary Key)
- `question_id`: Integer (Foreign Key to Questions)
- `content`: Text

### Votes Table (for both questions and answers)
- `id`: Integer (Primary Key)
- `question_id`: Integer (Foreign Key to Questions, nullable if an answer vote)
- `answer_id`: Integer (Foreign Key to Answers, nullable if a question vote)
- `vote`: Integer (`1` for upvote, `-1` for downvote)

## Error Handling

The API returns relevant error messages for:

- Missing or invalid data (`400`)
- Not found errors (`404`)
- Internal server errors (`500`)

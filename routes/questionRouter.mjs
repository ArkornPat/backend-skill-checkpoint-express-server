import { Router } from "express";
import connectionPool from "../utils/db.mjs";
import validateDataQuestion from "../middleware/validationDataQuestion.mjs";

const questionRouter = Router();

//post question
questionRouter.post("/", [validateDataQuestion], async (req, res) => {
  const newQuestion = req.body;
  try {
    const query = `insert into questions ( title, description, category) values($1, $2, $3)`;
    const values = [
      newQuestion.title,
      newQuestion.description,
      newQuestion.category,
    ];
    await connectionPool.query(query, values);
    return res.status(201).json({
      message: `Question created successfully`,
    });
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      message: "Server could not create question because database connection",
    });
  }
});

//get question by Query Parameter
questionRouter.get("/search", async (req, res) => {
  const category = req.query.category || "";
  const keyword = req.query.keyword || "";
  try {
    let query = `select questions.id, questions.title, questions.description, questions.category from questions`;
    let values = [];

    if (category && keyword) {
      query += ` where questions.category ilike $1 and (questions.title ilike $2 or questions.description ilike $2)`;
      values = [`%${category}%`, `%${keyword}%`];
    } else if (category) {
      query += ` where questions.category ilike $1`;
      values = [`%${category}%`];
    } else if (keyword) {
      query += ` where questions.title ilike $1 or questions.description ilike $1`;
      values = [`%${keyword}%`];
    }

    const results = await connectionPool.query(query, values);

    return res.status(200).json({ data: results.rows });
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      message: `Server could not read question because database connection`,
    });
  }
});

//get qurestion by id
questionRouter.get("/:questionId", async (req, res) => {
  const questionId = req.params.questionId;
  try {
    const results = await connectionPool.query(
      `select questions.id, questions.title, questions.description, questions.category from questions where id=$1`,
      [questionId]
    );
    if (!results.rows[0]) {
      return res.status(404).json({ message: "Question not found." });
    }
    return res.status(200).json(results.rows[0]);
  } catch {
    return res.status(500).json({
      message: "Server could not read question because database connection",
    });
  }
});

//get all question
questionRouter.get("/", async (req, res) => {
  try {
    const results = await connectionPool.query(
      `select questions.id, questions.title, questions.description, questions.category from questions`
    );
    return res.status(200).json({ data: results.rows });
  } catch {
    return res.status(500).json({
      message: "Server could not read question because database connection",
    });
  }
});

//update question
questionRouter.put("/:questionId", [validateDataQuestion], async (req, res) => {
  const questionId = req.params.questionId;
  const newQuestion = req.body;
  try {
    const query = `update questions set title = $2, description = $3, category = $4 where id = $1`;
    const values = [
      questionId,
      newQuestion.title,
      newQuestion.description,
      newQuestion.category,
    ];

    const results = await connectionPool.query(query, values);

    if (!results.rows[0]) {
      return res.status(404).json({ message: "Question not found." });
    }

    return res.status(200).json({
      message: "Updated question sucessfully",
    });
  } catch {
    return res.status(500).json({
      message: "Server could not update question because database connection",
    });
  }
});

//delete question
questionRouter.delete("/:questionId", async (req, res) => {
  const questionId = req.params.questionId;
  try {
    const query = `delete from questions where id = $1`;
    const values = [questionId];
    const results = await connectionPool.query(query, values);
    if (!results.rows[0]) {
      return res.status(404).json({ message: "Question not found." });
    }
    return res
      .status(200)
      .json({ message: `Deleted question id = ${questionId} sucessfully` });
  } catch {
    return res.status(500).json({
      message: "Server could not delete question because database connection",
    });
  }
});

//post answer  by id question
questionRouter.post("/:questionId/answer", async (req, res) => {
  const questionId = req.params.questionId;
  const newAnswer = req.body;
  if (!newAnswer.content) {
    return res.status(400).json({ message: "Invalid request data." });
  }
  if (newAnswer.content.length > 300) {
    return res.status(400).json({
      message:
        "Answer content exceeds the maximum allowed length of 300 characters.",
    });
  }

  try {
    const results = await connectionPool.query(
      `select questions.id from questions where id =$1`,
      [questionId]
    );
    if (!results.rows[0]) {
      return res.status(404).json({ message: "Question not found." });
    }
    await connectionPool.query(
      `insert into answers (question_id, content) values ($1,$2)`,
      [questionId, newAnswer.content]
    );
    return res.status(201).json({ message: `Answer created successfully` });
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      message: "Server could not create answer because database connection",
    });
  }
});

//get answer by id question
questionRouter.get("/:questionId/answer", async (req, res) => {
  const questionId = req.params.questionId;
  try {
    const result = await connectionPool.query(
      `select questions.id from questions where id =$1`,
      [questionId]
    );
    if (!result.rows[0]) {
      return res.status(404).json({ message: "Question not found." });
    }

    const results = await connectionPool.query(
      `select question_id, content from answers where question_id = $1`,
      [questionId]
    );
    return res.status(200).json({ data: results.rows });
  } catch {
    return res.status(500).json({
      message: "Server could not read answer because database connection",
    });
  }
});

//delete answer by id question
questionRouter.delete("/:questionId/answer", async (req, res) => {
  const questionId = req.params.questionId;
  try {
    const results = await connectionPool.query(
      `select questions.id from questions where id =$1`,
      [questionId]
    );
    if (!results.rows[0]) {
      return res.status(404).json({ message: "Question not found." });
    }
    await connectionPool.query(`delete from answers where question_id = $1`, [
      questionId,
    ]);
    return res.status(200).json({
      message: `Deleted answer in question id = ${questionId} sucessfully`,
    });
  } catch {
    return res.status(500).json({
      message: "Server could not read answer because database connection",
    });
  }
});

//vote question
questionRouter.post("/:questionId/vote", async (req, res) => {
  const questionId = req.params.questionId;
  const newVote = req.body;
  if (!newVote.vote) {
    return res.status(400).json({ message: "Invalid vote value." });
  }
  if (newVote.vote !== 1 && newVote.vote !== -1) {
    return res.status(400).json({ message: "Invalid vote value." });
  }

  try {
    const results = await connectionPool.query(
      `select questions.id from questions where id =$1`,
      [questionId]
    );
    if (!results.rows[0]) {
      return res.status(404).json({ message: "Question not found." });
    }
    const query = `insert into question_votes (question_id , vote) values($1, $2)`;
    const values = [questionId, newVote.vote];
    await connectionPool.query(query, values);
    return res.status(201).json({
      message: "Vote on the question has been recorded successfully.",
    });
  } catch {
    return res.status(500).json({
      message: "Server could not create votes because database connection",
    });
  }
});

/**
 * @swagger
 * tags:
 *   name: Questions
 *   description: API for endpoint questions
 */

/**
 * @swagger
 * /questions:
 *   post:
 *     summary: Create a new question
 *     tags: [Questions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               category:
 *                 type: string
 *     responses:
 *       201:
 *         description: Question created successfully.
 *       500:
 *         description: Server error due to database connection issue.
 */
//questionRouter.post("/", [validateDataQuestion], async (req, res) => { /*...*/ });

/**
 * @swagger
 * /questions/search:
 *   get:
 *     summary: Search questions by category and keyword
 *     tags: [Questions]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Category to filter questions by
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *         description: Keyword to search in title or description
 *     responses:
 *       200:
 *         description: List of questions matching the search criteria
 *       500:
 *         description: Server error due to database connection issue.
 */
//questionRouter.get("/search", async (req, res) => { /*...*/ });

/**
 * @swagger
 * /questions/{questionId}:
 *   get:
 *     summary: Get a question by its ID
 *     tags: [Questions]
 *     parameters:
 *       - in: path
 *         name: questionId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: A single question
 *       404:
 *         description: Question not found
 *       500:
 *         description: Server error due to database connection issue.
 */
//questionRouter.get("/:questionId", async (req, res) => { /*...*/ });

/**
 * @swagger
 * /questions:
 *   get:
 *     summary: Get all questions
 *     tags: [Questions]
 *     responses:
 *       200:
 *         description: A list of all questions
 *       500:
 *         description: Server error due to database connection issue.
 */
//questionRouter.get("/", async (req, res) => { /*...*/ });

/**
 * @swagger
 * /questions/{questionId}:
 *   put:
 *     summary: Update a question by ID
 *     tags: [Questions]
 *     parameters:
 *       - in: path
 *         name: questionId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               category:
 *                 type: string
 *     responses:
 *       200:
 *         description: Question updated successfully
 *       404:
 *         description: Question not found
 *       500:
 *         description: Server error due to database connection issue.
 */
//questionRouter.put("/:questionId", [validateDataQuestion], async (req, res) => { /*...*/ });

/**
 * @swagger
 * /questions/{questionId}:
 *   delete:
 *     summary: Delete a question by ID
 *     tags: [Questions]
 *     parameters:
 *       - in: path
 *         name: questionId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Question deleted successfully
 *       404:
 *         description: Question not found
 *       500:
 *         description: Server error due to database connection issue.
 */
//questionRouter.delete("/:questionId", async (req, res) => { /*...*/ });

/**
 * @swagger
 * /questions/{questionId}/answer:
 *   post:
 *     summary: Add an answer to a question by ID
 *     tags: [Questions]
 *     parameters:
 *       - in: path
 *         name: questionId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *                 maxLength: 300
 *     responses:
 *       201:
 *         description: Answer created successfully
 *       404:
 *         description: Question not found
 *       500:
 *         description: Server error due to database connection issue.
 */
//questionRouter.post("/:questionId/answer", async (req, res) => { /*...*/ });

/**
 * @swagger
 * /questions/{questionId}/answer:
 *   get:
 *     summary: Get answers for a question by question ID
 *     tags: [Questions]
 *     parameters:
 *       - in: path
 *         name: questionId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: A list of answers for the specified question
 *       404:
 *         description: Question not found
 *       500:
 *         description: Server error due to database connection issue.
 */
//questionRouter.get("/:questionId/answer", async (req, res) => { /*...*/ });

/**
 * @swagger
 * /questions/{questionId}/answer:
 *   delete:
 *     summary: Delete answers for a question by question ID
 *     tags: [Questions]
 *     parameters:
 *       - in: path
 *         name: questionId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Answers deleted successfully
 *       404:
 *         description: Question not found
 *       500:
 *         description: Server error due to database connection issue.
 */
//questionRouter.delete("/:questionId/answer", async (req, res) => { /*...*/ });

/**
 * @swagger
 * /questions/{questionId}/vote:
 *   post:
 *     summary: Vote on a question
 *     tags: [Questions]
 *     parameters:
 *       - in: path
 *         name: questionId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               vote:
 *                 type: integer
 *                 enum: [1, -1]
 *                 description: "1 for upvote, -1 for downvote"
 *     responses:
 *       201:
 *         description: Vote on the question recorded successfully
 *       404:
 *         description: Question not found
 *       500:
 *         description: Server error due to database connection issue.
 */
//questionRouter.post("/:questionId/vote", async (req, res) => { /*...*/ });




export default questionRouter;

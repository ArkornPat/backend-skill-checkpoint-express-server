import { Router } from "express";
import connectionPool from "../utils/db.mjs";

const questionRouter = Router();

//post question
questionRouter.post("/", async (req, res) => {
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
questionRouter.put("/:questionId", async (req, res) => {
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

    await connectionPool.query(query, values);
    const results = await connectionPool.query(
      `select questions.id, questions.title, questions.description, questions.category from questions where id=$1`,
      [questionId]
    );

    return res.status(200).json({
      message: "Updated question sucessfully",
      newdata: results.rows[0],
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
    await connectionPool.query(query, values);
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
  try {
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
  try {
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

export default questionRouter;

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
      message: `Question has been created successfully`,
    });
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      message: "Server could not create question because database connection",
    });
  }
});

//get qurestion by id
questionRouter.get("/:id", async (req, res) => {
  const questionId = req.params.id;
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

//get all questions || use Query Parameter
questionRouter.get("/", async (req, res) => {
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
  } catch {
    return res.status(500).json({
      message: "Server could not read question because database connection",
    });
  }
});

//update question
questionRouter.put("/:id", async (req, res) => {
  const questionId = req.params.id;
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

    return res
      .status(200)
      .json({
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
questionRouter.delete("/:id", async (req, res) => {
  const questionId = req.params.id;
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

export default questionRouter;

import { Router } from "express";
import connectionPool from "../utils/db.mjs";

const answerRouter = Router();

//vote answer
answerRouter.post("/:answerId/vote", async (req, res) => {
  const answerId = req.params.answerId;
  const newVote = req.body;
  if (!newVote.vote) {
    return res.status(400).json({ message: "Invalid vote value." });
  }
  if (newVote.vote !== 1 && newVote.vote !== -1) {
    return res.status(400).json({ message: "Invalid vote value." });
  }
  try {
    const query = `insert into answer_votes (answer_id , vote) values($1, $2)`;
    const values = [answerId, newVote.vote];
    await connectionPool.query(query, values);
    return res.status(201).json({
      message: "Vote on the answer has been recorded successfully.",
    });
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      message: "Server could not create votes because database connection",
    });
  }
});

export default answerRouter;

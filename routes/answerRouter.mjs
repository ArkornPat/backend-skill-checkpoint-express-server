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

/**
 * @swagger
 * tags:
 *   name: Answers
 *   description: API for endpoint answers
 */

/**
 * @swagger
 * /answers/{answerId}/vote:
 *   post:
 *     summary: Vote on an answer
 *     tags: [Answers]
 *     description: Allows users to upvote or downvote an answer.
 *     parameters:
 *       - in: path
 *         name: answerId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the answer to vote on.
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
 *                 example: 1
 *     responses:
 *       201:
 *         description: Vote on the answer has been recorded successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Vote on the answer has been recorded successfully.
 *       400:
 *         description: Invalid vote value.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid vote value.
 *       500:
 *         description: Server error due to database connection issue.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Server could not create votes because database connection.
 */

export default answerRouter;

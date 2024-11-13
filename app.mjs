import express from "express";
import questionRouter from "./routes/questionRouter.mjs";
import answerRouter from "./routes/answerRouter.mjs";
const app = express();
const port = 4000;

app.use(express.json());

// router
app.use("/questions",questionRouter)
app.use("/comments", answerRouter)

app.get("/test", (req, res) => {
  return res.json("Server API is working 🚀");
});

app.listen(port, () => {
  console.log(`Server is running at ${port}`);
});

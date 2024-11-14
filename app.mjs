import express from "express";
import questionRouter from "./routes/questionRouter.mjs";
import answerRouter from "./routes/answerRouter.mjs";
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './swagger.mjs'; 


const app = express();
const port = 4000;

app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use(express.json());

// router
app.use("/questions",questionRouter)
app.use("/answers",answerRouter)




app.get("/test", (req, res) => {
  return res.json("Server API is working 🚀");
});

app.listen(port, () => {
  console.log(`Server is running at ${port}`);
});

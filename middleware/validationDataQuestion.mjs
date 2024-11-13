function validateDataQuestion(req, res, next) {
  const { title, description, category } = req.body;
  if (!title) {
    return res.status(400).json({ message: "Title is required" });
  }
  if (!description) {
    return res.status(400).json({ message: "Description is required" });
  }
  if (!category) {
    return res.status(400).json({ message: "Category is required" });
  }
  if (typeof title !== "string") {
    return res.status(400).json({ message: "Title must be a string" });
  }
  if (typeof description !== "string") {
    return res.status(400).json({ message: "Description must be a string" });
  }
  if (typeof category !== "string") {
    return res.status(400).json({ message: "Category is must be a string" });
  }
  next();
}

export default validateDataQuestion

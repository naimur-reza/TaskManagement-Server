import express from "express";
import { MongoClient, ObjectId } from "mongodb";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI =
  "mongodb+srv://AirCnc:YOe3voeegr2LC7s2@cluster0.2cofc5d.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const DB_NAME = "taskmanagement";

// Middleware
const corsOptions = {
  origin: "*",
  credentials: true,
  optionSuccessStatus: 200,
};
app.use(cors(corsOptions));
app.use(express.json());

let db;

// MongoDB connection and server start
MongoClient.connect(MONGO_URI)
  .then((client) => {
    console.log("Connected to MongoDB");
    db = client.db(DB_NAME);

    // API Routes

    app.get("/", (req, res) => {
      res.json({
        statusCode: 201,
        message: "server is running",
      });
    });

    app.get("/api/tasks", async (req, res) => {
      try {
        const tasks = await db.collection("tasks").find().toArray();
        res.json(tasks);
      } catch (err) {
        res.status(500).json({ message: err.message });
      }
    });

    app.post("/api/tasks", async (req, res) => {
      const task = req.body;
      try {
        const result = await db.collection("tasks").insertOne(task);
        res.status(201).json(task);
      } catch (err) {
        res.status(400).json({ message: err.message });
      }
    });

    app.get("/api/tasks/:id", async (req, res) => {
      try {
        const task = await db
          .collection("tasks")
          .findOne({ _id: new ObjectId(req.params.id) });
        if (!task) {
          return res.status(404).json({ message: "Task not found" });
        }
        res.json(task);
      } catch (err) {
        res.status(500).json({ message: err.message });
      }
    });

    app.put("/api/tasks/:id", async (req, res) => {
      const objectId = new ObjectId(req.params.id);
      try {
        const result = await db
          .collection("tasks")
          .findOneAndUpdate(
            { _id: objectId },
            { $set: req.body },
            { returnOriginal: false }
          );

        res.json(result);
      } catch (err) {
        res.status(400).json({ message: err.message });
      }
    });

    app.delete("/api/tasks/:id", async (req, res) => {
      const objectId = new ObjectId(req.params.id);
      try {
        const result = await db
          .collection("tasks")
          .findOneAndDelete({ _id: objectId });

        if (!result) {
          return res.status(404).json({ message: "Task not found" });
        }
        res.json({ message: "Task deleted" });
      } catch (err) {
        res.status(500).json({ message: err.message });
      }
    });

    app.patch("/api/tasks/:id/toggle-completion", async (req, res) => {
      const objectId = new ObjectId(req.params.id);
      try {
        const task = await db.collection("tasks").findOne({ _id: objectId });
        if (!task) {
          return res.status(404).json({ message: "Task not found" });
        }
        const result = await db
          .collection("tasks")
          .findOneAndUpdate(
            { _id: objectId },
            { $set: { completed: !task.completed } },
            { returnOriginal: false }
          );
        res.json(result);
      } catch (err) {
        res.status(400).json({ message: err.message });
      }
    });

    app.patch("/api/tasks/:id/toggle-reminder", async (req, res) => {
      const objectId = new ObjectId(req.params.id);
      try {
        const task = await db.collection("tasks").findOne({ _id: objectId });
        if (!task) {
          return res.status(404).json({ message: "Task not found" });
        }
        const result = await db
          .collection("tasks")
          .findOneAndUpdate(
            { _id: objectId },
            { $set: { reminder: !task.reminder } },
            { returnOriginal: false }
          );
        res.json(result);
      } catch (err) {
        res.status(400).json({ message: err.message });
      }
    });

    // Start the server after successful MongoDB connection
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("Could not connect to MongoDB", err);
    process.exit(1); // Exit the application if MongoDB connection fails
  });

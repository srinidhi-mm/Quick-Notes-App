require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { randomUUID } = require("crypto");

const app = express();
const port = process.env.PORT || 5000;
const frontendUrl = process.env.FRONTEND_URL;

// Restrict browser requests to the configured frontend, or allow all origins in development.
app.use(cors({ origin: frontendUrl || "*" }));
app.use(express.json());

// Notes are intentionally stored in memory for this simple demo.
const notes = [];

app.get("/notes", (req, res) => {
  res.json(notes);
});

app.post("/notes", (req, res) => {
  const text = typeof req.body?.text === "string" ? req.body.text.trim() : "";

  if (!text) {
    return res.status(400).json({ error: "Note text cannot be blank." });
  }

  const note = {
    id: randomUUID(),
    text,
    createdAt: new Date().toISOString(),
  };

  notes.unshift(note);
  return res.status(201).json(note);
});

app.delete("/notes/:id", (req, res) => {
  const noteIndex = notes.findIndex((note) => note.id === req.params.id);

  if (noteIndex === -1) {
    return res.status(404).json({ error: "Note not found." });
  }

  notes.splice(noteIndex, 1);
  return res.status(204).end();
});

app.listen(port, () => {
  console.log(`Quick Notes API listening on port ${port}`);
});

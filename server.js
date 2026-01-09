require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const path = require("path");

const app = express();
app.use(express.json());
app.use(express.static("public"));

mongoose.connect(process.env.MONGO_URI);

const User = mongoose.model("User", {
  username: String,
  password: String,
  highScore: { type: Number, default: 0 }
});

/* REGISTER */
app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  const hash = await bcrypt.hash(password, 10);
  await User.create({ username, password: hash });
  res.send({ ok: true });
});

/* LOGIN */
app.post("/login", async (req, res) => {
  const user = await User.findOne({ username: req.body.username });
  if (!user) return res.status(400).send({ error: "User not found" });

  const ok = await bcrypt.compare(req.body.password, user.password);
  if (!ok) return res.status(401).send({ error: "Wrong password" });

  res.send({ ok: true, highScore: user.highScore });
});

/* SAVE SCORE */
app.post("/score", async (req, res) => {
  const { username, score } = req.body;
  await User.updateOne(
    { username },
    { $max: { highScore: score } }
  );
  res.send({ ok: true });
});

app.listen(3000, () => console.log("✅ Server running on http://localhost:3000"));

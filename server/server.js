import express from "express";
import cors from "cors";
import { execFile } from "child_process";
import fs from "fs";
import path from "path";

const app = express();
app.use(cors());

const DOWNLOADS = "./downloads";
if (!fs.existsSync(DOWNLOADS)) fs.mkdirSync(DOWNLOADS);

const jobs = new Map();

app.get("/start", (req, res) => {
  const url = req.query.url;
  const id = Date.now().toString();
  const outputTemplate = `${DOWNLOADS}/%(title).200s.%(ext)s`;

  console.log("Starting download:", url);

  const yt = execFile("/usr/local/bin/yt-dlp", [
  "--extractor-args",
  "youtube:player_client=android",
  "-f",
  "best",
  "--no-part",
  "--restrict-filenames",
  "-o",
  outputTemplate,
  url
]);


  yt.stdout.on("data", d => console.log(d.toString()));
  yt.stderr.on("data", d => console.log(d.toString()));

  yt.on("close", code => {
    console.log("yt-dlp exited with code", code);
  });

  jobs.set(id, {
  dir: DOWNLOADS,
  started: Date.now()
});

  res.json({ id });
});


app.get("/file/:id", (req, res) => {
  const job = jobs.get(req.params.id);
  if (!job) return res.send("Invalid job");

  const files = fs.readdirSync(job.dir)
    .map(name => ({
      name,
      time: fs.statSync(path.join(job.dir, name)).mtimeMs
    }))
    .filter(f => f.time >= job.started);

  if (files.length === 0) {
    return res.send(`
      <h2>Processing…</h2>
      <script>
        setTimeout(() => location.reload(), 3000);
      </script>
    `);
  }

  const latest = files.sort((a,b) => b.time - a.time)[0];
  const fullPath = path.join(job.dir, latest.name);

  res.download(fullPath, latest.name, () => {
    fs.unlinkSync(fullPath);
    jobs.delete(req.params.id);
  });
});

app.listen(3000, () =>
  console.log("Server running on port 3000")
);

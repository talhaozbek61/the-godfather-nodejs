import { createServer } from "http";
import url from "url";
import path from "path";
import fs from "fs/promises";
import ejs from "ejs";
import characters from "./data.js";

const PORT = process.env.PORT || 8000;

const __filename = url.fileURLToPath(import.meta.url);
// console.log(__filename);

const __dirname = path.dirname(__filename);
// console.log(__dirname);

// Helper render function
const renderPage = async (templateName, data = {}) => {
  const templatePath = path.join(__dirname, "views", `${templateName}.ejs`);
  const template = await fs.readFile(templatePath, "utf8");
  return ejs.render(template, data, {
    views: [path.join(__dirname, "views")],
  });
};

// logger middleware
const logger = (req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
};

// html middleware
const htmlMiddleware = (req, res, next) => {
  res.setHeader("Content-Type", "text/html");
  next();
};

// Not Found handler
const notFoundHandler = async (req, res) => {
  res.statusCode = 404;
  const html = await renderPage("not-found");
  res.write(html);
  res.end();
};

// Index Handler
const getIndexHandler = async (req, res) => {
  try {
    res.statusCode = 200;
    const html = await renderPage("index", { characters });
    res.write(html);
    res.end();
  } catch (err) {
    console.log(err);
    notFoundHandler(req, res);
  }
};

// Router handler for GET /character/:username
const getCharacterByeUsernameHandler = async (req, res) => {
  const username = req.url.split("/")[2];
  // Find character
  const character = characters.find(
    (character) => character.username === username
  );

  if (character) {
    res.statusCode = 200;
    const html = await renderPage("character", { character });
    res.write(html);
    res.end();
  } else notFoundHandler(req, res);
};

const server = createServer((req, res) => {
  logger(req, res, () => {
    htmlMiddleware(req, res, () => {
      try {
        // for index
        if (req.method === "GET" && req.url === "/") getIndexHandler(req, res);
        // for /character/:username
        else if (
          req.method === "GET" &&
          req.url.match(/\/character\/([a-zA-Z_]+)/)
        )
          getCharacterByeUsernameHandler(req, res);
        else notFoundHandler(req, res);
      } catch (error) {
        console.log(error);
        notFoundHandler(req, res);
      }
    });
  });
});

server.listen(PORT, () => {
  console.log(`Server running port ${PORT}`);
});

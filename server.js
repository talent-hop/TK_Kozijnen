/* eslint-disable @typescript-eslint/no-require-imports */
const express = require("express");

const app = express();

app.use(express.static("public")); // map met je html/css/js

app.listen(3000, () => console.log("Server draait op http://localhost:3000"));

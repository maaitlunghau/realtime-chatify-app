import express from "express";

const jsonParser = express.json();
const urlencodedParser = express.urlencoded({ extended: true });

export {
    jsonParser,
    urlencodedParser
}
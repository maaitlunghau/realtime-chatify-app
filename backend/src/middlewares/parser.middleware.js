import express from "express";

const jsonParser = express.json({ limit: '5mb' });
const urlencodedParser = express.urlencoded({ extended: true, limit: '5mb' });

export {
    jsonParser,
    urlencodedParser
}
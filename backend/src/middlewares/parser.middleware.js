import express from "express";

const jsonParser = express.json({ limit: '10mb' });
const urlencodedParser = express.urlencoded({ extended: true, limit: '10mb' });

export {
    jsonParser,
    urlencodedParser
}
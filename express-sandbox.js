const express = require('express');
const request = require('supertest');

const app = express();

app.use((req, res) => {
  console.log(req.query);
  res.send({ msg: 'hello world' });
});

return request(app)
  .get('/')
  .then((res) => {
    console.log(res.text);
  });

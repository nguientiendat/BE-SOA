const express = require('express');
const app = express();
const port = process.env.PORT || 3001;

app.get('/', (req, res) => {
  res.send('Hello from email-service!');
});

app.listen(port, () => {
  console.log(`email-service listening at http://localhost:${port}`);
});
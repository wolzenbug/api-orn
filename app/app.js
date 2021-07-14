const express = require('express');
var exphbs = require('express-handlebars');

const app = express();

const port = 5000;

app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');

app.use('/static', express.static(__dirname + '/assets'));

// EXAMPLE: http://localhost:3000/?lang=latin&t=tf
app.get('/', (req, res) => {
  res.locals.lang = req.query.lang; // language
  res.locals.t = req.query.t;       // technology (tensorflow/tesseract)
  res.locals.r = req.query.r;       // number of rounds (opt)
  res.render('quiz');
});

app.get('/training', (req, res) => {
  res.sendFile(__dirname + '/views/training.html');
});

app.listen(process.env.PORT || port, () => {
  console.log(`API-ORN dev server listening at http://localhost:${port}`);
  console.log(`Example http://localhost:${port}/?lang=latin&t=tf`);
});

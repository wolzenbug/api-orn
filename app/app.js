const express = require('express');
var exphbs  = require('express-handlebars');

const app = express();

const port = 3000;

app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars')

app.use('/static', express.static(__dirname + '/assets'));

// EXAMPLE: http://localhost:3000/?lang=latin&t=tf
app.get('/', (req, res) => {
  res.locals.lang = req.query.lang;
  res.locals.t = req.query.t;
  res.render('quiz');
});

app.get('/training', (req, res) => {
  res.sendFile(__dirname + '/views/training.html')
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
});

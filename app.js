//Importando o Express
var express = require('express');

//Importando o Body Parser para fazer as requisições do servidor.
var bodyParser = require('body-parser');

//Importando o Path, que abrevia o caminho de arquivos.
var path = require('path');

//Importando o Express validator.
var expressValidator = require('express-validator');

//Importando o MongoJS
var mongojs = require('mongojs');
var db = mongojs('customerapp', ['users'])
var ObjectId = mongojs.ObjectId;
db.on('error', function (err) {
    console.log('database error', err)
})

db.on('connect', function () {
    console.log('database connected')
})

//Inicia o App Express.
var app = express();

// Middleware --> ordem importa e roda toda vez que uma aplicação carrega.
// var logger = function(req, res, next){
//   console.log('Logging...');
//   next();
// }

//View Engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

//Body Parser Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

//Set Static Path Middleware
app.use(express.static(path.join(__dirname, 'public')));

//Global variáveis
app.use(function(req, res, next){
  res.locals.errors = null;
  next();
});

//Validator Middleware
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
    var namespace = param.split('.')
    , root = namespace.shift()
    , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return{
      param: formParam,
      msg: msg,
      value: value
    };
  }
}));

//Handle a get request from the site.
app.get('/', function(req, res){
  db.users.find(function (err, docs) {
	// docs is an array of all the documents in mycollection
    console.log(docs);
    res.render('index', {
      title: 'Customers',
      users: docs,
    });//Faz o parse do objeto para o browser.
  })
});

//Pegar a submissão do novo Cliente.

app.post('/users/add', function(req, res){

  req.checkBody('first_name', 'First Name is required!').notEmpty();
  req.checkBody('last_name', 'Last Name is required!').notEmpty();
  req.checkBody('email', 'Email is required!').notEmpty();

  var errors = req.validationErrors();

  if(errors){
    res.render('index', {
      title: 'Customers',
      users: users,
      errors: errors
    });//Faz o parse do objeto para o browser.

    console.log('Validation Error');
  } else {
    var newUser = {
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      email: req.body.email
    }

    db.users.insert(newUser, function(err, result){
      if(err){
        console.log(err);
      }else{
        res.redirect('/');
      }
    });

    console.log('SUCCCESS');

  }
});

app.delete('/users/delete/:id', function(req, res){
  db.users.remove({_id: ObjectId(req.params.id)}, function(err){
    if(err){
      console.log(err);
    }else{
      res.redirect('/');
    }
  });
});

//Inicia o servidor.
app.listen(3000, function(){
  console.log('Server started on Port 3000...');
});

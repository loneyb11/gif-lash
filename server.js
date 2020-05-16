const express = require('express');
const exphbs = require('express-handlebars');
const session = require('express-session');
const socketio = require('socket.io');
const db = require('./models');

const app = express();
const Port = process.env.PORT || 3000;

const sessionMiddleware = session({ secret: 'secret', resave: false, saveUninitialized: false });
app.use(sessionMiddleware);
require('./config/passport.js')(app);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));
app.engine('handlebars', exphbs({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');
const authRouter = require('./src/routes/authRoutes.js');
const serverRouter = require('./src/routes/serverRoutes.js');

app.use( "/auth", authRouter() );
app.use( "/game", serverRouter() );

app.get("/", function(req, res){
  res.redirect("/auth/login");
})

db.sequelize.sync().then( () => {
  // eslint-disable-next-line no-console
  const expressServer = app.listen(Port, () => console.log(`Example app listening at http://localhost:${Port}`));
  const io = socketio(expressServer);
  io.use((socket, next) => {
    sessionMiddleware(socket.request, socket.request.res || {}, next);
  });
  require('./sockets/mainSocket.js')(io);
});

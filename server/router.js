const controllers = require('./controllers');
const mid = require('./middleware');

const router = (app) => {
  app.get('/getToken', mid.requiresSecure, controllers.Account.getToken);
  app.get('/getBp', mid.requiresSecure, controllers.Blueprint.getBp);
  app.get('/login', mid.requiresSecure, mid.requiresLogout, controllers.Account.renderLogin);
  app.post('/login', mid.requiresSecure, mid.requiresLogout, controllers.Account.login);
  app.post('/signup', mid.requiresSecure, mid.requiresLogout, controllers.Account.signup);
  app.post('/changePass', mid.requiresSecure, mid.requiresLogin, controllers.Account.changePass);
  app.get('/logout', mid.requiresLogin, controllers.Account.logout);
  app.get('/editor', mid.requiresLogin, controllers.Blueprint.editor);
  app.post('/editor', mid.requiresLogin, controllers.Blueprint.makeBp);
  app.delete('/editor', mid.requiresLogin, controllers.Blueprint.deleteBp);
  app.get('/donate', mid.requiresSecure, controllers.renderDonate);
  app.get('/about', controllers.renderAbout);
  app.get('/*', mid.requiresSecure, mid.requiresLogout, controllers.Account.renderLogin);
};

module.exports = router;

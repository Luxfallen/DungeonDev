const models = require('../models');
const Account = models.Account;

// Original Author: Cody Van De Mark

const renderLogin = (request, response) => {
  response.render('login', { csrfToken: request.csrfToken() });
};

const login = (request, response) => {
  const req = request;
  const res = response;
  const username = `${req.body.username}`;
  const password = `${req.body.pass}`;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }
  return Account.AccountModel.authenticate(username, password, (err, account) => {
    if (err || !account) {
      return res.status(401).json({ error: 'Wrong username/password' });
    }
    req.session.account = Account.AccountModel.toAPI(account);
    return res.json({ redirect: '/' });
  });
};

const logout = (request, response) => {
  request.session.destroy();
  response.redirect('/donate');
};

const signup = (request, response) => {
  const req = request;
  const res = response;

  // cast to strings to save some trouble
  req.body.username = `${req.body.username}`;
  req.body.pass1 = `${req.body.pass1}`;
  req.body.pass2 = `${req.body.pass2}`;

  if (!req.body.username || !req.body.pass1 || !req.body.pass2) {
    return res.status(400).json({ error: 'Please fill out all fields.' });
  }
  if (req.body.pass1 !== req.body.pass2) {
    return res.status(400).json({ error: 'The passwords do not match' });
  }

  return Account.AccountModel.genHash(req.body.pass1, (salt, hash) => {
    const accountData = {
      username: req.body.username,
      salt,
      password: hash,
    };
    const newAccount = new Account.AccountModel(accountData);
    const savePromise = newAccount.save();

    savePromise.then(() => {
      req.session.account = Account.AccountModel.toAPI(newAccount);
      return res.json({ redirect: '/' });
    });
    savePromise.catch((err) => {
      console.log(err);
      if (err.code === 11000) {
        return res.status(400).json({ error: 'Username taken, try again' });
      }
      return res.status(400).json({ error: 'An error has occurred' });
    });
  });
};

const changePass = (request, response) => {
  const req = request;
  const res = response;

  // Cast to strings
  req.body.pass = `${req.body.pass}`;
  req.body.diffPass1 = `${req.body.diffPass1}`;
  req.body.diffPass2 = `${req.body.diffPass2}`;

  // Check for empty fields
  if (!req.body.pass || !req.body.diffPass1 || !req.body.diffPass2) {
    return res.status(400).json({ error: 'Please fill out all fields' });
  }
  // Check if original password matches
  const userInfo = Account.AccountModel.authenticate(req.session.account.username, req.body.pass,
    (err, account) => account);
  if (!userInfo) {
    return res.status(401).json({ error: 'Wrong username/password' });
  }
  // Check for password confirmation
  if (req.body.diffPass1 !== req.body.diffPass2) {
    return res.status(400).json({ error: 'Your new passwords do not match' });
  }
  // Passed all checks, so change the password
  return Account.AccountModel.genHash(req.body.diffPass1, (salt, hash) => {
    userInfo.salt = salt;
    userInfo.password = hash;
    const savePromise = userInfo.save();

    savePromise.then(() => {
      req.session.account = Account.AccountModel.toAPI(userInfo);
      return res.json({ redirect: '/editor' });
    });
    savePromise.catch((err) => {
      console.log(err);
      return res.status(400).json({ error: 'An error has occurred.' });
    });
  });
};

const getToken = (request, response) => {
  const req = request;
  const res = response;
  // console.log(request);

  const csrfJSON = {
    csrfToken: req.csrfToken(),
  };
  res.json(csrfJSON);
};

module.exports = {
  renderLogin,
  login,
  logout,
  signup,
  changePass,
  getToken,
};

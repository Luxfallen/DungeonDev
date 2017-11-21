const crypto = require('crypto');
const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

let AccountModel = {};
const iterations = 10000;
const saltLength = 64;
const keyLength = 64;
const hmac = 'whirlpool';

const AccountSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    match: /^[A-Za-z0-9_\-.]{1,24}$/,
  },
  salt: {
    type: Buffer,
    required: true,
  },
  password: {
    type: String,
    required: true,
    trim: true,
  },
  createdOn: {
    type: Date,
    default: Date.now,
  },
});

AccountSchema.statics.toAPI = doc => ({
  username: doc.username,
  _id: doc._id,
});

const validatePassword = (doc, password, callback) => {
  const pass = doc.password;
  return crypto.pbkdf2(password, doc.salt, iterations, keyLength, hmac, (err, hash) => {
    if (hash.toString('hex') !== pass) {
      return callback(false);
    }
    return callback(true);
  });
};

AccountSchema.statics.findByUsername = (name, callback) => {
  const search = {
    username: name,
  };
  return AccountModel.findOne(search, callback);
};

AccountSchema.statics.genHash = (password, callback) => {
  const salt = crypto.randomBytes(saltLength);
  crypto.pbkdf2(password, salt, iterations, keyLength, hmac, (err, hash) =>
    callback(salt, hash.toString('hex')));
};

AccountSchema.statics.authenticate = (username, password, callback) =>
  AccountModel.findByUsername(username, (err, doc) => {
    if (err) return callback(err);
    if (!doc) return callback();
    return validatePassword(doc, password, (result) => {
      if (result) return callback(null, doc);
      return callback();
    });
  });

AccountModel = mongoose.model('Account', AccountSchema);

module.exports = {
  AccountModel,
  AccountSchema,
};

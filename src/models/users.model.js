// users-model.js - A mongoose model
//
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.
module.exports = function (app) {
  const mongooseClient = app.get('mongooseClient');
  const users = new mongooseClient.Schema({
    email: {
      type: String,
      unique: true,
      lowercase: true
    },
    username: {
      type: String,
      unique: true,
      lowercase: true
    },
    description: {
      type: String
    },
    password: {
      type: String
    },
    verified: {
      type: Boolean,
      default: false
    }
  }, {
    timestamps: true
  });

  return mongooseClient.model('users', users);
};

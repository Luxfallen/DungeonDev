const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

// So the lintr doesn't yell for using a capitalized method
const convertId = mongoose.Types.ObjectId;

let BlueprintModel = {};
/*
const myPoint = new mongoose.Schema({
  x: {
    type: Number,
    required: true,
  },
  y: {
    type: Number,
    required: true,
  },
});

const Wall = new mongoose.Schema({
  points: {
    type: [myPoint],
  },
});
*/
const BlueprintSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  walls: {
    // type: [Wall],
    /*
     * A one dimensional array of strings will allow me to stringify the data
     * I need and allow me to avoid making the custom validations that a mixed array
     * of schemata would require.
     * This may be turned into a singular string later if bitpacking is successful.
     */
    type: String,
    default: null,
  },
  owner: {
    type: mongoose.Schema.ObjectId,
    required: true,
    ref: 'Account',
  },
  createdOn: {
    type: Date,
    default: Date.now,
  },
});

BlueprintSchema.statics.toAPI = (doc) => ({
  name: doc.name,
  walls: doc.walls,
});

BlueprintSchema.statics.findByOwner = (ownerId, callback) => {
  const search = { owner: convertId(ownerId) };
  return BlueprintModel.find(search).select('name walls').exec(callback);
};

BlueprintModel = mongoose.model('Blueprint', BlueprintSchema);

module.exports = {
  BlueprintModel,
  BlueprintSchema,
};

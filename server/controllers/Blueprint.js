const models = require('../models');
const Blueprint = models.Blueprint;

const editorPage = (request, response) => {
  Blueprint.BlueprintModel.findByOwner(request.session.account._id, (err, docs) => {
    if (err) {
      console.log(err);
      return response.status(400).json({ error: 'An error occurred' });
    }
    return response.render('app', { csrfToken: request.csrfToken(), blueprints: docs });
  });
};
/* Use this to determine whether to call make or edit
const submitBlueprint = (request, response) => {

}
*/
const makeBlueprint = (request, response) => {
  if (!request.body.name) {
    return response.status(400).json({ error: 'Blueprints must be named' });
  }
  const blueprintInfo = {
    name: request.body.name,
    walls: request.body.walls || null,
    owner: request.session.account._id,
  };

  const newBp = new Blueprint.BlueprintModel(blueprintInfo);
  const bpPromise = newBp.save();

  bpPromise.then(() => response.json({ redirect: '/editor' }));
  bpPromise.catch((err) => {
    console.log(err);
    if (err.code === 11000) {
      return response.status(400).json({ error: 'Blueprint already exists' });
    }
    return response.status(400).json({ error: 'An error occurred' });
  });
  return bpPromise;
};

const getBlueprints = (request, response) => {
  const req = request;
  const res = response;
  return Blueprint.BlueprintModel.findByOwner(req.session.account._id, (err, docs) => {
    if (err) {
      console.log(err);
      return res.status(400).json({ error: 'An error occurred' });
    }
    return res.json({ blueprints: docs });
  });
};
/*  Used to save editted blueprints to user's account
const saveBlueprint = (request, response) => {

};
*/
const deleteBlueprint = (request, response) => {
  const req = request;
  const res = response;
  Blueprint.BlueprintModel.findByIdAndRemove(JSON.parse(req.body._id), (err) => {
    if (err) {
      console.log(err);
      if (err.code === 503) {
        return res.status(503).json({ error: 'Too many requests' });
      }
      return res.status(400).json({ error: 'An error occurred' });
    }
    return false;
  });
};

module.exports = {
  editor: editorPage,
  makeBp: makeBlueprint,
  getBp: getBlueprints,
  deleteBp: deleteBlueprint,
};

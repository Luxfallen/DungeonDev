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

//  Used to save editted blueprints to user's account
const saveBlueprint = (request, response, doc) => {
  const bp = doc;
  bp.walls = request.body.walls;
  console.log(bp.walls);
  const savePromise = bp.save();
  savePromise.then(() => response.json({ redirect: '/editor' }));
  savePromise.catch((err) => {
    console.log(err);
    return response.status(400).json({ error: 'An error occurred' });
  });
  return savePromise;
};

// Use this to determine whether to call make or edit
const submitBlueprint = (request, response) => {
  Blueprint.BlueprintModel.findById(request.body._id, (err, doc) => {
    if (!doc && request.body.name) {
      return makeBlueprint(request, response);
    } else if (doc && !request.body.name) {
      return saveBlueprint(request, response, doc);
    }
    return response.status(400).json({ error: 'An error occurred' });
  });
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
  makeBp: submitBlueprint,
  getBp: getBlueprints,
  deleteBp: deleteBlueprint,
};

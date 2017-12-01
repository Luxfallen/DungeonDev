'use strict';

/* eslint-disable */

// Helper Methods
//region
var handleError = function handleError(message) {
  $('#errorMessage').text(message);
  $('#displayMessage').animate({ left: 'toggle' }, 500);
};

var redirect = function redirect(response) {
  $('#displayMessage').animate({ left: 'hide' }, 500);
  window.location = response.redirect;
};

var sendAjax = function sendAjax(type, action, data, success) {
  $.ajax({
    cache: false,
    type: type,
    url: action,
    data: data,
    dataType: 'json',
    success: success,
    error: function error(xhr, status, _error) {
      console.log(xhr);
      var messageObj = JSON.parse(xhr.responseText);
      handleError(messageObj.error);
    }
  });
};

var measureOffset = function measureOffset(w, h) {
  var offset = {};
  offset.w = $(window).width() * w;
  offset.h = $(window).height() * h;
  return offset;
};
//endregion

// Donate
var DonateWindow = function DonateWindow(props) {
  return React.createElement(
    'div',
    { id: 'donateWindow' },
    React.createElement(
      'h3',
      null,
      'Tired of ads?'
    ),
    React.createElement(
      'p',
      null,
      'More donations means less ads and more improvements to the app!'
    ),
    React.createElement(
      'label',
      { htmlFor: 'donation' },
      'Your Donation:'
    ),
    React.createElement('input', { id: 'donation', type: 'text', name: 'donation', placeholder: '$x.xx' }),
    React.createElement('input', { id: 'donate', type: 'button', value: 'Donate', onClick: handleDonate })
  );
};

var createDonateWindow = function createDonateWindow() {
  ReactDOM.render(React.createElement(DonateWindow, null), document.querySelector('#content'));
};

var handleDonate = function handleDonate(e) {
  var num = document.querySelector('#donation').value;
  num = num.split("");
  if (num[0] !== '$') {
    handleError('Please use the format $x.xx');
    return;
  }
  if (!num) {
    console.log('error: ' + num);return;
  }
  var parsedValue = num[1];
  for (var i = 2; i < num.length; i++) {
    parsedValue += num[i];
  }
  parsedValue = parseFloat(parsedValue);
  handleError('Thank you for donating $' + parsedValue + '!');
};

// About
var AboutWindow = function AboutWindow(props) {
  return React.createElement(
    'div',
    { id: 'documentation' },
    React.createElement(
      'h1',
      null,
      'Documentation'
    ),
    React.createElement(
      'h3',
      null,
      'Purpose'
    ),
    React.createElement(
      'p',
      null,
      'The site is intended to be a tool for tabletop role-playing games and contructing maps for them. The idea initially came from a personal need for a neat and free way to make a blueprint for a specific building in a Dungeons & Dragons campaign.'
    ),
    React.createElement(
      'p',
      null,
      'The initial idea seems to have been overscoped, especially considering that the idea was simplified even further in an attempt to meet the deadline. As it stands, the site is capable of creating "blueprints" which users can draw on using HTML Canvas. Rather than storing coordinates as initially planned, I was recommended to save the canvas as an image, and then load the image back in when a user wanted to continue developing. However, there seems to be an issue when dealing with canvas.toDataURL that I did not anticipate, which ate up a good deal of time and is still not resolved, so the user cannot load "blueprints" that they have previously worked on. I hope to rectify this error and restructure a good deal of the app in future development.'
    ),
    React.createElement(
      'h3',
      null,
      'Profitability'
    ),
    React.createElement(
      'p',
      null,
      'Everyone hates ads, but they are likely a substantial source of income and support for a good deal of websites. It is with that in mind that I intended to make the app have advertisements on the right side of the screen. Later on, I thought about how a good deal of projects, especially webcomics, are funded by both ads and donations. With this in mind, I created the "Donate" page. At the moment, it doesn\'t do anything with the information it\'s presented and does not prompt individuals for personal information, as the site has nowhere near enough security to warrant that.'
    ),
    React.createElement(
      'h3',
      null,
      'Templating'
    ),
    React.createElement(
      'p',
      null,
      'A combination of express and handlebars was used in order to create usable pages. However, they only account for the script links, navigation, and a very limited skeleton (a couple empty sections).'
    ),
    React.createElement(
      'h3',
      null,
      'Use of MVC'
    ),
    React.createElement(
      'p',
      null,
      'The Model-View-Controller pattern was used to generate accounts and "blueprints" that belonged to individual accounts. The pattern also enabled an efficient use of MongoDB.'
    ),
    React.createElement(
      'h3',
      null,
      'Use of MongoDB'
    ),
    React.createElement(
      'p',
      null,
      'Account information and blueprints are saved to MongoDB for safe keeping. Accounts consist of username, password, the date the account was established, and information necessary to decrypt and verify passwords, which are not only hashed, but also encrypted to add a stronger layer of security. Each blueprint stored has a name, owner ID, and a string value that was used in order to store the outcome of canvas.toDataURL() to be used when the canvas were to be loaded in.'
    ),
    React.createElement(
      'h3',
      null,
      'Above & Beyond'
    ),
    React.createElement(
      'p',
      null,
      'Express and handlebars helped a good deal, but most elements are generated with React. Although the initial "Above & Beyond" was intended to be an efficient storage of "blueprint" information via bitpacking, inexperience on my part led to a few problems eating too much time.'
    )
  );
};

var createAboutWindow = function createAboutWindow() {
  ReactDOM.render(React.createElement(AboutWindow, null), document.querySelector('#content'));
};

// React (Blueprint)
//region
var BlueprintForm = function BlueprintForm(props) {
  return React.createElement(
    'form',
    { id: 'bpForm', onSubmit: handleNewBp, name: 'bpForm', action: '/editor', method: 'POST', className: 'form' },
    React.createElement(
      'label',
      { htmlFor: 'name' },
      'Name: '
    ),
    React.createElement('input', { id: 'name', type: 'text', name: 'name', placeholder: 'Blueprint Name' }),
    React.createElement('input', { type: 'hidden', id: 'csrf', name: '_csrf', value: props.csrf }),
    React.createElement('input', { id: 'bpCreate', type: 'submit', value: '+ New' })
  );
};

var BlueprintList = function BlueprintList(props) {
  if (props.blueprints.length === 0) {
    React.createElement(
      'div',
      { 'class': 'bpListItem', 'data-key': 'null' },
      React.createElement(
        'h3',
        { 'class': 'emptyItem' },
        'No Blueprints'
      )
    );
  }
  var bpNodes = props.blueprints.map(function (blueprint) {
    if (blueprint.walls) {
      blueprint.walls = btoa(blueprint.walls);
      var img = document.createElement('img');
      img.src = blueprint.walls;
      img.width = "800";
      img.height = "500";
      document.body.appendChild(img);
    }
    return React.createElement(
      'div',
      { 'class': 'bpListItem', 'data-key': blueprint._id, 'data-walls': blueprint.walls },
      React.createElement(
        'h1',
        { 'class': 'bpDelete', onClick: handleBlueprintDel },
        ' X '
      ),
      React.createElement(
        'h3',
        { 'class': 'bpNodeName', onClick: handleBlueprint },
        blueprint.name
      )
    );
  });
  return React.createElement(
    'div',
    { className: 'bpList' },
    bpNodes
  );
};

// Remember to make the border white and background medium blue
var BlueprintCanvas = function BlueprintCanvas(props) {
  return React.createElement(
    'div',
    { id: 'editBp' },
    React.createElement('canvas', { id: 'bpRearCanvas', width: '800', height: '500' }),
    React.createElement('canvas', { id: 'bpCanvas', 'data-lastPt': '{}', width: '800', height: '500', onClick: handleDraw, onMouseMove: handlePreview }),
    React.createElement('input', { id: 'saveButton', type: 'button', 'data-key': props.myKey || "{}", value: 'Save', onClick: saveBlueprint })
  );
};
//endregion

// Blueprint Handling
//region
var loadBlueprints = function loadBlueprints() {
  sendAjax('GET', '/getBp', null, function (data) {
    ReactDOM.render(React.createElement(BlueprintList, { blueprints: data.blueprints }), document.querySelector("#bps"));
  });
};

var handleNewBp = function handleNewBp(e) {
  e.preventDefault();
  $("#displayMessage").animate({ left: 'hide' }, 500);

  if (document.querySelector('#name').value === '') {
    handleError("Your blueprint needs a name");
    return false;
  }

  sendAjax('POST', document.querySelector("#bpForm").getAttribute("action"), $("#bpForm").serialize(), function () {
    loadBlueprints();
  });
  return false;
};

var saveBlueprint = function saveBlueprint(e) {
  var canvas = document.querySelector('#bpRearCanvas');
  var ctx = canvas.getContext("2d");
  var walls = canvas.toDataURL();

  var key = e.target.getAttribute('data-key');
  var token = $('#csrf').serialize();
  var obj = '_id=' + key + '&' + token + '&walls=' + walls;
  sendAjax('POST', '/editor', obj, function (msg) {
    //handleError(msg);
  });
};

var handleBlueprint = function handleBlueprint(e) {
  if (e.target !== 'div') {
    e.target = e.target.parentElement;
  }
  var key = e.target.getAttribute('data-key');

  ReactDOM.render(React.createElement(BlueprintCanvas, { myKey: key }), document.querySelector("#draw"));

  var canvas = document.querySelector('#bpRearCanvas');
  var ctx = canvas.getContext("2d");
  var dataURL = e.target.getAttribute('data-walls');
  if (dataURL) {
    var img = new Image();
    img.src = dataURL;
    ctx.drawImage(img, 0, 0);
  } else {
    ctx.fillStyle = "#00F";
    ctx.fillRect(0, 0, 800, 500);
  }
};

var roundBy = function roundBy(num, val) {
  var ans = void 0;
  var half = Math.round(val / 2);
  if (num % val >= half) {
    ans = num + (val - num % val);
  } else if (num % val < half) {
    ans = num - num % val;
  } else if (num % val === 0) {
    ans = num;
  }
  return ans;
};

var snapTo = function snapTo(mouseX, mouseY, val) {
  var snap = {};
  snap.x = roundBy(mouseX, val);
  snap.y = roundBy(mouseY, val);
  return snap;
};

// Call onMouseMove
var handlePreview = function handlePreview(e) {
  var previewCanvas = document.querySelector('#bpCanvas');
  var lastPt = JSON.parse(previewCanvas.getAttribute('data-lastPt'));
  var previewCtx = previewCanvas.getContext("2d");
  var offset = measureOffset(.33, .08);
  if (lastPt.x !== '' && lastPt.y !== '') {
    var loc = snapTo(e.pageX - offset.w, e.pageY - offset.h, 10);
    previewCtx.strokeStyle = "#FFF";
    previewCtx.lineWidth = 3;
    previewCtx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
    previewCtx.beginPath();
    previewCtx.moveTo(lastPt.x, lastPt.y);
    previewCtx.lineTo(loc.x, loc.y);
    previewCtx.stroke();
  }
};

// Call onClick
var handleDraw = function handleDraw(e) {
  var previewCanvas = document.querySelector('#bpCanvas');
  var lastPt = JSON.parse(previewCanvas.getAttribute('data-lastPt'));
  var rearCanvas = document.querySelector('#bpRearCanvas');
  var rearCtx = rearCanvas.getContext("2d");
  var offset = measureOffset(.33, .08);
  var loc = snapTo(e.pageX - offset.w, e.pageY - offset.h, 10);
  if (lastPt.x === '' || lastPt.y === '') {
    lastPt.x = loc.x;lastPt.y = loc.y;
  }
  rearCtx.strokeStyle = "#FFF";
  rearCtx.lineWidth = 3;
  rearCtx.beginPath();
  rearCtx.moveTo(lastPt.x, lastPt.y);
  rearCtx.lineTo(loc.x, loc.y);
  rearCtx.stroke();
  previewCanvas.setAttribute('data-lastPt', JSON.stringify(loc));
};

var handleBlueprintDel = function handleBlueprintDel(e) {
  var key = JSON.stringify(e.target.parentElement.getAttribute('data-key'));
  var token = $('#csrf').serialize();
  var obj = '_id=' + key + '&' + token;
  sendAjax('DELETE', '/editor', obj, function (msg) {
    console.dir(msg);
  });
  document.querySelector('#draw').innerHTML = "";
  e.target.parentElement.hidden = true;
  loadBlueprints();
};
//endregion

// React (Login)
//region
var LoginWindow = function LoginWindow(props) {
  return React.createElement(
    'form',
    { id: 'loginForm', name: 'loginForm', onSubmit: handleLogin, action: '/login', method: 'POST', 'class': 'form' },
    React.createElement(
      'label',
      { htmlFor: 'username' },
      'Username: '
    ),
    React.createElement('input', { id: 'user', type: 'text', name: 'username', placeholder: 'Username' }),
    React.createElement('br', null),
    React.createElement(
      'label',
      { htmlFor: 'pass' },
      'Password: '
    ),
    React.createElement('input', { id: 'pass', type: 'password', name: 'pass', placeholder: 'Password' }),
    React.createElement('input', { type: 'hidden', name: '_csrf', value: props.csrf }),
    React.createElement('br', null),
    React.createElement('input', { className: 'formSubmit', type: 'submit', value: 'Log In' })
  );
};

var SignupWindow = function SignupWindow(props) {
  return React.createElement(
    'form',
    { id: 'signupForm', name: 'signupForm', onSubmit: handleSignup, action: '/signup', method: 'POST', className: 'form' },
    React.createElement(
      'label',
      { htmlFor: 'username' },
      'Username: '
    ),
    React.createElement('input', { id: 'user', type: 'text', name: 'username', placeholder: 'Username' }),
    React.createElement('br', null),
    React.createElement(
      'label',
      { htmlFor: 'pass1' },
      'Password: '
    ),
    React.createElement('input', { id: 'pass1', type: 'password', name: 'pass1', placeholder: 'Password' }),
    React.createElement('br', null),
    React.createElement(
      'label',
      { htmlFor: 'pass2' },
      'Confirm Password: '
    ),
    React.createElement('input', { id: 'pass2', type: 'password', name: 'pass2', placeholder: 'Confirm Password' }),
    React.createElement('input', { type: 'hidden', name: '_csrf', value: props.csrf }),
    React.createElement('br', null),
    React.createElement('input', { className: 'formSubmit', type: 'submit', value: 'Sign Up' })
  );
};

var ChangePassWindow = function ChangePassWindow(props) {
  return React.createElement(
    'form',
    { id: 'changePassForm', name: 'changePassForm', onSubmit: handleChangePass, action: '/changePass', method: 'POST', className: 'form' },
    React.createElement(
      'label',
      { htmlFor: 'pass' },
      'Old Password: '
    ),
    React.createElement('input', { id: 'pass', type: 'password', name: 'pass', placeholder: 'Old Password' }),
    React.createElement(
      'label',
      { htmlFor: 'diffPass1' },
      'New Password: '
    ),
    React.createElement('input', { id: 'diffPass1', type: 'password', name: 'diffPass1', placeholder: 'New Password' }),
    React.createElement(
      'label',
      { htmlFor: 'diffPass2' },
      'Confirm Password: '
    ),
    React.createElement('input', { id: 'diffPass2', type: 'password', name: 'diffPass2', placeholder: 'Confirm Password' }),
    React.createElement('input', { type: 'hidden', name: '_csrf', value: props.csrf }),
    React.createElement('input', { className: 'formSubmit', type: 'submit', value: 'Sign Up' })
  );
};

var createLoginWindow = function createLoginWindow(csrf) {
  ReactDOM.render(React.createElement(LoginWindow, { csrf: csrf }), document.querySelector('#content'));
};

var createSignupWindow = function createSignupWindow(csrf) {
  ReactDOM.render(React.createElement(SignupWindow, { csrf: csrf }), document.querySelector('#content'));
};

var createChangePassWindow = function createChangePassWindow(csrf) {
  ReactDOM.render(React.createElement(ChangePassWindow, { csrf: csrf }), document.querySelector('#content'));
};
//endregion

// Login & Prep
//region
var handleLogin = function handleLogin(e) {
  e.preventDefault();
  $('#displayMessage').animate({ left: 'hide' }, 500);
  if ($('#user').val() === '' || $('#pass').val() === '') {
    handleError('Username and password are required');
    return false;
  }
  sendAjax('POST', document.querySelector('#loginForm').getAttribute('action'), $('#loginForm').serialize(), redirect);
  return false;
};

var handleSignup = function handleSignup(e) {
  e.preventDefault();
  $('displayMessage').animate({ left: 'hide' }, 500);

  // check passwords
  if (document.querySelector('#user').value === '' || document.querySelector('#pass1').value === '' || document.querySelector('#pass2').value === '') {
    handleError('Please fill in all fields');
    return false;
  }

  if (document.querySelector('#pass1').value !== document.querySelector('#pass2').value) {
    //console.log(document.querySelector('#pass1').value + "," + document.querySelector('#pass2').value);
    handleError('Passwords do not match');
    return false;
  }

  sendAjax('POST', document.querySelector('#signupForm').getAttribute('action'), $('#signupForm').serialize(), redirect);
  return false;
};

var handleChangePass = function handleChangePass(e) {
  e.preventDefault();
  $('displayMessage').animate({ left: 'hide' }, 500);

  // Check passwords
  if (document.querySelector('#pass').value === '' || document.querySelector('#diffPass1').value === '' || document.querySelector('#diffPass2').value === '') {
    handleError('Please fill in all fields');
    return false;
  }

  if (document.querySelector('#diffPass1').value !== document.querySelector('#diffPass2').value) {
    handleError('Your new passwords do not match');
    return false;
  }

  // Cannot check password / password match on client-side~!

  sendAjax('POST', document.querySelector('#changePassForm').getAttribute('action'), $('#changePassForm').serialize(), redirect);
  return false;
};

var setup = function setup(csrf) {
  var form = document.querySelector('#createBp');
  var loginButton = document.querySelector('#loginButton');
  var signupButton = document.querySelector('#signupButton');
  var changePassButton = document.querySelector('#changePassButton');
  var aboutButton = document.querySelector('#aboutButton');
  var donateButton = document.querySelector('#donateButton');

  if (changePassButton) {
    changePassButton.addEventListener('click', function (e) {
      e.preventDefault();
      createChangePassWindow(csrf);
      return false;
    });
  }

  if (signupButton) {
    signupButton.addEventListener('click', function (e) {
      e.preventDefault();
      createSignupWindow(csrf);
      return false;
    });
  }

  if (loginButton) {
    loginButton.addEventListener('click', function (e) {
      e.preventDefault();
      createLoginWindow(csrf);
      return false;
    });
    createLoginWindow(csrf);
  }

  if (form) {
    ReactDOM.render(React.createElement(BlueprintForm, { csrf: csrf }), document.querySelector("#createBp"));
    loadBlueprints();
  }

  if (aboutButton) {
    aboutButton.addEventListener('click', function (e) {
      e.preventDefault();
      createAboutWindow();
      return false;
    });
  }

  if (donateButton) {
    donateButton.addEventListener('click', function (e) {
      e.preventDefault();
      createDonateWindow();
      return false;
    });
  }
};

var getToken = function getToken() {
  sendAjax('GET', '/getToken', null, function (result) {
    setup(result.csrfToken);
  });
};
//endregion

window.onload = function () {
  handleError('Later!');
  getToken();
};
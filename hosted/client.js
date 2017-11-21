'use strict';

/* eslint-disable */

// Helper Methods
//region
var handleError = function handleError(message) {
  $('#errorMessage').text(message);
  $('#displayMessage').animate({ height: 'toggle' }, 250);
};

var redirect = function redirect(response) {
  $('#displayMessage').animate({ height: 'hide' }, 250);
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
//endregion

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
        'h2',
        { 'class': 'emptyItem' },
        'No Blueprints'
      )
    );
  }
  var bpNodes = props.blueprints.map(function (blueprint) {
    return React.createElement(
      'div',
      { 'class': 'bpListItem', 'data-key': blueprint._id, onClick: handleBlueprint },
      React.createElement(
        'h1',
        { 'class': 'bpDelete', onClick: handleBlueprintDel },
        ' X '
      ),
      React.createElement(
        'h3',
        { 'class': 'bpNodeName' },
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
    React.createElement('canvas', { id: 'bpRearCanvas', width: '800', height: '600' }),
    React.createElement('canvas', { id: 'bpCanvas', width: '800', height: '600' }),
    React.createElement('input', { id: 'saveButton', type: 'button', value: 'Save', onClick: saveBlueprint })
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
  $("#displayMessage").animate({ height: 'hide' }, 250);

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
  console.log("Not implemented yet. Sorry!");
};

var handleBlueprint = function handleBlueprint(e) {
  ReactDOM.render(React.createElement(BlueprintCanvas, null), document.querySelector("#draw"));
  /*  Do I load the preexisting image here? Another method?
  const canvas = document.querySelector('#bpRearCanvas');
  const ctx = canvas.getContext("2d");
  ctx.drawImage();
  */
};

var handleBlueprintDel = function handleBlueprintDel(e) {
  var key = JSON.stringify(e.target.parentElement.getAttribute('data-key'));
  var token = $('#csrf').serialize();
  var obj = '_id=' + key + '&' + token;
  sendAjax('DELETE', '/editor', obj, function (msg) {
    console.dir(msg);
  });
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
    React.createElement(
      'label',
      { htmlFor: 'pass' },
      'Password: '
    ),
    React.createElement('input', { id: 'pass', type: 'password', name: 'pass', placeholder: 'Password' }),
    React.createElement('input', { type: 'hidden', name: '_csrf', value: props.csrf }),
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
    React.createElement(
      'label',
      { htmlFor: 'pass1' },
      'Password: '
    ),
    React.createElement('input', { id: 'pass1', type: 'password', name: 'pass1', placeholder: 'Password' }),
    React.createElement(
      'label',
      { htmlFor: 'pass2' },
      'Confirm Password: '
    ),
    React.createElement('input', { id: 'pass2', type: 'password', name: 'pass2', placeholder: 'Confirm Password' }),
    React.createElement('input', { type: 'hidden', name: '_csrf', value: props.csrf }),
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
  $('#displayMessage').animate({ height: 'hide' }, 250);
  if ($('#user').val() === '' || $('#pass').val() === '') {
    handleError('Username and password are required');
    return false;
  }
  sendAjax('POST', document.querySelector('#loginForm').getAttribute('action'), $('#loginForm').serialize(), redirect);
  return false;
};

var handleSignup = function handleSignup(e) {
  e.preventDefault();
  $('displayMessage').animate({ height: 'hide' }, 250);

  // check passwords
  if (document.querySelector('#user').value === '' || document.querySelector('#pass1').value === '' || document.querySelector('#pass2').value === '') {
    handleError('Please fill in all fields');
    return false;
  }

  if (document.querySelector('#pass1').value !== document.querySelector('#pass2').value) {
    console.log(document.querySelector('#pass1').value + "," + document.querySelector('#pass2').value);
    handleError('Passwords do not match');
    return false;
  }

  sendAjax('POST', document.querySelector('#signupForm').getAttribute('action'), $('#signupForm').serialize(), redirect);
  return false;
};

var handleChangePass = function handleChangePass(e) {
  e.preventDefault();
  $('displayMessage').animate({ height: 'hide' }, 250);

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
  }

  if (form) {
    ReactDOM.render(React.createElement(BlueprintForm, { csrf: csrf }), document.querySelector("#createBp"));
  }
  createLoginWindow(csrf);
};

var getToken = function getToken() {
  sendAjax('GET', '/getToken', null, function (result) {
    console.log(result);
    setup(result.csrfToken);
  });
};
//endregion

window.onload = function () {
  getToken();
};
/* eslint-disable */

// Helper Methods
//region
const handleError = (message) => {
  $('#errorMessage').text(message);
  $('#displayMessage').animate({ height: 'toggle' }, 250);
};

const redirect = (response) => {
  $('#displayMessage').animate({ height: 'hide' }, 250);
  window.location = response.redirect;
};

const sendAjax = (type, action, data, success) => {
  $.ajax({
    cache: false,
    type,
    url: action,
    data,
    dataType: 'json',
    success,
    error: (xhr, status, error) => {
      console.log(xhr);
      const messageObj = JSON.parse(xhr.responseText);
      handleError(messageObj.error);
    },
  });
};
//endregion

// React (Blueprint)
//region
const BlueprintForm = (props) => {
  return (
    <form id="bpForm" onSubmit={handleNewBp} name="bpForm" action="/editor" method="POST" className="form">
      <label htmlFor="name">Name: </label>
      <input id="name" type="text" name="name" placeholder="Blueprint Name"/>
      <input type="hidden" id="csrf" name="_csrf" value={props.csrf}/>
      <input id="bpCreate" type="submit" value="+ New"/>
    </form>
  );
};

const BlueprintList = (props) => {
  if (props.blueprints.length === 0) {
    <div class="bpListItem" data-key='null'>
      <h2 class="emptyItem">No Blueprints</h2>
    </div>
  }
  const bpNodes = props.blueprints.map((blueprint) => {
    return (
      <div class="bpListItem" data-key={blueprint._id} onClick={handleBlueprint}>
        <h1 class="bpDelete" onClick={handleBlueprintDel}> X </h1>
        <h3 class="bpNodeName">{blueprint.name}</h3>
      </div>
    );
  });
  return (
    <div className="bpList">
      {bpNodes}
    </div>
  );
};

// Remember to make the border white and background medium blue
const BlueprintCanvas = (props) => {
  return (
    <div id="editBp">
      <canvas id="bpRearCanvas" width="800" height="600"></canvas>
      <canvas id="bpCanvas" width="800" height="600"></canvas>
      <input id="saveButton" type="button" value="Save" onClick={saveBlueprint} />
    </div>
  );
};
//endregion

// Blueprint Handling
//region
const loadBlueprints = () => {
  sendAjax('GET', '/getBp', null, (data) => {
    ReactDOM.render(
      <BlueprintList blueprints={data.blueprints}/>, document.querySelector("#bps")
    );
  });
};

const handleNewBp = (e) => {
  e.preventDefault();
  $("#displayMessage").animate({height:'hide'}, 250);

  if(document.querySelector('#name').value === '') {
    handleError("Your blueprint needs a name");
    return false;
  }

  sendAjax('POST', document.querySelector("#bpForm").getAttribute("action"), $("#bpForm").serialize(), () => {
    loadBlueprints();
  });
  return false;
};

const saveBlueprint = (e) => {
  console.log("Not implemented yet. Sorry!")
}

const handleBlueprint = (e) => {
  ReactDOM.render(
    <BlueprintCanvas />, document.querySelector("#draw")
  );
  /*  Do I load the preexisting image here? Another method?
  const canvas = document.querySelector('#bpRearCanvas');
  const ctx = canvas.getContext("2d");
  ctx.drawImage();
  */
};

const handleBlueprintDel = (e) => {
  const key = JSON.stringify(e.target.parentElement.getAttribute('data-key'));
  const token = $('#csrf').serialize();
  const obj = `_id=${key}&${token}`;
  sendAjax('DELETE', '/editor', obj, (msg) => {
    console.dir(msg);
  });
  e.target.parentElement.hidden = true;
  loadBlueprints();
};
//endregion

// React (Login)
//region
const LoginWindow = (props) => {
  return (
    <form id="loginForm" name="loginForm" onSubmit={handleLogin} action="/login" method="POST" class="form">
      <label htmlFor="username">Username: </label>
      <input id="user" type="text" name="username" placeholder="Username"/>
      <label htmlFor="pass">Password: </label>
      <input id="pass" type="password" name="pass" placeholder="Password"/>
      <input type="hidden" name="_csrf" value={props.csrf}/>
      <input className="formSubmit" type="submit" value="Log In"/>
    </form>
  );
};

const SignupWindow = (props) => {
  return (
    <form id="signupForm" name="signupForm" onSubmit={handleSignup} action="/signup" method="POST" className="form">
      <label htmlFor="username">Username: </label>
      <input id="user" type="text" name="username" placeholder="Username"/>
      <label htmlFor="pass1">Password: </label>
      <input id="pass1" type="password" name="pass1" placeholder="Password"/>
      <label htmlFor="pass2">Confirm Password: </label>
      <input id="pass2" type="password" name="pass2" placeholder="Confirm Password"/>
      <input type="hidden" name="_csrf" value={props.csrf}/>
      <input className="formSubmit" type="submit" value="Sign Up"/>
    </form>
  );
};

const ChangePassWindow = (props) => {
  return (
    <form id="changePassForm" name="changePassForm" onSubmit={handleChangePass} action="/changePass" method="POST" className="form">
    <label htmlFor="pass">Old Password: </label>
    <input id="pass" type="password" name="pass" placeholder="Old Password"/>
    <label htmlFor="diffPass1">New Password: </label>
    <input id="diffPass1" type="password" name="diffPass1" placeholder="New Password"/>
    <label htmlFor="diffPass2">Confirm Password: </label>
    <input id="diffPass2" type="password" name="diffPass2" placeholder="Confirm Password"/>
    <input type="hidden" name="_csrf" value={props.csrf}/>
    <input className="formSubmit" type="submit" value="Sign Up"/>
  </form>
  );
}

const createLoginWindow = (csrf) => {
  ReactDOM.render(
    <LoginWindow csrf={csrf} />,
    document.querySelector('#content')
  );
}

const createSignupWindow = (csrf) => {
  ReactDOM.render(
    <SignupWindow csrf={csrf} />,
    document.querySelector('#content')
  );
}

const createChangePassWindow = (csrf) => {
  ReactDOM.render(
    <ChangePassWindow csrf={csrf} />,
    document.querySelector('#content')
  );
}
//endregion

// Login & Prep
//region
const handleLogin = (e) => {
  e.preventDefault();
  $('#displayMessage').animate({ height: 'hide' }, 250);
  if ($('#user').val() === '' || $('#pass').val() === '') {
    handleError('Username and password are required');
    return false;
  }
  sendAjax('POST', document.querySelector('#loginForm').getAttribute('action'),
    $('#loginForm').serialize(), redirect);
  return false;
};

const handleSignup = (e) => {
  e.preventDefault();
  $('displayMessage').animate({ height: 'hide' }, 250);

  // check passwords
  if (document.querySelector('#user').value === '' ||
  document.querySelector('#pass1').value === '' ||
  document.querySelector('#pass2').value === '') {
    handleError('Please fill in all fields');
    return false;
  }

  if (document.querySelector('#pass1').value !== document.querySelector('#pass2').value) {
    console.log(document.querySelector('#pass1').value + "," + document.querySelector('#pass2').value);
    handleError('Passwords do not match');
    return false;
  }

  sendAjax('POST', document.querySelector('#signupForm').getAttribute('action'),
    $('#signupForm').serialize(), redirect);
  return false;
};

const handleChangePass = (e) => {
  e.preventDefault();
  $('displayMessage').animate({ height: 'hide' }, 250);

  // Check passwords
  if (document.querySelector('#pass').value === '' ||
  document.querySelector('#diffPass1').value === '' ||
  document.querySelector('#diffPass2').value === '') {
    handleError('Please fill in all fields');
    return false;
  }

  if (document.querySelector('#diffPass1').value !== document.querySelector('#diffPass2').value) {
    handleError('Your new passwords do not match');
    return false;
  }

  // Cannot check password / password match on client-side~!

  sendAjax('POST', document.querySelector('#changePassForm').getAttribute('action'),
    $('#changePassForm').serialize(), redirect);
  return false;
};

const setup = (csrf) => {
  const form = document.querySelector('#createBp');
  const loginButton = document.querySelector('#loginButton');
  const signupButton = document.querySelector('#signupButton');
  const changePassButton = document.querySelector('#changePassButton');
  
  if (changePassButton) {
    changePassButton.addEventListener('click', (e) => {
      e.preventDefault();
      createChangePassWindow(csrf);
      return false;
    });
  }
  
  if (signupButton) {
    signupButton.addEventListener('click', (e) => {
      e.preventDefault();
      createSignupWindow(csrf);
      return false;
    });
  }

  if (loginButton) {
    loginButton.addEventListener('click', (e) => {
      e.preventDefault();
      createLoginWindow(csrf);
      return false;
    });
  }

  if (form) {
    ReactDOM.render(
      <BlueprintForm csrf={csrf} />, document.querySelector("#createBp")
    );
  }
  createLoginWindow(csrf);
};

const getToken = () => {
  sendAjax('GET', '/getToken', null, (result) => {
    console.log(result);
    setup(result.csrfToken);
  });
};
//endregion

window.onload = () => {
  getToken();
};

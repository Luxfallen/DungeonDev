/* eslint-disable */

// Helper Methods
//region
const handleError = (message) => {
  $('#errorMessage').text(message);
  $('#displayMessage').animate({ left: 'toggle' }, 500);
};

const redirect = (response) => {
  $('#displayMessage').animate({ left: 'hide' }, 500);
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

const measureOffset = (w, h) => {
  let offset = {};
  offset.w = ($(window).width() * w);
  offset.h = ($(window).height() * h);
  return offset;
}
//endregion

// Donate
const DonateWindow = (props) => {
  return (
    <div id="donateWindow">
      <h3>Tired of ads?</h3>
      <p>More donations means less ads and more improvements to the app!</p>
      <label htmlFor="donation">Your Donation:</label>
      <input id="donation" type="text" name="donation" placeholder="$x.xx"/>
      <input id="donate" type="button" value="Donate" onClick={handleDonate}/>
    </div>
  );
};

const createDonateWindow = () => {
  ReactDOM.render(
    <DonateWindow />,
    document.querySelector('#content')
  );
};

const handleDonate = (e) => {
  let num = document.querySelector('#donation').value;
  num = num.split("");
  if (num[0] !== '$') {
    handleError('Please use the format $x.xx');
    return;
  }
  if (!num) { console.log('error: '+num); return; }
  let parsedValue = num[1];
  for (let i = 2; i<num.length; i++) {
    parsedValue += num[i];
  }
  parsedValue = parseFloat(parsedValue);
  handleError(`Thank you for donating $${parsedValue}!`);
};

// About
const AboutWindow = (props) => {
  return (
    <div id="documentation">
      <h1>Documentation</h1>
      <h3>Purpose</h3>
      <p>
        The site is intended to be a tool for tabletop role-playing games and contructing maps for them. 
        The idea initially came from a personal need for a neat and free way to make a blueprint for a 
        specific building in a Dungeons & Dragons campaign.
      </p>
      <p>
        The initial idea seems to have been overscoped,
        especially considering that the idea was simplified even further in an attempt to meet the deadline. 
        As it stands, the site is capable of creating "blueprints" which users can draw on using HTML Canvas. 
        Rather than storing coordinates as initially planned, I was recommended to save the canvas as an image, 
        and then load the image back in when a user wanted to continue developing. However, there seems to be 
        an issue when dealing with canvas.toDataURL that I did not anticipate, which ate up a good deal of time 
        and is still not resolved, so the user cannot load "blueprints" that they have previously worked on. 
        I hope to rectify this error and restructure a good deal of the app in future development. 
      </p>
      <h3>Profitability</h3>
      <p>
        Everyone hates ads, but they are likely a substantial source of income and support for a good deal of websites. 
        It is with that in mind that I intended to make the app have advertisements on the right side of the screen. 
        Later on, I thought about how a good deal of projects, especially webcomics, are funded by both ads and donations. 
        With this in mind, I created the "Donate" page. At the moment, it doesn't do anything with the information it's 
        presented and does not prompt individuals for personal information, as the site has nowhere near enough security 
        to warrant that.
      </p>
      <h3>Templating</h3>
      <p>
        A combination of express and handlebars was used in order to create usable pages. However, they only account for
        the script links, navigation, and a very limited skeleton (a couple empty sections).
      </p>
      <h3>Use of MVC</h3>
      <p>
        The Model-View-Controller pattern was used to generate accounts and "blueprints" that belonged to individual accounts. 
        The pattern also enabled an efficient use of MongoDB.
      </p>
      <h3>Use of MongoDB</h3>
      <p>
        Account information and blueprints are saved to MongoDB for safe keeping. Accounts consist of username, password, the 
        date the account was established, and information necessary to decrypt and verify passwords, which are not only hashed, but 
        also encrypted to add a stronger layer of security. Each blueprint stored has a name, owner ID, and a string value that 
        was used in order to store the outcome of canvas.toDataURL() to be used when the canvas were to be loaded in.
      </p>
      <h3>Above & Beyond</h3>
      <p>
        Express and handlebars helped a good deal, but most elements are generated with React. 
        Although the initial "Above & Beyond" was intended to be an efficient storage of "blueprint" 
        information via bitpacking, inexperience on my part led to a few problems eating too much time.
      </p>
    </div>
  )
};

const createAboutWindow = () => {
  ReactDOM.render(
    <AboutWindow />,
    document.querySelector('#content')
  );
};

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
      <h3 class="emptyItem">No Blueprints</h3>
    </div>
  }
  const bpNodes = props.blueprints.map((blueprint) => {
    if(blueprint.walls) {
      blueprint.walls = btoa(blueprint.walls);
      var img = document.createElement('img');
      img.src = blueprint.walls;
      img.width = "800";
      img.height = "500";
      document.body.appendChild(img);
    }
    return (
      <div class="bpListItem" data-key={blueprint._id} data-walls={blueprint.walls}>
        <h1 class="bpDelete" onClick={handleBlueprintDel}> X </h1>
        <h3 class="bpNodeName" onClick={handleBlueprint}>{blueprint.name}</h3>
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
      <canvas id="bpRearCanvas" width="800" height="500"></canvas>
      <canvas id="bpCanvas" data-lastPt="{}" width="800" height="500" onClick={handleDraw} onMouseMove={handlePreview}></canvas>
      <input id="saveButton" type="button" data-key={props.myKey || "{}"} value="Save" onClick={saveBlueprint} />
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
  $("#displayMessage").animate({left:'hide'}, 500);

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
  const canvas = document.querySelector('#bpRearCanvas');
  const ctx = canvas.getContext("2d");
  const walls = canvas.toDataURL();

  const key = e.target.getAttribute('data-key');
  const token = $('#csrf').serialize();
  const obj = `_id=${key}&${token}&walls=${walls}`;
  sendAjax('POST', '/editor', obj, (msg) => {
    //handleError(msg);
  });
}

const handleBlueprint = (e) => {
  if (e.target !== 'div') {
    e.target = e.target.parentElement;
  }
  let key = e.target.getAttribute('data-key');

  ReactDOM.render(
    <BlueprintCanvas myKey={key} />, document.querySelector("#draw")
  );

  const canvas = document.querySelector('#bpRearCanvas');
  const ctx = canvas.getContext("2d");
  const dataURL = e.target.getAttribute('data-walls');
  if (dataURL) {
    const img = new Image();
    img.src = dataURL;
    ctx.drawImage(img, 0, 0);
  } else {
    ctx.fillStyle="#00F";
    ctx.fillRect(0,0,800,500);
  }
};

const roundBy = (num, val) => {
  let ans;
  const half = Math.round(val/2);
  if (num % val >= half) {
    ans = (num + (val-(num % val)));
  } else if (num % val < half) {
    ans = (num - (num % val));
  } else if (num % val === 0) {
    ans = num;
  }
  return ans;
};

const snapTo = (mouseX, mouseY, val) => {
  let snap = {};
  snap.x = roundBy(mouseX, val);
  snap.y = roundBy(mouseY, val);
  return snap;
};

// Call onMouseMove
const handlePreview = (e) => {
  const previewCanvas = document.querySelector('#bpCanvas');
  const lastPt = JSON.parse(previewCanvas.getAttribute('data-lastPt'));
  const previewCtx = previewCanvas.getContext("2d");
  const offset = measureOffset(.33, .08);
  if (lastPt.x !== '' && lastPt.y !=='') {
    const loc = snapTo(e.pageX - offset.w, e.pageY - offset.h, 10);
    previewCtx.strokeStyle="#FFF";
    previewCtx.lineWidth = 3;    
    previewCtx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
    previewCtx.beginPath();
    previewCtx.moveTo(lastPt.x, lastPt.y);
    previewCtx.lineTo(loc.x, loc.y);
    previewCtx.stroke();
  }
};

// Call onClick
const handleDraw = (e) => {
  const previewCanvas = document.querySelector('#bpCanvas');
  const lastPt = JSON.parse(previewCanvas.getAttribute('data-lastPt'));
  const rearCanvas = document.querySelector('#bpRearCanvas')
  const rearCtx = rearCanvas.getContext("2d");
  const offset = measureOffset(.33, .08);
  const loc = snapTo(e.pageX - offset.w, e.pageY - offset.h, 10);
  if (lastPt.x === '' || lastPt.y === '') {lastPt.x = loc.x; lastPt.y = loc.y;}
  rearCtx.strokeStyle = "#FFF";
  rearCtx.lineWidth = 3;
  rearCtx.beginPath();
  rearCtx.moveTo(lastPt.x, lastPt.y);
  rearCtx.lineTo(loc.x, loc.y);
  rearCtx.stroke();
  previewCanvas.setAttribute('data-lastPt', JSON.stringify(loc));
};

const handleBlueprintDel = (e) => {
  const key = JSON.stringify(e.target.parentElement.getAttribute('data-key'));
  const token = $('#csrf').serialize();
  const obj = `_id=${key}&${token}`;
  sendAjax('DELETE', '/editor', obj, (msg) => {
    console.dir(msg);
  });
  document.querySelector('#draw').innerHTML = "";
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
      <br/>
      <label htmlFor="pass">Password: </label>
      <input id="pass" type="password" name="pass" placeholder="Password"/>
      <input type="hidden" name="_csrf" value={props.csrf}/>
      <br/>
      <input className="formSubmit" type="submit" value="Log In"/>
    </form>
  );
};

const SignupWindow = (props) => {
  return (
    <form id="signupForm" name="signupForm" onSubmit={handleSignup} action="/signup" method="POST" className="form">
      <label htmlFor="username">Username: </label>
      <input id="user" type="text" name="username" placeholder="Username"/>
      <br/>
      <label htmlFor="pass1">Password: </label>
      <input id="pass1" type="password" name="pass1" placeholder="Password"/>
      <br/>
      <label htmlFor="pass2">Confirm Password: </label>
      <input id="pass2" type="password" name="pass2" placeholder="Confirm Password"/>
      <input type="hidden" name="_csrf" value={props.csrf}/>
      <br/>
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
  $('#displayMessage').animate({ left: 'hide' }, 500);
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
  $('displayMessage').animate({ left: 'hide' }, 500);

  // check passwords
  if (document.querySelector('#user').value === '' ||
  document.querySelector('#pass1').value === '' ||
  document.querySelector('#pass2').value === '') {
    handleError('Please fill in all fields');
    return false;
  }

  if (document.querySelector('#pass1').value !== document.querySelector('#pass2').value) {
    //console.log(document.querySelector('#pass1').value + "," + document.querySelector('#pass2').value);
    handleError('Passwords do not match');
    return false;
  }

  sendAjax('POST', document.querySelector('#signupForm').getAttribute('action'),
    $('#signupForm').serialize(), redirect);
  return false;
};

const handleChangePass = (e) => {
  e.preventDefault();
  $('displayMessage').animate({ left: 'hide' }, 500);

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
  const aboutButton = document.querySelector('#aboutButton');
  const donateButton = document.querySelector('#donateButton');

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
    createLoginWindow(csrf);
  }

  if (form) {
    ReactDOM.render(
      <BlueprintForm csrf={csrf} />, document.querySelector("#createBp")
    );
    loadBlueprints();
  }

  if (aboutButton) {
    aboutButton.addEventListener('click', (e) => {
      e.preventDefault();
      createAboutWindow();
      return false;
    })
  }

  if (donateButton) {
    donateButton.addEventListener('click', (e) => {
      e.preventDefault();
      createDonateWindow();
      return false;
    });
  }
};

const getToken = () => {
  sendAjax('GET', '/getToken', null, (result) => {
    setup(result.csrfToken);
  });
};
//endregion

window.onload = () => {
  handleError('Later!');
  getToken();
};

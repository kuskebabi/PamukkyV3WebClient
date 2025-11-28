let reactionemojis = ["👍","👎","😃","😂","👏","😭","💛","🤔","🎉","🔥", "💀","😘","😐","😡","👌","😆","😱","😋"];

let isTouch = false;
let lastPointerPosition = {x: 0, y: 0};

addEventListener("pointerdown", function(event) {
	isTouch = event.pointerType == "touch";
	lastPointerPosition = {x: event.clientX, y: event.clientY}
})

function linkify(inputText) {
	var replacedText, replacePattern1, replacePattern2, replacePattern3;
	inputText = inputText.replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/ /g,"&nbsp;").replace(/\r/g,"")

	// Fix newlines.
	inputText = inputText.replace(/\n/g,"<br>");

	//URLs starting with http://, https://, or ftp://
	replacePattern1 = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim;
	replacedText = inputText.replace(/&nbsp;/g," ").replace(replacePattern1, '<a href="$1" target="_blank">$1</a>');

	//URLs starting with "www." (without // before it, or it'd re-link the ones done above).
	replacePattern2 = /(^|[^\/])(www\.[\S]+(\b|$))/gim;
	replacedText = replacedText.replace(replacePattern2, '$1<a href="https://$2" target="_blank">$2</a>');

	//Change email addresses to mailto:: links.
	replacePattern3 = /(([a-zA-Z0-9\-\_\.])+@[a-zA-Z\_]+?(\.[a-zA-Z]{2,6})+)/gim;
	replacedText = replacedText.replace(replacePattern3, '<a href="mailto:$1">$1</a>');

	return replacedText;
}

function imageView(url) {
	let w = 0;
	let h = 0;
	let zoom = 1;
	
	var bg = document.createElement("div");
	bg.classList.add("bgcover");
	bg.style.display = "flex";
	bg.style.alignItems = "center";
	
	bg.style.overflow = "auto";
	bg.onclick = function(e) {
		if (e.target == bg) {
			bg.remove()
		}
	}
	bg.addEventListener("wheel",function(e) {
		if (e.ctrlKey) {
			if (e.deltaY < 0) {
				zoom += 0.1;
			}else {
				zoom -= 0.1;
				if (zoom < 0.1) {
					zoom = 0.1;
				}
			}
			applyPos();
			e.preventDefault();
		}
	})
	bg.tabIndex = "0";
	
	
	bg.addEventListener("keydown",function(e) {
		if (e.key == "Escape") {
			bg.click();
		}
	})

    let closebtn = document.createElement("button");
	closebtn.classList.add("transparentbtn");
	closebtn.style.position = "fixed";
	closebtn.style.top = "0px";
	closebtn.style.right = "0px";
	closebtn.style.width = "48px";
	closebtn.style.height = "48px";
	closebtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" height="40px" viewBox="0 -960 960 960" width="40px" style="fill: white;"><path d="m251.33-204.67-46.66-46.66L433.33-480 204.67-708.67l46.66-46.66L480-526.67l228.67-228.66 46.66 46.66L526.67-480l228.66 228.67-46.66 46.66L480-433.33 251.33-204.67Z"/></svg>';
	closebtn.title = getString("navigation_close");
	bg.appendChild(closebtn);
	closebtn.addEventListener("click",function() {
		bg.click();
	});

	let loader = document.createElement("div");
	loader.classList.add("loader");
	loader.style.position = "fixed";
	loader.style.left = loader.style.top = "calc(50% - 20px)";
	bg.appendChild(loader);

	var img = document.createElement("img")
	img.style.background = "white"
	img.src = url;
	img.style.display = "none";
	img.onload = function() {
		img.style.display = "";
		loader.remove();

		w = img.naturalWidth;
		h = img.naturalHeight;
		
		let size = w;
		let docsize = window.innerWidth;
		if (h > w) {
			docsize = window.innerHeight;
			size = h;
		}

		zoom = Math.min(1, docsize / size);
		applyPos();
	};

	bg.appendChild(img)
	document.body.appendChild(bg)
	
	function applyPos() {
		img.style.width = w * zoom + "px";
		img.style.height = h * zoom + "px";
		if (w * zoom > window.innerWidth) {
			bg.style.justifyContent = "";
		}else {
			bg.style.justifyContent = "center";
		}
		if (h * zoom > window.innerHeight) {
			bg.style.alignItems = "";
		}else {
			bg.style.alignItems = "center";
		}
	}
    
	bg.focus();
	return bg;
}

function videoView(url) {
	var bg = document.createElement("div");
	bg.classList.add("bgcover");
	bg.style.display = "flex";
	bg.style.alignItems = "center";
	
	bg.style.overflow = "auto";
	bg.onclick = function(e) {
		if (e.target == bg) {
			bg.remove()
		}
	}
	bg.tabIndex = "0";
	
	
	bg.addEventListener("keydown",function(e) {
		if (e.key == "Escape") {
			bg.click();
		}
	})

    let closebtn = document.createElement("button");
	closebtn.classList.add("transparentbtn");
	closebtn.style.position = "fixed";
	closebtn.style.top = "0px";
	closebtn.style.right = "0px";
	closebtn.style.width = "48px";
	closebtn.style.height = "48px";
	closebtn.style.zIndex = "1";
	closebtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" height="40px" viewBox="0 -960 960 960" width="40px" style="fill: white;"><path d="m251.33-204.67-46.66-46.66L433.33-480 204.67-708.67l46.66-46.66L480-526.67l228.67-228.66 46.66 46.66L526.67-480l228.66 228.67-46.66 46.66L480-433.33 251.33-204.67Z"/></svg>';
	closebtn.title = getString("navigation_close");
	bg.appendChild(closebtn);
	closebtn.addEventListener("click",function() {
		bg.click();
	});

	var video = document.createElement("video")
	video.style.position = "fixed";
	video.style.left = video.style.top = "0px";
	video.style.width = video.style.height = "100%";
	video.controls = true;
	video.src = url;

	bg.appendChild(video)
	document.body.appendChild(bg)
	bg.focus();
	return bg;
}

let localization = {};

function getLocalization() {
	fetch("localization/languages.json").then(function(res) {
		if (res.ok) {
			res.json().then(function(languages) {
				let languageToLoad = undefined;

				navigator.languages.forEach(function(language) {
					if (languageToLoad != undefined) return;
					language = language.toLocaleLowerCase();
					if (languages.includes(language)) {
						languageToLoad = language;
					}else if (languages.includes(language.split("-")[0])) {
						languageToLoad = language.split("-")[0];
					}else {
						// Lets say user has language as "tr" and not "tr-tr". catch them here.
						languages.forEach(function(lang) {
							if (language.split("-")[0] == lang.split("-")[0]) {
								languageToLoad = lang;
							}
						})
					}
				});

				if (languageToLoad == undefined) languageToLoad = "en";

				fetch("localization/" + languageToLoad + ".json").then(function(res) {
					if (res.ok) {
						res.json().then(function(json) {
							localization = json;
							loaded();
						});
					}
				});
			});
		}
	})
}

function getString(stringid, replacetag = "", val = "") {
	if (localization[stringid]) {
		let tag = "[" + replacetag.toUpperCase() + "]";
		if (typeof localization[stringid] == "object") {
			if (localization[stringid].hasOwnProperty(val.toString())) {
				return localization[stringid][val.toString()];
			}else {
				return localization[stringid]["_NORMAL"].replace(tag, val);
			}
		}
		return localization[stringid].replace(tag, val);
	}
	return stringid;
}


getLocalization();

let currentServer = "";
let serverInfo = {};

// Add load event listener and add delay so splash is visible
let loadedCount = 0;
function loaded() {
	loadedCount++;
	if (loadedCount == 2) setTimeout(init,1000);
}

window.onload = loaded;

// Start the app
function init() {
let logininfo = {};
let currentuser = {};
let chats = []
let cachedinfo = {};
let idcallbacks = {};

let allhooks = [];

async function getServerInfo(url) {
	try {
		let res = await fetch(url + "pamukky");
		if (res.ok) {
			let result = await res.json();

			if (await checkServerCompatibility(result)) return result;

			console.log("Server is not supported!");
			return null;
		}
	}catch (e) {
		console.log("Connection failed: " + e);
		return null;
	}
}

async function checkServerCompatibility(info) {
	if (info.isPamukky == true) {
		if (info.pamukkyType == 3) {
			if (info.version >= 0) {
				return true;
			}else {
				alert(getString("server_connection_error_version_unsupported").replace("[RANGE_CLIENT_CONNECT_SERVER_VERSIONS]", ">=0").replace("[SERVER_VERSION]", result.version))
			}
		}
	}

	return false;
}

async function checkServer(url) {
	try {
		let res = await fetch(url + "pamukky");
		if (res.ok) {
			let result = await res.json();

			if (await checkServerCompatibility(result)) return true;

			console.log("Server is not supported!");
		}
	}catch (e) {
		console.log("Connection failled: " + e);
	}

	return false;
}

async function findActualServerUrl(url) {
	if (!url.endsWith("/")) url = url + "/";

	if (url.startsWith("https://") || url.startsWith("http://")) return url;

	// See well-known
	try {
		let res = await fetch("https://" + url + ".well-known/pamukky/v3");
		if (res.ok) {
			let result = await res.json();

			if (result["pamukkyv3.server"]) {
				return result["pamukkyv3.server"];
			}
		}
	}catch (e) {
		console.log("HTTPS connection failed (for well-known): " + e);
	}

	let https = await checkServer("https://" + url);

	if (https) {
		return "https://" + url;
	}

	console.log("HTTPS connection failed, trying http.");

	let http = await checkServer("http://" + url);

	if (http) {
		return "http://" + url;
	}

	return null;
}

function addHook(hooks) {
	allhooks.forEach(function (hook) {
		let index = hooks.indexOf(hook);
		if (index > -1) hooks.splice(index, 1);
	})
	hooks.forEach(function (hook) {
		allhooks.push(hook);
	})
	fetch(currentServer + "addhook", {body: JSON.stringify({'token': logininfo.token, "ids": hooks}), method: "POST"});
}

function getInfo(id, callback) {
	if (cachedinfo.hasOwnProperty(id)) { // Return the cached
		callback(cachedinfo[id]);
	}else {
		if (idcallbacks.hasOwnProperty(id)) {
			idcallbacks[id].push(callback); //Just add this in callback list
		}else { //New request
			idcallbacks[id] = [callback]; //create the array
			fetch(currentServer + "getinfo", {body: JSON.stringify({'token': logininfo.token, 'id': id}),method: 'POST'}).then((res) => {
				if (res.ok) {
					res.json().then((info) => {
						//Yay! now we attempt to parse it then callback all of them
						// Add updater hook
						if (info.hasOwnProperty("isPublic")) { //group
							addHook(["group:" + id]);
						}else {
							addHook(["user:" + id]);
						}
						cachedinfo[id] = info;
						idcallbacks[id].forEach((callback) => {
							callback(info);
						})
						delete idcallbacks[id];
					})
				}else { // non 200 response
					uidcallbacks[uid].forEach((callback) => {
						callback({
							name: "Unknown",
							picture: "",
							info: ""
						});
					})
					delete uidcallbacks[uid];
				}
			}).catch(() => { //Error in response
				idcallbacks[id].forEach((callback) => {
					callback({
						name: "Unknown",
						picture: "",
						info: ""
					});
				})
				delete idcallbacks[id];
			});
		}
	}
}

let onlinehooks = {};
let useronlinestatus = {};

function createOnlineHook(userid) {
	if (!onlinehooks.hasOwnProperty(userid)) {
		onlinehooks[userid] = [];
		addHook(["user:" + userid]);
		fetch(currentServer + "getonline", {body: JSON.stringify({'token': logininfo.token, 'uid': userid}),method: 'POST'}).then((res) => {
			if (res.ok) {
				res.text().then((text) => {
					updateOnlineHook(userid, text);
				})
			}
		});
		
	}
}

function addOnlineHook(userid, callback) {
	createOnlineHook(userid);
	if (!onlinehooks[userid].includes(callback)) onlinehooks[userid].push(callback);
	if (useronlinestatus.hasOwnProperty(userid)) {
		callback(useronlinestatus[userid]);
	}
}

function updateOnlineHook(userid, val) {
	createOnlineHook(userid);
	useronlinestatus[userid] = val;
	onlinehooks[userid].forEach(callback => {
		callback(val + "");
	});
}

const searchParams = new URLSearchParams(window.location.search); //?server=https://.....
if (searchParams.has("server")) {
	currentServer = searchParams.get("server");
}

function openConnectArea(err) {
	document.title = "Pamukky";
	document.body.innerHTML = "";
	let connectcnt = document.createElement("centeredPopup");
	let title = document.createElement("h1");
	title.innerText = getString("welcome_to_pamukky");
	connectcnt.appendChild(title);
	let infoLabel = document.createElement("label");
	infoLabel.innerText = getString("server_input_tip");
	connectcnt.appendChild(infoLabel);
	let serverInput = document.createElement("input");
	serverInput.placeholder = getString("server_input_hint");
	serverInput.style.display = "block";
	serverInput.style.width = "100%";
	serverInput.style.marginTop = "5px";
	serverInput.style.marginBottom = "5px";
	serverInput.value = currentServer;
	connectcnt.appendChild(serverInput);
	let errorLabel = document.createElement("label");
	errorLabel.classList.add("errorlabel");
	errorLabel.innerText = " ";
	connectcnt.appendChild(errorLabel);
	let connectButton = document.createElement("button")
	connectButton.innerText = getString("server_input_submit_button");
	connectButton.style.width = "100%";
	connectcnt.appendChild(connectButton);
	document.body.appendChild(connectcnt);
	addRipple(connectButton);
	
	if (err) {
		errorLabel.innerText = getString("server_connection_error");
	}
	
	connectButton.addEventListener("click",async function() {
		connectButton.disabled = true;
		errorLabel.classList.remove("errorlabel");
		errorLabel.classList.add("infolabel");
		errorLabel.innerText = getString("please_wait");;
		
		let server = await findActualServerUrl(serverInput.value);

		if (server == null) {
			connectButton.disabled = false;
			errorLabel.classList.add("errorlabel");
			errorLabel.classList.remove("infolabel");
			errorLabel.innerText = getString("server_connection_error");
			return;
		}

		let info = await getServerInfo(server);

		if (info == null) {
			connectButton.disabled = false;
			errorLabel.classList.add("errorlabel");
			errorLabel.classList.remove("infolabel");
			errorLabel.innerText = getString("server_connection_error");
			return;
		}

		currentServer = server;
		serverInfo = info;
		localStorage.setItem("server", server); // Save the server url to localStorage.
		openServerTOSArea();
	});

	serverInput.addEventListener("keydown", function(event) {
		if (event.key == "Enter") connectButton.click();
	})
}

function openServerTOSArea() {
	document.title = "Pamukky";
	document.body.innerHTML = "";
	let toscnt = document.createElement("centeredPopup");
	toscnt.style.overflow = "auto";
	let title = document.createElement("h1");
	title.innerText = getString("server_tos");
	toscnt.appendChild(title);
	let tosContents = document.createElement("pre");
	tosContents.style.wordWrap = "break-word";
	tosContents.style.whiteSpace = "pre-wrap";
	tosContents.innerText = currentServer + "tos";
	toscnt.appendChild(tosContents);

	fetch(currentServer + "tos").then((res) => {
		if (res.ok) {
			res.text().then((text) => {
				if (text == "No TOS.") openLoginArea(true);   
				tosContents.innerText = text;
			})
		}else {
			tosContents.innerText = getString("error");
		}
	}).catch(() => {
		tosContents.innerText = getString("error");
	})

	let agreeCheckboxCont = document.createElement("flex");

	let agreeCheckbox = document.createElement("input");
	agreeCheckbox.type = "checkbox";
	agreeCheckbox.id = "agree_checkbox";
	agreeCheckboxCont.appendChild(agreeCheckbox);

	let agreeCheckboxLabel = document.createElement("label");
	agreeCheckboxLabel.setAttribute("for", "agree_checkbox");
	agreeCheckboxLabel.innerText = getString("terms_agree");
	agreeCheckboxCont.appendChild(agreeCheckboxLabel);

	toscnt.appendChild(agreeCheckboxCont);

	let buttonCont = document.createElement("flex");

	let cancelButton = document.createElement("button")
	cancelButton.innerText = getString("cancel");
	cancelButton.style.width = "100%";
	addRipple(cancelButton);
	buttonCont.appendChild(cancelButton);
	toscnt.appendChild(buttonCont);

	let acceptButton = document.createElement("button")
	acceptButton.disabled = true;
	acceptButton.innerText = getString("continue");
	acceptButton.style.width = "100%";
	addRipple(acceptButton);
	buttonCont.appendChild(acceptButton);
	toscnt.appendChild(buttonCont);

	document.body.appendChild(toscnt);

	agreeCheckbox.addEventListener("input", function() {
		acceptButton.disabled = !agreeCheckbox.checked;
	})
	
	cancelButton.addEventListener("click",function() {
		openConnectArea();
	})
	acceptButton.addEventListener("click",function() {
		openLoginArea();
	})
}

function openLoginArea(notos = false) {
	document.title = "Pamukky";
	document.body.innerHTML = "";
	let logincnt = document.createElement("centeredPopup");
	let title = document.createElement("h1");
	title.innerText = getString("welcome_to_pamukky");
	logincnt.appendChild(title);
	let infoLabel = document.createElement("label");
	infoLabel.innerText = getString("login_tip");
	logincnt.appendChild(infoLabel);
	let emailLabel = document.createElement("input");
	emailLabel.placeholder = getString("login_email_hint");
	emailLabel.style.display = "block";
	emailLabel.style.width = "100%";
	emailLabel.style.marginTop = "5px";
	emailLabel.type = "email";
	emailLabel.style.marginBottom = "5px";
	logincnt.appendChild(emailLabel);
	let passwordLabel = document.createElement("input");
	passwordLabel.placeholder = getString("login_password_hint");
	passwordLabel.type = "password";
	passwordLabel.style.display = "block";
	passwordLabel.style.width = "100%";
	passwordLabel.style.marginTop = "5px";
	passwordLabel.style.marginBottom = "5px";
	logincnt.appendChild(passwordLabel);
	let errorLabel = document.createElement("label");
	errorLabel.classList.add("errorlabel");
	errorLabel.innerText = " ";
	logincnt.appendChild(errorLabel);
	let loginbutton = document.createElement("button")
	loginbutton.innerText = getString("login_login_button");
	loginbutton.style.width = "100%";
	logincnt.appendChild(loginbutton);
	document.body.appendChild(logincnt);
	let registerButton = document.createElement("button")
	registerButton.innerText = getString("login_signup_button");
	registerButton.style.width = "100%";
	logincnt.appendChild(registerButton);
	let serverTOSButton = document.createElement("button")
	serverTOSButton.innerText = getString("server_tos");
	serverTOSButton.style.width = "100%";
	if (!notos) logincnt.appendChild(serverTOSButton);
	document.body.appendChild(logincnt);
	let backToConnectButton = document.createElement("button")
	backToConnectButton.innerText = getString("login_changeserver_button");
	backToConnectButton.style.width = "100%";
	logincnt.appendChild(backToConnectButton);
	document.body.appendChild(logincnt);
	addRipple(loginbutton);
	addRipple(registerButton);
	addRipple(serverTOSButton);
	addRipple(backToConnectButton);
	
	loginbutton.addEventListener("click",function() {
		loginbutton.disabled = true;
		registerButton.disabled = true;
		
		fetch(currentServer + "login", {body: JSON.stringify({'email': emailLabel.value,'password': passwordLabel.value}),method: 'POST'}).then((res) => {
			if (res.ok) {
				res.text().then((text) => {
					logininfo = JSON.parse(text);
					localStorage.setItem("token", logininfo.token);
					openMainArea();
				})
			}else {
				res.json().then((json) => {
					errorLabel.innerText = json.description;
				});
				loginbutton.disabled = false;
				registerButton.disabled = false;
			}
		}).catch(() => {
			loginbutton.disabled = false;
			registerButton.disabled = false;
			errorLabel.innerText = getString("server_connection_error");
		})
	})
	
	registerButton.addEventListener("click",function() {
		loginbutton.disabled = true;
		registerButton.disabled = true;
		
		fetch(currentServer + "signup", {body: JSON.stringify({'email': emailLabel.value,'password': passwordLabel.value}),method: 'POST'}).then((res) => {
			if (res.ok) {
				res.text().then((text) => {
					logininfo = JSON.parse(text);
					localStorage.setItem("token", logininfo.token);
					openMainArea();
				})
			}else {
				res.json().then((json) => {
					errorLabel.innerText = json.description;
				});
				loginbutton.disabled = false;
				registerButton.disabled = false;
			}
		}).catch(() => {
			loginbutton.disabled = false;
			registerButton.disabled = false;
		})
	})

	serverTOSButton.addEventListener("click",function() {
		openServerTOSArea();
	})
	
	backToConnectButton.addEventListener("click",function() {
		openConnectArea();
	})
}

function openMainArea() {
	document.title = "Pamukky";

	let playedAudio = null;
	let playedAudioPath = null;
	let playedAudioChat = null;

	function playAudio(path, chatid = null) {
		if (playedAudio != null) {
			playedAudio.pause();
			playedAudio = null;
		}
		playedAudio = new Audio(path);
		playedAudio.play();
		playedAudio.addEventListener("ended", updateAudioBar);

		playedAudioPath = path;
		playedAudioChat = chatid;
		updateAudioBar();
	}

	try {
		Notification.requestPermission();
	}catch {}

	document.body.innerHTML = "";
	let maincont = document.createElement("main");
	let leftArea = document.createElement("leftarea");
	let leftTitleBar = document.createElement("titlebar");
	let rightArea = document.createElement("rightarea");

	function formatOnlineStatus(text) {
		if (text == undefined) return "";
		if (text == "Online") {
			return getString("user_online");
		}else {
			return getString("user_last_seen_date").replace("[DATE]", formatDate(new Date(text)));
		}
	}

	function formatDate(date) {
		let nowdate = new Date();
		let dtt = new Date(date);

		if (dtt.setHours(0,0,0,0) == nowdate.setHours(0,0,0,0)) {
			return getTimeString(date);
		}else {
			return getDayString(date) + " " + getTimeString(date);
		}
	}

	function getDayString(date) {
		return date.getFullYear() + "/" + (date.getMonth() + 1) + "/" + date.getDate();
	}

	function getTimeString(date) {
		return date.getHours().toString().padStart(2, '0') + ":" + date.getMinutes().toString().padStart(2, '0');
	}

	function formatSystemMessage(message,callback) {
		if (!message.includes("|")) {
			callback(message);
			return;
		}
		let split = message.split("|");
		if (split[0] == "PINNEDMESSAGE" || split[0] == "UNPINNEDMESSAGE" || split[0] == "EDITGROUP" || split[0] == "JOINGROUP" || split[0] == "LEFTGROUP") {
			let user = split[1];
			getInfo(user, function(info) {
				switch (split[0]) {
					case "PINNEDMESSAGE":
						callback(getString("username_pinned_a_message").replace("[NAME]", info.name));
						break;
					case "UNPINNEDMESSAGE":
						callback(getString("username_unpinned_a_message").replace("[NAME]", info.name));
						break;
					case "EDITGROUP":
						callback(getString("username_edited_group").replace("[NAME]", info.name));
						break;
					case "JOINGROUP":
						callback(getString("username_joined_group").replace("[NAME]", info.name));
						break;
					case "LEFTGROUP":
						callback(getString("username_left_group").replace("[NAME]", info.name));
						break;
					
				}
			})
		}else {
			callback("Some action was done here.");
		}
	}

	function getMessageType(msg) {
		if (msg["gFiles"] && msg["gFiles"].length > 0) {
			if (msg["gFiles"].length > 1) return "message_attachment_file_multi";
			return "message_attachment_file";
		}
		if (msg["gVideos"] && msg["gVideos"].length > 0) {
			if (msg["gVideos"].length > 1) return "message_attachment_video_multi";
			return "message_attachment_video";
		}
		if (msg["gAudio"] && msg["gAudio"].length > 0) {
			if (msg["gAudio"].length > 1) return "message_attachment_audio_multi";
			return "message_attachment_audio";
		}
		if (msg["gImages"] && msg["gImages"].length > 0) {
			if (msg["gImages"].length > 1) return "message_attachment_image_multi";
			return "message_attachment_image";
		}
		
		return "normal";
	}

	function getMessageString(msg) {
		let type = getMessageType(msg);
		let icon = {
			"message_attachment_file": "📎",
			"message_attachment_file_multi": "📎",
			"message_attachment_video": "🎞️",
			"message_attachment_video_multi": "🎞️",
			"message_attachment_audio": "🎧",
			"message_attachment_audio_multi": "🎧",
			"message_attachment_image": "🖼️",
			"message_attachment_image_multi": "🖼️",
			"normal": ""
		}[type];
		
		// "(icon) Content"
		if (msg.hasOwnProperty("content") && msg["content"].length > 0) return icon + " " + msg["content"].split("\n")[0];

		// 🖼️ Image
		return icon + " " + getString(type);
	}


	function uploadFile(file, callbacks) {
		if (typeof callbacks != "object") return;
		if (!callbacks.hasOwnProperty("done")) return;

		if (file.size > 1024*1024*serverInfo.maxFileUploadSize) {
			if (callbacks.onError) callbacks.onError();
			alert(getString("file_too_big_info").replace("[SIZE]", serverInfo.maxFileUploadSize));
			return;
		}

		var xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function() {
			if (xhr.readyState == XMLHttpRequest.DONE) {
				if (xhr.status == 200) {
					let json = JSON.parse(xhr.responseText);
					if (callbacks.preDone) callbacks.preDone(json);
					let isImage = file.type == "image/png" || 
						file.type == "image/bmp" || 
						file.type == "image/jpeg" ||
						file.type == "image/gif";
					let isVideo = file.type == "video/mpeg" ||
						file.type == "video/mp4" ||
						file.type == "video/ogv";
					
					if (isImage || isVideo) {
						// Create thumbnail and send it if file is a image
						let reader = new FileReader();
						reader.onload = function (e) { 
							let previewElem;
							let loadedevent = function() {
								const canvas = document.createElement("canvas");
								let ratio = (previewElem.videoHeight ?? previewElem.height) / (previewElem.videoWidth ?? previewElem.width);
								canvas.width = 256;
								canvas.height = Math.min(256 * ratio, 680);
								const ctx = canvas.getContext("2d");
								ctx.drawImage(previewElem, 0, 0, canvas.width, canvas.height);

								canvas.toBlob((blob) => {
									const thumb = new File([ blob ], "thumb.jpg");
									
									fetch(currentServer + "upload", {headers: {'token': logininfo.token, "type": "thumb", "id": json.id},method: 'POST',body: thumb}).then(function(response) { response.json().then(function(data) {
										if (data.status == "done") {
											callbacks.done(json);
										}
									})}).catch(function(error) {console.error(error);});
								}, "image/jpeg", 0.7);

								previewElem.remove();
							};

							if (isImage) {
								previewElem = new Image();
								previewElem.src = reader.result;
								previewElem.onload = loadedevent;
							}else if (isVideo) {
								previewElem = document.createElement("video");
								previewElem.playsInline = true;
								previewElem.muted = true;

								previewElem.onloadeddata = function() {
									loadedevent();
									previewElem.pause();
								};

								previewElem.src = reader.result;
								previewElem.play();
							}
						};

						reader.readAsDataURL(file);
					}else {
						callbacks.done(json);
					}
				} else {
					if (callbacks.onError) callbacks.onError(xhr.responseText);
				}
			}
		};

		if (callbacks.onProgress) xhr.upload.onprogress = function(event) {
			if (event.lengthComputable) {
				callbacks.onProgress((event.loaded / event.total) * 100);
			}
		}

		if (callbacks.onError) xhr.upload.onerror = function() {
			callbacks.onError();
		}

		xhr.open("POST", currentServer + "upload", true);
		xhr.setRequestHeader("token", logininfo.token);
		xhr.setRequestHeader("filename", encodeURI(file.name));
		
		xhr.send(file);
	}

	function setPublicTagDialog(id, currentvalue, callback) {
		let spl = (currentvalue ?? "").split("@");
		let tag = spl[0];
		let server = spl[1];

		if (server == undefined) {
			if (id.includes("@")) {
				server = id.split("@")[1];
			}else {
				server = currentServer;
			}
		}

		let diag = opendialog();
		diag.title.innerText = getString("set_public_tag_title");
		diag.inner.style.display = "flex";
		diag.inner.style.flexDirection = "column";
		diag.inner.style.alignItems = "center";

		let tinput = document.createElement("input");
		tinput.style.width = "100%";
		tinput.style.marginBottom = "16px";
		tinput.placeholder = "@";
		tinput.value = tag;
		tinput.maxLength = 20;
		diag.inner.appendChild(tinput);

		let tiplabel = document.createElement("label");
		tiplabel.innerText = getString("set_public_tag_hint");
		diag.inner.appendChild(tiplabel);

		let setbtn = document.createElement("button");
		setbtn.innerText = getString("action_set");
		diag.inner.appendChild(setbtn);

		setbtn.addEventListener("click", function() {
			tinput.value = tinput.value.trim();
			fetch(currentServer + "publictag", {body: JSON.stringify({'token': logininfo.token, 'tag': tinput.value, 'target': id}),method: 'POST'}).then((res) => {
				if (res.ok) {
					diag.closebtn.click();
					callback(tinput.value != "" ? (tinput.value + "@" + server) : undefined);
				}else {
					res.text().then((text) => {alert(text)})
				}
			});
			
		})
	}

	function viewInfo(id,type) {
		let diag = opendialog();
		diag.title.innerText = getString("info");
		diag.inner.style.display = "flex";
		diag.inner.style.flexDirection = "column";
		diag.inner.style.alignItems = "center";

		//Content
		let pfpimge = document.createElement("img");
		pfpimge.classList.add("circleimg");
		pfpimge.loading = "lazy";
		pfpimge.style.width = "80px";
		pfpimge.style.height = "80px";
		pfpimge.style.flexShrink = "0";
		pfpimge.classList.add("loading");
		diag.inner.appendChild(pfpimge);

		let infotxt = document.createElement("label");
		infotxt.style.margin = "6px";
		infotxt.style.fontSize = "10px";
		infotxt.innerText = "loading...";
		infotxt.classList.add("loading");
		diag.inner.appendChild(infotxt);

		let infotable = document.createElement("table");
		diag.inner.appendChild(infotable);

		if (type == "user") {
			fetch(currentServer + "getuser", {body: JSON.stringify({'token': logininfo.token, 'uid': id}),method: 'POST'}).then((res) => {
				if (res.ok) {
					res.text().then((text) => {
						let infod = JSON.parse(text);

						pfpimge.classList.remove("loading");
						pfpimge.src = getpfp(infod.picture);

						infotxt.classList.remove("loading");
						infotxt.innerText = formatOnlineStatus(infod.onlineStatus);

						addOnlineHook(id, function(online) {
							infotxt.innerText = formatOnlineStatus(online);
						});
						
						let namerow = document.createElement("tr");
						let namettl = document.createElement("td");
						namettl.innerText = getString("name");
						namettl.style.fontWeight = "bold";
						namerow.appendChild(namettl);
						let nameval = document.createElement("td");
						nameval.innerText = infod.name;
						namerow.appendChild(nameval);

						let desrow = document.createElement("tr");
						let desttl = document.createElement("td");
						desttl.style.fontWeight = "bold";
						desttl.innerText = getString("bio");
						desrow.appendChild(desttl);
						let desval = document.createElement("td");
						desval.innerText = infod.bio;
						desrow.appendChild(desval);

						infotable.appendChild(namerow);
						infotable.appendChild(desrow);
						
						if (infod.publicTag) {
							let tagrow = document.createElement("tr");
							let tagttl = document.createElement("td");
							tagttl.style.fontWeight = "bold";
							tagttl.innerText = getString("public_tag");
							tagrow.appendChild(tagttl);
							let tagval = document.createElement("td");
							tagval.innerText = infod.publicTag ?? getString("public_tag_none_hint");
							tagrow.appendChild(tagval);
							infotable.appendChild(tagrow);
						}
					})
				}else {
					diag.inner.innerText = getString("error");
				}
			}).catch(function() {
				diag.inner.innerText = getString("error");
			});
		}else {
			fetch(currentServer + "getgroup", {body: JSON.stringify({'token': logininfo.token, 'groupid': id}),method: 'POST'}).then((res) => {
				if (res.ok) {
					res.text().then((text) => {
						let infod = JSON.parse(text);
						
						let f = document.createElement('input');
						f.type='file';
						f.accept = 'image/*';
						
						let ufl = false;
						let file;
						
						pfpimge.classList.remove("loading");
						pfpimge.style.cursor = "pointer";
						pfpimge.title = getString("upload_hint");
						pfpimge.src = getpfp(infod.picture,"group.svg");
						pfpimge.addEventListener("click",function () {f.click();})
						
						infotxt.innerText = id;
						infotxt.classList.remove("loading");

						let namerow = document.createElement("tr");
						let namettl = document.createElement("td");
						namettl.innerText = getString("name");
						namerow.appendChild(namettl);
						let nameval = document.createElement("td");
						let nameinp = document.createElement("input");
						nameinp.value = infod.name;
						nameval.appendChild(nameinp);
						namerow.appendChild(nameval);
						infotable.appendChild(namerow);
						
						let desrow = document.createElement("tr");
						let desttl = document.createElement("td");
						desttl.innerText = getString("description");
						desrow.appendChild(desttl);
						let desval = document.createElement("td");
						let desinp = document.createElement("input");
						desinp.value = infod.info;
						desval.appendChild(desinp);
						desrow.appendChild(desval);
						infotable.appendChild(desrow);

						let tagrow = document.createElement("tr");
						let tagttl = document.createElement("td");
						tagttl.style.fontWeight = "bold";
						tagttl.innerText = getString("public_tag");
						tagrow.appendChild(tagttl);
						let tagval = document.createElement("td");
						tagval.innerText = infod.publicTag ?? getString("public_tag_none_hint");
						tagrow.appendChild(tagval);

						let pubrow = document.createElement("tr");
						let pubttl = document.createElement("td");
						pubttl.innerText = getString("public");
						pubrow.appendChild(pubttl);
						let pubval = document.createElement("td");
						let pubinp = document.createElement("input");
						pubinp.type = "checkbox";
						pubinp.checked = infod.isPublic;
						pubval.appendChild(pubinp);
						pubrow.appendChild(pubval);
						infotable.appendChild(pubrow);
						infotable.appendChild(tagrow);
						
						let roles = {};
						let crole = {};
						fetch(currentServer + "getgrouprole", {body: JSON.stringify({'token': logininfo.token, 'groupid': id}),method: 'POST'}).then((res) => {
							if (res.ok) {
								res.text().then((text) => {
									crole = JSON.parse(text);
									if (crole.AllowEditingSettings == true) {
										tagval.classList.add("transparentbtn");
										tagval.addEventListener("click", function() {
											setPublicTagDialog(id, infod.publicTag, function(val) {
												infod.publicTag = val;
												tagval.innerText = val ?? getString("public_tag_none_hint");
											});
										});
										let editrolesbtn = document.createElement("button");
										editrolesbtn.innerText = getString("edit_roles_group");
										editrolesbtn.addEventListener("click",function() {
											let diaga = opendialog();
											diaga.title.innerText = getString("edit_roles_group");
											diaga.inner.style.display = "flex";
											diaga.inner.style.flexDirection = "column";
											diaga.inner.style.alignItems = "center";

											let loader = document.createElement("div");
											loader.classList.add("loader");
											diaga.inner.appendChild(loader);

											fetch(currentServer + "getgrouproles", {body: JSON.stringify({'token': logininfo.token, 'groupid': id}),method: 'POST'}).then((res) => {
												if (res.ok) {
													res.text().then((text) => {
														roles = JSON.parse(text);
														rokeys = Object.keys(roles);

														loader.remove();

														rokeys.forEach(function(a) {
															let x = a;
															let role = roles[a];
															let rt = document.createElement("h4");
															rt.innerText = a;
															diaga.inner.appendChild(rt);
															let kcont = document.createElement("div");
															kcont.style.width = "100%";
															let rkeys = Object.keys(role);
															rkeys.forEach(function(aa) {
																let a = aa;
																let i = role[aa];
																if (aa != "AdminOrder") {
																	let ccont = document.createElement("div");
																	ccont.style.display = "flex";
																	let pcb = document.createElement("input");
																	pcb.type = "checkbox";
																	pcb.checked = i;
																	let pl = document.createElement("label");
																	pl.innerText = aa;
																	pl.for = pcb;
																	pcb.addEventListener("change",function() {
																		i = pcb.checked;
																		role[a] = i;
																		roles[x] = role;
																	})
																	ccont.appendChild(pcb);
																	ccont.appendChild(pl);
																	diaga.inner.appendChild(ccont);
																}
															})
															diaga.inner.appendChild(kcont);
														});
													});
												}
											});
										})
										diag.inner.appendChild(editrolesbtn);
										fetch(currentServer + "getgrouproles", {body: JSON.stringify({'token': logininfo.token, 'groupid': id}),method: 'POST'}).then((res) => {
											if (res.ok) {
												res.text().then((text) => {
													roles = JSON.parse(text);
													diag.inner.appendChild(savebtn);
												});
											}
										});
									}else {
										nameinp.readOnly = true;
										desinp.readOnly = true;
										pubinp.disabled = true;
									}
									if (crole.AdminOrder != -1) {
										diag.inner.appendChild(leavebtn);
									}
								})
							}
						});
						let membersbtn = document.createElement("button");
						membersbtn.innerText = getString("group_members");
						membersbtn.addEventListener("click",function() {
							let users = {};
							let rokeys = {};

							let diag = opendialog();
							diag.inner.style.overflow = "hidden";
							diag.inner.style.display = "flex";
							diag.inner.style.flexDirection = "column";
							diag.title.innerText = getString("group_members");

							let loader = document.createElement("div");
							loader.classList.add("loader");
							loader.style.alignSelf = "center";
							diag.inner.appendChild(loader);

							let userstable = createLazyList("div","div");
							userstable.setItemGenerator(function(ukeys,e,urow) {
								let user = users[ukeys[e]];
								if (user == undefined) return;
								urow.style.display = "flex";
								urow.style.width = "100%";
								urow.style.height = "56px";
								urow.style.padding = "8px";
								let uname = document.createElement("div");
								uname.style.display = "flex";
								uname.style.alignItems = "center";
								uname.style.width = "100%";
								let userpfp = document.createElement("img");
								userpfp.classList.add("circleimg");
								userpfp.classList.add("loading");
								userpfp.loading = "lazy";
								userpfp.style.cursor = "pointer";
								userpfp.addEventListener("click",function() {
									viewInfo(user.userID,"user");
								});
								let usernamelbl = document.createElement("label");
								usernamelbl.classList.add("loading");
								usernamelbl.innerText = "loading..."
								usernamelbl.style.marginLeft = "8px";
								usernamelbl.style.marginRight = "8px";
								uname.appendChild(userpfp);
								uname.appendChild(usernamelbl);
								getInfo(user.userID,function(uii) {
									userpfp.src = getpfp(uii.picture);
									usernamelbl.innerText = uii.name;
									userpfp.classList.remove("loading");
									usernamelbl.classList.remove("loading");
									userpfp.title = getString("view_profile_of_username").replace("[NAME]", uii.name);
								});
								urow.appendChild(uname);
								let urole = document.createElement("div");
								urole.style.minWidth = "100px";
								urole.style.display = "flex";
								urole.style.alignItems = "center";
								if (!crole.AllowEditingUsers) {
									urole.innerText = user.role;
								}else {
									let roleselect = document.createElement("select");
									roleselect.title = getString("change_role_of_member");
									roleselect.style.width = "100%";
									rokeys.forEach(function(i) {
										let opt = document.createElement("option");
										opt.value = i;
										opt.innerText = i;
										roleselect.appendChild(opt);
									})
									roleselect.value = user.role;
									roleselect.addEventListener("change",function() {
										fetch(currentServer + "editmember", {body: JSON.stringify({'token': logininfo.token, 'groupid': id, 'userid': user.userID, 'role': roleselect.value }),method: 'POST'}).then((res) => {
											if (!res.ok) {
												res.text().then((text) => {
													alert(text);
												})
											}
										})
									});
									urole.appendChild(roleselect);
								}
								urow.appendChild(urole);
								if (crole.AllowKicking || crole.AllowBanning) {
									let uacts = document.createElement("div");
									function remove() { //When user is removed
										urow.style.opacity = "0.5";
										urole.remove();
										uacts.remove();
									}
									uacts.style.width = "68px";
									uacts.style.display = "flex";
									uacts.style.flexShrink = "0";
									if (crole.AllowKicking) {
										let kickbtn = document.createElement("button");
										kickbtn.classList.add("cb");
										kickbtn.title = getString("kick_member_from_group");
										kickbtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px"><path d="M640-520v-80h240v80H640Zm-280 40q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47ZM40-160v-112q0-34 17.5-62.5T104-378q62-31 126-46.5T360-440q66 0 130 15.5T616-378q29 15 46.5 43.5T680-272v112H40Zm80-80h480v-32q0-11-5.5-20T580-306q-54-27-109-40.5T360-360q-56 0-111 13.5T140-306q-9 5-14.5 14t-5.5 20v32Zm240-320q33 0 56.5-23.5T440-640q0-33-23.5-56.5T360-720q-33 0-56.5 23.5T280-640q0 33 23.5 56.5T360-560Zm0-80Zm0 400Z"/></svg>';
										kickbtn.addEventListener("click",function() {
											if (confirm(getString("kick_member_from_group_confirm"))) {
												fetch(currentServer + "kickmember", {body: JSON.stringify({'token': logininfo.token, 'groupid': id, 'userid': user.userID}),method: 'POST'}).then((res) => {
													if (res.ok) {
														remove();
													}
												})
											}
										})
										uacts.appendChild(kickbtn);
									}
									if (crole.AllowBanning) {
										let banbtn = document.createElement("button");
										banbtn.classList.add("cb");
										banbtn.title = getString("ban_member_from_group");
										banbtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="M480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q54 0 104-17.5t92-50.5L228-676q-33 42-50.5 92T160-480q0 134 93 227t227 93Zm252-124q33-42 50.5-92T800-480q0-134-93-227t-227-93q-54 0-104 17.5T284-732l448 448Z"/></svg>';
										banbtn.addEventListener("click",function() {
											if (confirm(getString("ban_member_from_group_confirm"))) {
												fetch(currentServer + "banmember", {body: JSON.stringify({'token': logininfo.token, 'groupid': id, 'userid': user.userID}),method: 'POST'}).then((res) => {
													if (res.ok) {
														remove();
													}
												})
											}
										})
										uacts.appendChild(banbtn);
									}
									urow.appendChild(uacts);
								}
							});
							userstable.setGetSize(function(list,idx) {return 56});
							diag.inner.appendChild(userstable.element);
							fetch(currentServer + "getgrouproles", {body: JSON.stringify({'token': logininfo.token, 'groupid': id}),method: 'POST'}).then((res) => {
								if (res.ok) {
									res.text().then((text) => {
										roles = JSON.parse(text);
										rokeys = Object.keys(roles);
										fetch(currentServer + "getgroupmembers", {body: JSON.stringify({'token': logininfo.token, 'groupid': id}),method: 'POST'}).then((res) => {
											if (res.ok) {
												res.text().then((text) => {
													users = JSON.parse(text);
													let ukeys = Object.keys(users);
													let cuser = users[logininfo.userID];
													if (cuser) {
														crole = roles[cuser.role];
													}
													loader.remove();
													userstable.setList(ukeys);
												});
											}
										});
									});
								}
							});
						})
						diag.inner.appendChild(membersbtn);

						let bannedusersbtn = document.createElement("button");
						bannedusersbtn.innerText = getString("banned_members");
						bannedusersbtn.addEventListener("click",function() {
							let users = {};
							let rokeys = {};
							let diag = opendialog();
							diag.inner.style.overflow = "hidden";
							diag.inner.style.display = "flex";
							diag.inner.style.flexDirection = "column";
							diag.title.innerText = getString("banned_members");

							let loader = document.createElement("div");
							loader.classList.add("loader");
							loader.style.alignSelf = "center";
							diag.inner.appendChild(loader);

							let userstable = createLazyList("div","div");
							userstable.element.style.height = "100%";
							userstable.setItemGenerator(function(ukeys,e,urow) {
								let user = ukeys[e];
								if (user == undefined) return;
								urow.style.display = "flex";
								urow.style.width = "100%";
								urow.style.height = "56px";
								urow.style.padding = "8px";
								let uname = document.createElement("div");
								uname.style.display = "flex";
								uname.style.alignItems = "center";
								uname.style.width = "100%";
								let userpfp = document.createElement("img");
								userpfp.classList.add("circleimg");
								userpfp.classList.add("loading");
								userpfp.loading = "lazy";
								userpfp.style.cursor = "pointer";
								userpfp.addEventListener("click",function() {
									viewInfo(user,"user");
								});
								let usernamelbl = document.createElement("label");
								usernamelbl.classList.add("loading");
								usernamelbl.innerText = "loading..."
								usernamelbl.style.marginLeft = "8px";
								usernamelbl.style.marginRight = "8px";
								uname.appendChild(userpfp);
								uname.appendChild(usernamelbl);
								getInfo(user,function(uii) {
									userpfp.src = getpfp(uii.picture);
									usernamelbl.innerText = uii.name;
									userpfp.classList.remove("loading");
									usernamelbl.classList.remove("loading");
									userpfp.title = getString("view_profile_of_username").replace("[NAME]", uii.name);
								});
								urow.appendChild(uname);
								if (crole.AllowBanning) {
									let uacts = document.createElement("div");
									function remove() { //When user is removed
										urow.style.opacity = "0.5";
										uacts.remove();
									}
									uacts.style.width = "34px";
									uacts.style.display = "flex";
									uacts.style.flexShrink = "0";
									let unbanbtn = document.createElement("button");
									unbanbtn.classList.add("cb");
									unbanbtn.title = getString("unban_member");
									unbanbtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z"/></svg>';
									unbanbtn.addEventListener("click",function() {
										if (confirm(getString("unban_member_from_group_confirm"))) {
											fetch(currentServer + "unbanmember", {body: JSON.stringify({'token': logininfo.token, 'groupid': id, 'userid': user}),method: 'POST'}).then((res) => {
												if (res.ok) {
													remove();
												}else {

												}
											})
										}
									})
									uacts.appendChild(unbanbtn);
									urow.appendChild(uacts);
								}
							});
							userstable.setGetSize(function(list,idx) {return 56});
							diag.inner.appendChild(userstable.element);
							fetch(currentServer + "getbannedgroupmembers", {body: JSON.stringify({'token': logininfo.token, 'groupid': id}),method: 'POST'}).then((res) => {
								if (res.ok) {
									res.text().then((text) => {
										let users = JSON.parse(text);
										userstable.setList(users);
										loader.remove();
									});
								}
							});
						})
						diag.inner.appendChild(bannedusersbtn);

						
						let savebtn = document.createElement("button");
						savebtn.innerText = getString("save_group");
						savebtn.addEventListener("click",function() {
							if (ufl) {
								uploadFile(file, {
									done: function(data) {
										fetch(currentServer + "editgroup", {body: JSON.stringify({'token': logininfo.token, 'groupid': id, 'name': nameinp.value, 'picture': data.url, 'info': desinp.value, 'roles': roles, 'ispublic': pubinp.checked }),method: 'POST'}).then((res) => {})
									}
								})
							}else {
								fetch(currentServer + "editgroup", {body: JSON.stringify({'token': logininfo.token, 'groupid': id, 'name': nameinp.value, 'picture': infod.picture, 'info': desinp.value, 'roles': roles, 'ispublic': pubinp.checked }),method: 'POST'}).then((res) => {})
							}
						})

						let leavebtn = document.createElement("button");
						leavebtn.innerText = getString("leave_group");
						leavebtn.addEventListener("click",function() {
							if (confirm(getString("leave_group_confirm"))) {
								fetch(currentServer + "leavegroup", {body: JSON.stringify({'token': logininfo.token, 'groupid': id }),method: 'POST'}).then((res) => {
									if (res.ok) {
										diag.closebtn.click();
									}else {

									}
								})
							}
						})

						
						f.onchange = function() {
							if (f.files && f.files[0]) {
			
								let reader = new FileReader();
								reader.onload = function (e) { 
									pfpimge.setAttribute("src",reader.result);
									file = f.files[0];
									ufl = true;
								};

								reader.readAsDataURL(f.files[0]); 
							}
						}
					})
				}else {
					diag.inner.innerText = getString("error");
				}
			}).catch(function() {
				diag.inner.innerText = getString("error");
			});
		}
	}

	let activePopupCount = 0;

	function inertMainUI() {
		Array.prototype.forEach.call(maincont.children, function(child) {
			child.inert = activePopupCount > 0;
		});
	}
	
	function opendialog() {
		activePopupCount++;
		inertMainUI();

		let bgcover = document.createElement("div");
		bgcover.classList.add("bgcover");
		bgcover.style.alignItems = "center";
		bgcover.style.justifyContent = "center";
		bgcover.addEventListener("pointerdown",function(e) {
			if (e.target == bgcover) closebtn.click();
		})
		
		let dialoginside = document.createElement("centeredPopup");
		dialoginside.tabIndex = "0";
		dialoginside.style.display = "flex";
		dialoginside.style.flexDirection = "column";
		dialoginside.style.padding = "8px 0 0 0";
		dialoginside.style.background = "var(--main-bg)";
		let title = document.createElement("div");
		title.style.display = "flex";
		title.style.alignItems = "center";
		title.style.flexShrink = "0";
		title.style.padding = "0px 16px 4px 16px";

		let titlelbl = document.createElement("label");
		titlelbl.innerText = "Dialog";
		titlelbl.style.marginRight = "auto";
		
		let closed = false;

		let closebtn = document.createElement("button");
		addRipple(closebtn);
		closebtn.classList.add("cb", "small");
		closebtn.title = getString("navigation_close");
		closebtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 -960 960 960" width="20"><path d="m291-240-51-51 189-189-189-189 51-51 189 189 189-189 51 51-189 189 189 189-51 51-189-189-189 189Z"/></svg>';
		closebtn.addEventListener("click",function(e) {
			if (closed) return;
			closed = true;

			if (!isatdock) activePopupCount--;
			inertMainUI();

			dialoginside.classList.add("closing");
			dialoginside.inert = true;
			bgcover.classList.add("closing");
			setTimeout(function() {
				if (isatdock) {
					maincont.removeChild(dialoginside);
				}else {
					document.body.removeChild(bgcover);
				}
			}, 500);
		})
		dialoginside.addEventListener("keydown",function(e) {
			if (e.key == "Escape") {
				closebtn.click();
			}
			//console.log(e.key)
		})
		let isatdock = false;
		
		let dockbtn = document.createElement("button");
		addRipple(dockbtn);
		dockbtn.classList.add("cb", "small");
		dockbtn.title = getString("dialog_dock_to_right");
		dockbtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 -960 960 960" width="20"><path d="M216-144q-29.7 0-50.85-21.15Q144-186.3 144-216v-168h72v168h528v-528H216v168h-72v-168q0-29.7 21.15-50.85Q186.3-816 216-816h528q29.7 0 50.85 21.15Q816-773.7 816-744v528q0 29.7-21.15 50.85Q773.7-144 744-144H216Zm216-144-51-51 105-105H144v-72h342L381-621l51-51 192 192-192 192Z"/></svg>';
		dockbtn.addEventListener("click",function(e) {
			if (isatdock == true) {
				document.body.appendChild(bgcover);
				bgcover.appendChild(dialoginside);
				dialoginside.classList.remove("docked");

				activePopupCount++;
				inertMainUI();
			}else {
				document.body.removeChild(bgcover);
				bgcover.removeChild(dialoginside);
				maincont.appendChild(dialoginside);
				dialoginside.classList.add("docked");

				activePopupCount--;
				inertMainUI();
			}
			isatdock = !isatdock;
		})
		
		title.appendChild(titlelbl);
		if (document.body.clientWidth > 1200) {title.appendChild(dockbtn)};
		title.appendChild(closebtn);
		dialoginside.appendChild(title);

		let starty = 0;
		let touchy = 0;
		title.addEventListener("touchstart", function(e) {
			starty = e.touches[0].clientY;
		});

		title.addEventListener("touchmove", function(e) {
			touchy = e.touches[0].clientY;
			dialoginside.style.transform = "translateY(" + Math.max(touchy - starty, 0) + "px)";
		});

		title.addEventListener("touchcancel", function(e) {
			dialoginside.style.transform = "";
		});

		title.addEventListener("touchend", function(e) {
			if (touchy - starty > 100) {
				dialoginside.classList.add("slideclosing");
				closebtn.click();
			}else {
				dialoginside.style.transform = "";
			}
		});


		let innercont = document.createElement("div");
		innercont.style.background = "var(--container-background)";
		innercont.style.overflow = "auto";
		innercont.style.minWidth = "100%";
		innercont.style.flexGrow = "1";
		innercont.style.borderRadius = "16px";
		innercont.style.padding = "16px";
		dialoginside.appendChild(innercont);
		
		bgcover.appendChild(dialoginside);
		
		document.body.appendChild(bgcover);

		dialoginside.focus();
		
		return {
			bgcover: bgcover,
			dialog:dialoginside,
			title: titlelbl,
			inner:innercont,
			closebtn:closebtn
		}
	}

	function createPopupContainer(posRef) {
		activePopupCount++;
		inertMainUI();
		
		let popupcontainer = document.createElement("div");
		popupcontainer.classList.add("popup");
		popupcontainer.tabIndex = "0";

		let rect = posRef ? posRef.getBoundingClientRect() : {width: 1, height: 1, top: lastPointerPosition.y, left: lastPointerPosition.x,  right: lastPointerPosition.x + 1, bottom: lastPointerPosition.y + 1};
		popupcontainer.style.top = rect.top + rect.height + "px";
		popupcontainer.style.left = rect.left + "px";
		
		let closed = false;
		function close() {
			if (closed) return;
			closed = true;

			activePopupCount--;
			inertMainUI();

			//popupmenu.style.maxHeight = "0px";
			popupcontainer.style.opacity = "";
			
			maincont.removeEventListener("pointerdown", close);

			setTimeout(function() {
				popupcontainer.remove();
			},200)
		}

		popupcontainer["close"] = close;

		document.body.appendChild(popupcontainer);
		requestAnimationFrame(function() {
			let popuprect = popupcontainer.getBoundingClientRect();
			if (popuprect.width + popuprect.left > document.body.clientWidth) {
				popupcontainer.style.left = "";
				if (document.body.clientWidth - (document.body.clientWidth - rect.left) - popuprect.width > 0) {
					popupcontainer.style.right = (document.body.clientWidth - rect.right) + "px";
				}else {
					popupcontainer.style.right = "0px";
				}
			}
			if (popuprect.height + popuprect.top > document.body.clientHeight) {
				popupcontainer.style.top = "";
				if (document.body.clientHeight - (document.body.clientHeight - rect.top) - popuprect.height > 0) {
					popupcontainer.style.bottom = (document.body.clientHeight - rect.top) + "px";
				}else {
					popupcontainer.style.bottom = "0px";
				}
			}
			popupcontainer.style.opacity = "1";
			//popupmenu.style.maxHeight = "calc(100% - " + popupmenu.style.top + ")";
		});
		maincont.addEventListener("pointerdown", close);
		popupcontainer.addEventListener("keydown",function(e) {
			if (e.key == "Escape") close();
		})

		popupcontainer.focus();

		return popupcontainer;
	}

	function openPopupMenu(posRef) {
		let popupmenu = createPopupContainer(posRef);
		popupmenu.classList.add("popupmenu");

		return popupmenu;
	}

	function showMenu(menuitems, element) {
		let popupmenu = openPopupMenu(element);

		menuitems.forEach(function(item) {
			let menuitem = document.createElement("button");
			let menuitemicon = document.createElement("div");
			let menuitemlabel = document.createElement("label");
			menuitem.appendChild(menuitemicon);
			menuitem.appendChild(menuitemlabel);
			menuitemlabel.innerText = item.content;
			if (item.icon) {
				menuitemicon.innerHTML = item.icon;
			}
			addRipple(menuitem);
			popupmenu.appendChild(menuitem);

			menuitem.addEventListener("click",function() {
				popupmenu.close();
				item.callback();
			})
		});
		
		addKeyboardListSelectionSupport(popupmenu);
	}

	function openEmojiMenu(element, buttonclickfn, persistent = false) {
		let popupmenu = openPopupMenu(element);

		let searchInput = document.createElement("input");
		searchInput.placeholder = "Search for emojis...";
		popupmenu.appendChild(searchInput);

		let emojiList = document.createElement("div");
		emojiList.classList.add("emojilist");
		popupmenu.appendChild(emojiList);

		let emojibtns = {};

		getEmojis(function(emojis) {
			emojis.forEach(function(emoji, index) {
				let emojiunc = "";
				let name = emoji["name"];
				
				emoji["unicode"].forEach(function(u) {
					emojiunc += unicodeToString(u)
				})

				let button = document.createElement("button");
				button.innerText = emojiunc;
				button.title = name;
				emojibtns[name + "|" + index] = button;
				emojiList.appendChild(button);

				button.addEventListener("click", function() {
					if (!persistent) popupmenu.close();
					buttonclickfn(emojiunc);
				})
			})
		});

		searchInput.addEventListener("input", function() {
			let query = searchInput.value;
			Object.keys(emojibtns).forEach(function(key) {
				let button = emojibtns[key];
				button.style.display = key.split("|")[0].includes(query) ? "" : "none";
			})
		})

		if (!isTouch) searchInput.focus();
	}

	let emojiCache;

	// Thanks to https://github.com/cheatsnake/emojihub
	function getEmojis(fn) {
		if (emojiCache) {
			fn(emojiCache);
			return;
		}
		fetch("https://emojihub.yurace.pro/api/all").then((res) => {
			if (res.ok) {
				res.json().then((json) => {
					emojiCache = json;
					fn(json);
				})
			}
		});
		
	}

	// https://stackoverflow.com/a/34278578
	function typeInTextarea(newText, el = document.activeElement) {
		const start = el.selectionStart
		const end = el.selectionEnd
		const text = el.value
		const before = text.substring(0, start)
		const after  = text.substring(end, text.length)
		el.value = (before + newText + after)
		el.selectionStart = el.selectionEnd = start + newText.length
		el.focus()
	}

	function unicodeToString(unicode) {
		return String.fromCodePoint(parseInt(unicode.split("+")[1], 16))
	}
	
	let currentchatview;
	let readnotifications = [];
	let mutedchats = [];
	let servermutedchats = [];
	let ttimer = setInterval(function() {
		if (logininfo == undefined || logininfo == null) {
			clearTimeout(ttimer);
			return;
		}
		if (document.hasFocus()) {
			fetch(currentServer + "setonline", {body: JSON.stringify({'token': logininfo.token}),method: 'POST'}).then((res) => {
				if (!res.ok) {
					openLoginArea();
					clearTimeout(ttimer);
					return;
				}
			});
		}
	},8000)

	function notificationCheck() {
		fetch(currentServer + "getnotifications", {body: JSON.stringify({'token': logininfo.token, "mode": "hold"}),method: 'POST'}).then((res) => {
			if (res.ok) {
				res.json().then((nots) => {
					notificationCheck();
					let list = Object.keys(nots);
					list.forEach(function(i) {
						if (!readnotifications.includes(i)) {
							let notif = nots[i];
							if ((document.hasFocus() == false || currentchatid != notif.chatid) && !mutedchats.includes(notif.chatid)) {
								let content = notif.content;
								if (notif.userid == "0") {
									formatSystemMessage(content, function(text) {
										content = text;
										send();
									})
								}else {
									send();
								}
								function send() {
									Notification.requestPermission();
									var notification = new Notification(notif.user.name + ' - Pamukky', { body: content, icon: getpfp(notif.user.picture) });
									var audio = new Audio('notif.mp3');
									audio.play();
									notification.addEventListener('click', (event) => {
										openchat(notif.chatid)
									});
								}
							}
							readnotifications.push(i);
						}
					})
				});
			}
				
		}).catch(function() {
			setTimeout(function() {
				notificationCheck();
			}, 3000);
		});
	}

	function getUpdates() {
			fetch(currentServer + "getupdates", {body: JSON.stringify({'token': logininfo.token}), method: "POST"}).then((res) => {
			if (res.ok) {
				res.json().then((json) => {
					getUpdates();
					Object.keys(json).forEach(function(key) {
						let type = key.split(":")[0];
						switch(type) {
							case "chat":
								let chatid = key.substring(key.indexOf(":") + 1);
								if (currentchatid == chatid) {
									currentchatview.applyChatUpdates(json[key]);
								}
								break;
							case "user":
								let uid = key.substring(key.indexOf(":") + 1);
								let uval = json[key];
								if (uval.hasOwnProperty("online") && uval["online"] != null) {
									updateOnlineHook(uid, uval["online"]);
								}
								if (uval.hasOwnProperty("profileUpdate") && uval["profileUpdate"] != null) {
									cachedinfo[uid] = uval["profileUpdate"];
								}
								break;
							case "group":
								let gid = key.substring(key.indexOf(":") + 1);
								let gval = json[key];
								if (gval.hasOwnProperty("edit") && gval["edit"] != null) {
									cachedinfo[gid] = gval["edit"];
								}
								break;
							case "chatslist":
								Object.keys(json[key]).forEach(function(ikey) {
									let value = json[key][ikey];
									if (value == "DELETED") {
										let indexToRemove = null;
										chats.forEach(function(i,d) {
											let id = i["chatid"] ?? i.group;
											if (id == ikey) {
												indexToRemove = d;
											}
										})
										if (indexToRemove != null) {
											chats.splice(indexToRemove, 1);
										}
									}else {
										chats.push(value);
									}

									chatslist.setList([{}, ...chats, {}]);
								});
								break;
						}
					});
				});
			}
		}).catch(function() {
			setTimeout(function() {
				getUpdates();
			}, 3000);
		});
	}

	let audioBar = document.createElement("div");
	audioBar.classList.add("mediabar");

	let audioPlayPause = document.createElement("button");
	audioPlayPause.addEventListener("click",function() {
		if (playedAudio == null) return;
		if (playedAudio.paused) {
			playedAudio.play();
		}else {
			playedAudio.pause();
		}
		updateAudioBar();
	})
	audioBar.appendChild(audioPlayPause);

	let audioTitle = document.createElement("label");
	audioBar.appendChild(audioTitle);

	function updateAudioBar() {
		if (playedAudio == null) {
			audioBar.style.display = "none";
			audioTitle.innerText = "";
			audioPlayPause.innerHTML = "";
		}else {
			audioBar.style.display = "";
			if (playedAudio.paused) {
				audioPlayPause.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px"><path d="M336-282.24v-395.52Q336-694 346.93-704t25.5-10q4.55 0 9.56 1.5 5.01 1.5 9.69 4.37L697-510q8 5.32 12.5 13.31 4.5 7.98 4.5 16.85 0 8.87-4.5 16.86Q705-455 697-450L391.67-251.75q-4.68 2.88-9.84 4.31Q376.68-246 372-246q-14.4 0-25.2-10-10.8-10-10.8-26.24Z"/></svg>';
			}else {
				audioPlayPause.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px"><path d="M636-228q-29.7 0-50.85-21.15Q564-270.3 564-300v-360q0-29.7 21.15-50.85Q606.3-732 636-732h24q29.7 0 50.85 21.15Q732-689.7 732-660v360q0 29.7-21.15 50.85Q689.7-228 660-228h-24Zm-336 0q-29.7 0-50.85-21.15Q228-270.3 228-300v-360q0-29.7 21.15-50.85Q270.3-732 300-732h24q29.7 0 50.85 21.15Q396-689.7 396-660v360q0 29.7-21.15 50.85Q353.7-228 324-228h-24Z"/></svg>';
			}
		}
	}

	updateAudioBar();

	let chatslist = createLazyList();
	chatslist.element.addEventListener("scroll", function() {
		if (audioBar.style.display == "none") {
			leftTitleBar.classList.toggle("shadow", chatslist.element.scrollTop > 0);
		}else {
			audioBar.classList.toggle("shadow", chatslist.element.scrollTop > 0);
			leftTitleBar.classList.remove("shadow");
		}
	});

	let currentchatid = 0;
	function openchat(chatid) {
		let infoid = "0";
		let type;
		if (chatid.includes("-")) {
			let spl = chatid.split("-");
			if (spl[0] != logininfo.userID) {
				infoid = spl[0];
			}else {
				infoid = spl[1];
			}
			type = "user";
		}else {
			infoid = chatid;
			type = "group";
		}

		location.href = "#chat:" + chatid;

		if (currentchatview) {
			currentchatview.kill();
			rightArea.removeChild(currentchatview.chat);
		}
		currentchatview = createChatView(chatid, infoid);
		currentchatid = chatid;
		//callback for get*info
		currentchatview.titlelabel.classList.add("loading");
		currentchatview.titlelabel.innerText = "loading...";
		currentchatview.pfp.classList.add("loading");
		getInfo(infoid, function callback(cinfo) {
			document.title = "Pamukky - " + cinfo.name;
			currentchatview.titlelabel.innerText = cinfo.name;
			currentchatview.pfp.src = getpfp(cinfo.picture, type == "user" ? "person.svg" : "group.svg");
			currentchatview.titlelabel.classList.remove("loading");
			currentchatview.pfp.classList.remove("loading");
		});

		rightArea.appendChild(currentchatview.chat)
		if (document.body.clientWidth <= 800) {
			rightArea.style.display = "flex";
			currentchatview.backbutton.style.display = ""
			currentchatview.backbutton.onclick = function() {
				rightArea.style.transform = "";
				leftArea.style.display = "";
				currentchatid = "";
				location.href = "#mainarea";
				document.title = "Pamukky";
				requestAnimationFrame(function() {leftArea.style.opacity = "1";})
				if (document.body.clientWidth <= 800) {
					setTimeout(function() {
						rightArea.style.display = "none";
						leftArea.style.display = "";
						currentchatview.chat.innerHTML = "";
					},500)
				}else {
					currentchatview.backbutton.style.display = "none";
				}
			}
			requestAnimationFrame(function() {
				setTimeout(function() {
					rightArea.style.transform = "translateX(0%)";
					leftArea.style.opacity = "0";
					setTimeout(function() {
						leftArea.style.display = "none";
					},500)
				},100)
			})
		}else {
			currentchatview.backbutton.style.display = "none"
			rightArea.style.display = "";
			leftArea.style.display = "";
		}
		chatslist.updateItem();
	}

	function hashchange(url) {
		if (url.includes("#")) {
			let hash = url.split("#")[1];
			if (hash.startsWith("chat:")) {
				let chat = hash.substring(hash.indexOf(":") + 1)
				if (chat != currentchatid) {
					openchat(chat);
				}
			}else if (hash == "mainarea") {
				if (currentchatview) {
					currentchatview.backbutton.click();
				}
			}
		}
	}

	window.addEventListener("hashchange", function(e) {
		hashchange(e.newURL);
	});
	hashchange(location.href);

	function chatsListItemGenerator(item, itmcont) {
		let id = item["chatid"] ?? item.group;
		itmcont.classList.add("chatitem");
		addRipple(itmcont);
		let pfpimg = document.createElement("img")
		pfpimg.loading = "lazy";
		pfpimg.classList.add("loading");
		itmcont.appendChild(pfpimg);
		let infocnt = document.createElement("infoarea");
		let namecont = document.createElement("titlecont");
		let nameh4 = document.createElement("h4");
		nameh4.innerText = "Loading...";
		nameh4.classList.add("loading");
		namecont.appendChild(nameh4)
		let lmt = document.createElement("time");
		lmt.innerText = "Loading..."
		lmt.classList.add("loading");
		//}catch {}
		namecont.appendChild(lmt);
		infocnt.appendChild(namecont);
		let lastmsgcontent = document.createElement("label");
		lastmsgcontent.innerText = "Loading..."
		lastmsgcontent.classList.add("loading");

		infocnt.appendChild(lastmsgcontent)
		itmcont.appendChild(infocnt);

		fetch(currentServer + "getmessages", {body: JSON.stringify({'token': logininfo.token, 'chatid': id, 'prefix': "#0"}),method: 'POST'}).then(function(response) { response.json().then(function(data) {
			if (data["status"]) {
				console.log(data);
			}else {
				let msg = Object.values(data)[0];
				if (msg) {
					let dt = new Date(msg.sendTime);
					lmt.innerText = formatDate(dt);

					lastmsgcontent.innerText = "User: " + msg.content.split("\n")[0];
					if (msg.senderUID == "0") {
						formatSystemMessage(msg.content, function(text) {
							lastmsgcontent.innerText = text;
							lastmsgcontent.classList.remove("loading");
						});
					}else {
						getInfo(msg.senderUID, function(sender) {
							lastmsgcontent.innerText = sender.name + ": " + getMessageString(msg);
							lastmsgcontent.classList.remove("loading");
						});
					}
				}else {
					lastmsgcontent.innerText = getString("chat_no_messages_tip");
					lmt.style.display = "none";
					lastmsgcontent.classList.remove("loading");
				}
			}
			lmt.classList.remove("loading");
		})}).catch(function(error) {console.error(error);});

		getInfo(item.type == "user" ? item.user : item.group, function(info) {
			pfpimg.src = getpfp(info.picture, item.type == "user" ? "person.svg" : "group.svg");
			nameh4.innerText = info.name;
			nameh4.classList.remove("loading");
			pfpimg.classList.remove("loading");
		});
	}

	chatslist.element.classList.add("clist");
	chatslist.setGetSize(function(list,index) {
		if (index == 0) {
			return 32;
		}
		return 60;
	});
	chatslist.setItemGenerator(function(list,index,element) {
		if (index == 0) { // Refresh button
			let rfb = document.createElement("button");
			rfb.addEventListener("click",function() {
				loadchats();
			})
			element.addEventListener("focus",function() {
				rfb.focus();
			})
			rfb.innerText = getString("refresh");
			element.appendChild(rfb);
			return;
		}
		if (index == list.length - 1) { // Add a new chat tip "label", actually a button
			let fabhint = document.createElement("button");
			fabhint.classList.add("buttonlabel");
			fabhint.style.display = "block";
			fabhint.style.margin = "8px";
			fabhint.style.marginTop = "48px";
			fabhint.innerText = getString("addchat_fab_tip");
			element.addEventListener("click",function() {
				fab.click();
			})
			element.addEventListener("focus",function() {
				fabhint.focus();
			})
			element.appendChild(fabhint);
			return;
		}

		let item = list[index];
		if (item == undefined) return;

		let itmbtn = document.createElement("button");
		element.appendChild(itmbtn);

		let id = item["chatid"] ?? item.group;
		chatsListItemGenerator(item, itmbtn);

		element.addEventListener("focus",function() {
			itmbtn.focus();
		})

		itmbtn.addEventListener("click",function() {
			openchat(id);
		})
	});

	chatslist.setItemUpdater(function(list,index,element) {
		let itmcont = element.children[0];
		if (itmcont == undefined) return;
		if (itmcont.classList.contains("chatitem")) {
			let item = list[index];
			if (item == undefined) return;
			let id = item["chatid"] ?? item.group;
			itmcont.classList.toggle("active", document.body.clientWidth > 800 && currentchatid == id);
		}
	});
	/*let clbtm = document.createElement("div");
	clbtm.style.height = "24px";
	chatslist.appendChild(clbtm);*/
	//chatslist.style.paddingBottom = "24px";
	let fab = document.createElement("button");
	fab.classList.add("fab");
	fab.title = getString("add_chat");
	fab.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" height="40" viewBox="0 -960 960 960" width="40"><path d="M446.667-446.667H200v-66.666h246.667V-760h66.666v246.667H760v66.666H513.333V-200h-66.666v-246.667Z"/></svg>';
	leftArea.appendChild(fab);

	let profilebtn = document.createElement("button");
	profilebtn.title = getString("edit_profile");
	profilebtn.style.height = "100%";
	profilebtn.classList.add("transparentbtn")
	profilebtn.style.display = "flex";
	profilebtn.style.alignItems = "center";
	addRipple(profilebtn);

	let pfpimg = document.createElement("img");
	pfpimg.classList.add("circleimg")
	profilebtn.appendChild(pfpimg);
	let namelbl = document.createElement("label");
	namelbl.style.cursor = "pointer";
	namelbl.style.margin = "8px";
	profilebtn.appendChild(namelbl);
	
	fab.addEventListener("click",function() {
		let diag = opendialog();
		diag.title.innerText = getString("add_chat");
		diag.inner.style.display = "flex";
		diag.inner.style.flexDirection = "column";
		diag.inner.style.alignItems = "center";
		
		let tinput = document.createElement("input");
		tinput.style.width = "100%";
		tinput.style.marginBottom = "16px";
		tinput.placeholder = getString("enter_email_or_id_hint");
		diag.inner.appendChild(tinput);
		
		let bflex = document.createElement("div");
		bflex.style.display = "flex";
		diag.inner.appendChild(bflex);
		
		let adduserchatbtn = document.createElement("button");
		adduserchatbtn.innerText = getString("add_user_chat");
		adduserchatbtn.addEventListener("click",function() {
			fetch(currentServer + "adduserchat", {body: JSON.stringify({'token': logininfo.token,'email': tinput.value}),method: 'POST'}).then((res) => {
				if (res.ok) {
					diag.closebtn.click();
				}
			})
		})
		bflex.appendChild(adduserchatbtn);
		
		let creategroupbtn = document.createElement("button");
		creategroupbtn.innerText = getString("create_group");
		creategroupbtn.addEventListener("click",function() {
			let f = document.createElement('input');
			f.type='file';
			f.accept = 'image/*';
			
			let ufl = false;
			let file;
			
			let diaga = opendialog();
			diaga.title.innerText = getString("create_group");
			diaga.inner.style.display = "flex";
			diaga.inner.style.flexDirection = "column";
			diaga.inner.style.alignItems = "center";
			
			let pfpimge = document.createElement("img");
			pfpimge.classList.add("circleimg");
			pfpimge.style.width = "80px";
			pfpimge.style.height = "80px";
			pfpimge.style.cursor = "pointer";
			pfpimge.title = getString("upload_hint");
			//pfpimge.src = currentuser.picture.replace(/%SERVER%/g,currserver);
			pfpimge.addEventListener("click",function () {f.click();})
			diaga.inner.appendChild(pfpimge);
			
			let infotable = document.createElement("table");
			
			let namerow = document.createElement("tr");
			let namettl = document.createElement("td");
			namettl.innerText = getString("name");
			namerow.appendChild(namettl);
			let nameval = document.createElement("td");
			let nameinp = document.createElement("input");
			nameinp.value = getString("new_group_sample_name");
			nameval.appendChild(nameinp);
			namerow.appendChild(nameval);
			infotable.appendChild(namerow);
			
			let desrow = document.createElement("tr");
			let desttl = document.createElement("td");
			desttl.innerText = getString("description");
			desrow.appendChild(desttl);
			let desval = document.createElement("td");
			let desinp = document.createElement("input");
			desinp.value = getString("new_group_sample_description");
			desval.appendChild(desinp);
			desrow.appendChild(desval);
			infotable.appendChild(desrow);
			diaga.inner.appendChild(infotable);
			
			let bflex = document.createElement("div");
			bflex.style.display = "flex";
			diaga.inner.appendChild(bflex);
			
			let createbtn = document.createElement("button");
			createbtn.innerText = getString("create_group");
			createbtn.addEventListener("click",function() {
				if (ufl) {
					uploadFile(file, {
						done: function(data) {
							fetch(currentServer + "creategroup", {body: JSON.stringify({'token': logininfo.token, 'name': nameinp.value, 'picture': data.url, 'info': desinp.value }),method: 'POST'}).then((res) => {
								diag.closebtn.click();
								diaga.closebtn.click();
							})
						}
					});
				}else {
					fetch(currentServer + "creategroup", {body: JSON.stringify({'token': logininfo.token, 'name': nameinp.value, 'picture': "", 'info': desinp.value }),method: 'POST'}).then((res) => {
						diag.closebtn.click();
						diaga.closebtn.click();
					})
				}
			})
			bflex.appendChild(createbtn);
			
			f.onchange = function() {
				if (f.files && f.files[0]) {

					let reader = new FileReader();
					reader.onload = function (e) { 
						pfpimge.setAttribute("src",reader.result);
						file = f.files[0];
						ufl = true;
					};

					reader.readAsDataURL(f.files[0]); 
				}
			}
		})
		bflex.appendChild(creategroupbtn);
		
		let joingroupbtn = document.createElement("button");
		joingroupbtn.innerText = getString("join_group");
		joingroupbtn.addEventListener("click",function() {
			fetch(currentServer + "joingroup", {body: JSON.stringify({'token': logininfo.token,'groupid': tinput.value}),method: 'POST'}).then((res) => {
				if (res.ok) {
					diag.closebtn.click();
				}else {
					alert(getString("join_group_error"));
				}
			})
		})
		bflex.appendChild(joingroupbtn);
	})
	profilebtn.addEventListener("click",function() {
		let f = document.createElement('input');
		f.type='file';
		f.accept = 'image/*';
		
		let ufl = false;
		let file;
		
		let diag = opendialog();
		diag.title.innerText = getString("edit_profile");
		diag.inner.style.display = "flex";
		diag.inner.style.flexDirection = "column";
		diag.inner.style.alignItems = "center";
		
		
		let pfpimge = document.createElement("img");
		pfpimge.classList.add("circleimg");
		pfpimge.style.width = "80px";
		pfpimge.style.height = "80px";
		pfpimge.style.cursor = "pointer";
		pfpimge.title = getString("upload_hint");
		pfpimge.src = getpfp(currentuser.picture);
		pfpimge.addEventListener("click",function () {f.click();})
		diag.inner.appendChild(pfpimge);
		
		let infotable = document.createElement("table");
		let namerow = document.createElement("tr");
		let namettl = document.createElement("td");
		namettl.innerText = getString("name");
		namerow.appendChild(namettl);
		let nameval = document.createElement("td");
		let nameinp = document.createElement("input");
		nameinp.value = currentuser.name;
		nameval.appendChild(nameinp);
		namerow.appendChild(nameval);
		
		let desrow = document.createElement("tr");
		let desttl = document.createElement("td");
		desttl.innerText = getString("bio");
		desrow.appendChild(desttl);
		let desval = document.createElement("td");
		let desinp = document.createElement("input");
		desinp.value = currentuser.bio;
		desval.appendChild(desinp);
		desrow.appendChild(desval);

		let tagrow = document.createElement("tr");
		let tagttl = document.createElement("td");
		tagttl.style.fontWeight = "bold";
		tagttl.innerText = getString("public_tag");
		tagrow.appendChild(tagttl);
		let tagval = document.createElement("td");
		tagval.classList.add("transparentbtn");
		tagval.addEventListener("click", function() {
			setPublicTagDialog(logininfo.userID, currentuser.publicTag, function(val) {
				currentuser.publicTag = val;
				tagval.innerText = val ?? getString("public_tag_none_hint");
			});
		})
		tagval.innerText = currentuser.publicTag ?? getString("public_tag_none_hint");
		tagrow.appendChild(tagval);
		
		infotable.appendChild(namerow);
		infotable.appendChild(desrow);
		infotable.appendChild(tagrow);
		diag.inner.appendChild(infotable);
		
		let cpass = document.createElement("button");
		cpass.innerText = getString("change_password");
		cpass.addEventListener("click",function() {
			let diag = opendialog();
			diag.title.innerText = getString("change_password");
			diag.inner.style.display = "flex";
			diag.inner.style.flexDirection = "column";
			diag.inner.style.alignItems = "center";
			let cpasstable = document.createElement("table");

			let emailp = document.createElement("tr");
			let eprt = document.createElement("td");
			eprt.innerText = getString("email");
			emailp.appendChild(eprt);
			let ev = document.createElement("td");
			let einp = document.createElement("input");
			einp.type = "email";
			ev.appendChild(einp);
			emailp.appendChild(ev);

			let opr = document.createElement("tr");
			let pprt = document.createElement("td");
			pprt.innerText = getString("old_password");
			opr.appendChild(pprt);
			let oprv = document.createElement("td");
			let oprinp = document.createElement("input");
			oprinp.type = "password";
			oprv.appendChild(oprinp);
			opr.appendChild(oprv);
			
			let npr = document.createElement("tr");
			let npt = document.createElement("td");
			npt.innerText = getString("new_password");
			npr.appendChild(npt);
			let nprv = document.createElement("td");
			let nprinp = document.createElement("input");
			nprinp.type = "password";
			nprv.appendChild(nprinp);
			npr.appendChild(nprv);
			
			let npc = document.createElement("tr");
			let npcc = document.createElement("td");
			npcc.innerText = getString("password_repeat");
			npc.appendChild(npcc);
			let nprc = document.createElement("td");
			let npcinp = document.createElement("input");
			npcinp.type = "password";
			nprc.appendChild(npcinp);
			npc.appendChild(nprc);
			
			cpasstable.appendChild(emailp);
			cpasstable.appendChild(opr);
			cpasstable.appendChild(npr);
			cpasstable.appendChild(npc);
			diag.inner.appendChild(cpasstable);
			
			let changebtn = document.createElement("button");
			changebtn.innerText = getString("change_password");
			changebtn.addEventListener("click",function() {
				if (npcinp.value != nprinp.value) {
					alert(getString("changepassword_nomatch"));
					return;
				}
				fetch(currentServer + "changepassword", {body: JSON.stringify({'token': logininfo.token, 'email': einp.value, 'oldpassword': oprinp.value, 'password': nprinp.value  }),method: 'POST'}).then((res) => {
					res.text().then((text) => {
						
						info = JSON.parse(text);
						if (info["status"] == "error") {
							alert(text);
							return;
						}
						//logininfo = info;
						alert(getString("changepassword_done"));
					})
				})
			});
			diag.inner.appendChild(changebtn);
		})
		diag.inner.appendChild(cpass);
		
		let savebtn = document.createElement("button");
		savebtn.innerText = getString("save_profile");
		savebtn.addEventListener("click",function() {
			if (ufl) {
				uploadFile(file, {
					done: function(data) {
						ufl = false;
						currentuser.picture = data.url;
						fetch(currentServer + "editprofile", {body: JSON.stringify({'token': logininfo.token, 'name': nameinp.value, 'picture': currentuser.picture, 'bio': desinp.value }),method: 'POST'}).then((res) => {
							if (res.ok) {
								namelbl.innerText = nameinp.value;
								pfpimg.src = getpfp(currentuser.picture);
								currentuser.name = nameinp.value;
								currentuser.bio = desinp.value;
							}
						})
					}
				});
			}else {
				fetch(currentServer + "editprofile", {body: JSON.stringify({'token': logininfo.token, 'name': nameinp.value, 'picture': currentuser.picture, 'bio': desinp.value  }),method: 'POST'}).then((res) => {
					if (res.ok) {
						namelbl.innerText = nameinp.value;
						currentuser.name = nameinp.value;
						currentuser.bio = desinp.value;
					}
				})
			}
		})
		
		diag.inner.appendChild(savebtn);
		
		
		let lout = document.createElement("button");
		lout.innerText = getString("logout");
		lout.addEventListener("click",function() {
			if (!confirm(getString("logout_confirm"))) return;
			fetch(currentServer + "logout", {body: JSON.stringify({'token': logininfo.token}),method: 'POST'}).then((res) => {
				// Ignore errors, the token would be invalid then.
				localStorage.removeItem("token");
				location.reload();
			}).catch(function() {
				// Ignore errors, we can't connect to server anyway
				localStorage.removeItem("token");
				location.reload();
			});
		})
		diag.inner.appendChild(lout);
		
		f.onchange = function() {
			if (f.files && f.files[0]) {

				let reader = new FileReader();
				reader.onload = function (e) {
					let cic = document.createElement("div");
					cic.style.width = "256px";
					cic.style.height = "256px";
					cic.style.overflow = "hidden";
					cic.style.position = "relative";
					let ci = document.createElement("img");
					ci.setAttribute("src",reader.result);
					ci.onload = function() {
						//if (ci.naturalWidth < 256 && ci.naturalHeight < 256) {
							file = f.files[0];
							ufl = true;
							pfpimge.setAttribute("src",reader.result);
							return;
						/*}
						alert("Sorry! cropping is TODO, please upload a picture that is smaller than 256x256")
						return;
						ci.style.position = "absolute";
						let cdiag = opendialog();
						cdiag.title.innerText = "Crop";
						cdiag.inner.style.display = "flex";
						cdiag.inner.style.flexDirection = "column";
						cdiag.inner.style.alignItems = "center";
						ci.ondragstart = function() { return false; };
						let dragging = false;
						let lastx = 0;
						let lasty = 0;
						let ix = 0;
						let iy = 0;
						function updatepos() {
							if (ix > 0) {
								ix = 0;
							}
							if (iy > 0) {
								iy = 0;
							}
							if (ix < -(ci.naturalWidth - 256)) {
								ix = -(ci.naturalWidth - 256);
							}
							if (iy < -(ci.naturalHeight - 256)) {
								iy = -(ci.naturalHeight - 256);
							}
							ci.style.top = iy + "px";
							ci.style.left = ix + "px";
						}
						cic.addEventListener("pointerdown", (e) => {dragging = true;lastx = e.clientX;lasty = e.clientY;});
						document.body.addEventListener("pointerup", (e) => {dragging = false});
						document.body.addEventListener("pointermove", (e) => {
							if (dragging) {
								ix += e.clientX - lastx;
								iy += e.clientY - lasty;
								updatepos();
							}
							lastx = e.clientX;lasty = e.clientY;
							e.preventDefault();
							
						});
						cic.appendChild(ci);
						cdiag.inner.appendChild(cic);
						let cbtn = document.createElement("button");
						cbtn.innerText = "Crop";
						cbtn.addEventListener("click",function() {
							let canvas = document.createElement("canvas");
							canvas.width = 256;
							canvas.height = 256;
							const ctx = canvas.getContext("2d");
							ctx.drawImage(ci, ix, iy); 
							
							diag.closebtn.click();	
						})
						cdiag.inner.appendChild(cbtn);*/
					}
					
					
				};

				reader.readAsDataURL(f.files[0]); 
			}
		}
	});
	function loadchats() {
		fetch(currentServer + "getchatslist", {body: JSON.stringify({'token': logininfo.token}),method: 'POST'}).then((res) => {
			if (res.ok) {
				res.text().then((text) => {
					chats = JSON.parse(text);
					chatslist.setList([{}, ...chats, {}]);
				})
			}
		})
	}
	
	leftTitleBar.appendChild(profilebtn);
	leftArea.appendChild(leftTitleBar);
	leftArea.appendChild(audioBar);
	leftArea.appendChild(chatslist.element);
	maincont.appendChild(leftArea);
	maincont.appendChild(rightArea);
	
	document.body.appendChild(maincont);

	fetch(currentServer + "setonline", {body: JSON.stringify({'token': logininfo.token}),method: 'POST'}).then((res) => {
		if (!res.ok) {
			openLoginArea();
			clearTimeout(ttimer);
			return;
		}
		loadchats();
		getUpdates();
		getInfo(logininfo.userID, (info) => {
			namelbl.innerText = info.name;
			pfpimg.src = getpfp(info.picture);
			currentuser = info;
		})
		fetch(currentServer + "getmutedchats", {body: JSON.stringify({'token': logininfo.token}),method: 'POST'}).then((res) => { //Get server-side muted chats.
			if (res.ok) {
				res.text().then((text) => {
					servermutedchats = JSON.parse(text);
				});
			}
		})
		mutedchats = JSON.parse(localStorage.getItem("mutedchats") ?? "[]");
		notificationCheck();
		addHook(["chatslist"]);
	})


	function createChatView(chatid,ugid) {
		let isKilled = false;
		function kill() {
			isKilled = true;
		}

		let f = document.createElement('input');
		f.type='file';
		f.multiple = true;
		
		let typingUsers = [];
		let fileslist = [];
		let isuserchat = chatid.includes("-");
		let pinnedmessages = {};
		let mainChatArea = document.createElement("mchat");
		let titlebar = document.createElement("titlebar");
		let backbtn = document.createElement("button");
		addRipple(backbtn);
		backbtn.title = getString("navigation_back");
		backbtn.classList.add("cb")
		backbtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px"><path d="M640-80 240-480l400-400 71 71-329 329 329 329-71 71Z"/></svg>';
		backbtn.style.display = "none";
		titlebar.appendChild(backbtn);

		let pfpimg = document.createElement("img");
		pfpimg.classList.add("circleimg")
		titlebar.appendChild(pfpimg);

		let titletxt = document.createElement("h4");
		titletxt.style.marginLeft = "4px";
		titletxt.style.overflow = "hidden";
		titletxt.style.whiteSpace = "nowrap";
		titletxt.style.textOverflow = "ellipsis";
		titlebar.appendChild(titletxt);

		let infotxt = document.createElement("label");
		infotxt.style.fontSize = "10px";
		infotxt.style.margin = "6px";
		infotxt.style.whiteSpace = "nowrap";
		infotxt.innerText = "loading";
		infotxt.classList.add("loading");
		titlebar.appendChild(infotxt);
		titlebar.appendChild(document.createElement("ma"));
		
		let infobtn = document.createElement("button");
		addRipple(infobtn);
		infobtn.title = getString("info");
		infobtn.classList.add("cb")
		infobtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px"><path d="M440-280h80v-240h-80v240Zm40-320q17 0 28.5-11.5T520-640q0-17-11.5-28.5T480-680q-17 0-28.5 11.5T440-640q0 17 11.5 28.5T480-600Zm0 520q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"/></svg>';
		infobtn.addEventListener("click",function() {
			viewInfo(ugid,isuserchat ? "user" : "group")
		})
		
		titlebar.appendChild(infobtn);
		let optionsbtn = document.createElement("button");
		addRipple(optionsbtn);
		optionsbtn.title = getString("popupmenu_hint");
		optionsbtn.classList.add("cb")
		optionsbtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px"><path d="M480-160q-33 0-56.5-23.5T400-240q0-33 23.5-56.5T480-320q33 0 56.5 23.5T560-240q0 33-23.5 56.5T480-160Zm0-240q-33 0-56.5-23.5T400-480q0-33 23.5-56.5T480-560q33 0 56.5 23.5T560-480q0 33-23.5 56.5T480-400Zm0-240q-33 0-56.5-23.5T400-720q0-33 23.5-56.5T480-800q33 0 56.5 23.5T560-720q0 33-23.5 56.5T480-640Z"/></svg>';
		optionsbtn.addEventListener("click",function(e) {
			showMenu([{
				content: getString("mute"),
				icon: '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px"><path d="M160-200v-80h80v-280q0-83 50-147.5T420-792v-28q0-25 17.5-42.5T480-880q25 0 42.5 17.5T540-820v28q80 20 130 84.5T720-560v280h80v80H160Zm320-300Zm0 420q-33 0-56.5-23.5T400-160h160q0 33-23.5 56.5T480-80ZM320-280h320v-280q0-66-47-113t-113-47q-66 0-113 47t-47 113v280Z"/></svg>',
				callback: function() {
					showMenu([
						{
							content: mutedchats.includes(chatid) ? getString("chat_unmute_client") : getString("chat_mute_client"),
							icon: mutedchats.includes(chatid) ? '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px"><path d="M160-200v-80h80v-280q0-33 8.5-65t25.5-61l60 60q-7 16-10.5 32.5T320-560v280h248L56-792l56-56 736 736-56 56-146-144H160Zm560-154-80-80v-126q0-66-47-113t-113-47q-26 0-50 8t-44 24l-58-58q20-16 43-28t49-18v-28q0-25 17.5-42.5T480-880q25 0 42.5 17.5T540-820v28q80 20 130 84.5T720-560v206Zm-276-50Zm36 324q-33 0-56.5-23.5T400-160h160q0 33-23.5 56.5T480-80Zm33-481Z"/></svg>' : '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px"><path d="M160-200v-80h80v-280q0-83 50-147.5T420-792v-28q0-25 17.5-42.5T480-880q25 0 42.5 17.5T540-820v28q80 20 130 84.5T720-560v280h80v80H160Zm320-300Zm0 420q-33 0-56.5-23.5T400-160h160q0 33-23.5 56.5T480-80ZM320-280h320v-280q0-66-47-113t-113-47q-66 0-113 47t-47 113v280Z"/></svg>',
							callback: function() {
								let index = mutedchats.indexOf(chatid);
								if (index > -1) {
									mutedchats.splice(index, 1);
								}else {
									mutedchats.push(chatid);
								}
								localStorage.setItem("mutedchats", JSON.stringify(mutedchats));
							}
						}, {
							content: servermutedchats.hasOwnProperty(chatid) ? getString("chat_unmute_account") : getString("chat_mute_account"),
							icon: servermutedchats.hasOwnProperty(chatid) ? '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px"><path d="M160-200v-80h80v-280q0-33 8.5-65t25.5-61l60 60q-7 16-10.5 32.5T320-560v280h248L56-792l56-56 736 736-56 56-146-144H160Zm560-154-80-80v-126q0-66-47-113t-113-47q-26 0-50 8t-44 24l-58-58q20-16 43-28t49-18v-28q0-25 17.5-42.5T480-880q25 0 42.5 17.5T540-820v28q80 20 130 84.5T720-560v206Zm-276-50Zm36 324q-33 0-56.5-23.5T400-160h160q0 33-23.5 56.5T480-80Zm33-481Z"/></svg>' : '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px"><path d="M160-200v-80h80v-280q0-83 50-147.5T420-792v-28q0-25 17.5-42.5T480-880q25 0 42.5 17.5T540-820v28q80 20 130 84.5T720-560v280h80v80H160Zm320-300Zm0 420q-33 0-56.5-23.5T400-160h160q0 33-23.5 56.5T480-80ZM320-280h320v-280q0-66-47-113t-113-47q-66 0-113 47t-47 113v280Z"/></svg>',
							callback: function() {
								fetch(currentServer + "mutechat", {body: JSON.stringify({'token': logininfo.token, 'chatid': chatid, 'state': servermutedchats.hasOwnProperty(chatid) ? "unmuted" : "tagsOnly"}),method: 'POST'}).then((res) => {
									if (res.ok) {
										if (servermutedchats.hasOwnProperty(chatid)) {
											delete servermutedchats[chatid];
										}else {
											servermutedchats[chatid] = {allowTags: true};
										}
									}
								})
							}
						}
					], optionsbtn);
				}
			}], optionsbtn);
		})
		
		titlebar.appendChild(optionsbtn);
		mainChatArea.appendChild(titlebar);

		let messagesCont = document.createElement("div");
		messagesCont.classList.add("messagescont");

		let messageslistCont = document.createElement("div");
		messageslistCont.classList.add("messagescont");
		let messageslist = createDynamicList("messageslist","msgcont");
		messageslist.setDirection(-1);

		let scrollFab = document.createElement("button");
		scrollFab.classList.add("fab", "secondary");
		scrollFab.title = getString("chat_scroll_to_bottom_fab_hint");
		scrollFab.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px"><path d="M480-344 240-584l56-56 184 184 184-184 56 56-240 240Z"/></svg>';
		scrollFab.style.display = "none";
		messageslistCont.appendChild(scrollFab);

		scrollFab.addEventListener("click", function() {
			showmessage(lastmessageid, false);
		});

		messageslist.setScrollHook(function(top, lastscrollpos, pos) {
			scrollFab.style.display = pos != 1 ? "" : "none";
			messageBar.classList.toggle("shadow", pos != 1);
			if (pinnedbar.style.display == "none") {
				titlebar.classList.toggle("shadow", pos != -1);
			}else {
				pinnedbar.classList.toggle("shadow", pos != -1);
				titlebar.classList.remove("shadow");
			}
		});

		let pinnedmessageslist = createDynamicList("messageslist","msgcont");
		pinnedmessageslist.element.style.display = "none";
		pinnedmessageslist.element.classList.add("pinned");

		let pinnedbar = document.createElement("pinbar");
		pinnedbar.style.display = "none";
		let mpint = document.createElement("button");
		mpint.classList.add("replycont");
		mpint.style.height = "58px";
		addRipple(mpint);
		pinnedbar.appendChild(mpint);
		mpint.addEventListener("click",function() {
			let k = Object.keys(pinnedmessages);
			if (pinnedmessageslist.element.style.display == "") {
				pinsbtn.click();
			}
			showmessage(k[k.length - 1]);
		});
		let pinsbtn = document.createElement("button");
		pinsbtn.title = getString("pinned_messages");
		addRipple(pinsbtn);
		pinsbtn.classList.add("cb")
		pinsbtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="#000000"><path d="M624-744v264l85 85q5 5 8 11.5t3 14.5v20.81q0 15.38-10.35 25.79Q699.3-312 684-312H516v222q0 15.3-10.29 25.65Q495.42-54 480.21-54T454.5-64.35Q444-74.7 444-90v-222H276q-15.3 0-25.65-10.4Q240-332.81 240-348.19V-369q0-8 3-14.5t8-11.5l85-85v-264h-12q-15.3 0-25.65-10.29Q288-764.58 288-779.79t10.35-25.71Q308.7-816 324-816h312q15.3 0 25.65 10.29Q672-795.42 672-780.21t-10.35 25.71Q651.3-744 636-744h-12Z"/></svg>';
		pinnedbar.appendChild(pinsbtn);
		mainChatArea.appendChild(pinnedbar);


		pinsbtn.addEventListener("click",function() {
			if (pinnedmessageslist.element.style.display == "none") {
				pinnedmessageslist.element.style.display = "";
				messageBar.classList.add("collapsed");
			}else {
				pinnedmessageslist.element.style.display = "none";
				messageBar.classList.remove("collapsed");
			}
		});

		let pinsender = document.createElement("b");
		let pincontent = document.createElement("label");
		mpint.appendChild(pinsender);
		mpint.appendChild(pincontent);
		function updatepinnedbar() {
			let k = Object.keys(pinnedmessages);
			if (k.length > 0) {
				pinnedbar.style.display = "";
				let msg = pinnedmessages[k[k.length - 1]];
				if (msg.senderUID == "0") {
					pincontent.innerText = "Pamuk is here!";
					formatSystemMessage(msg.content, function(text) {
						pincontent.innerText = text;
					})
				}else {
					pincontent.innerText = getMessageString(msg);
				}
				pinsender.classList.add("loading");
				pinsender.innerText = "loading...";
				getInfo(msg.senderUID,function(info) {
					pinsender.classList.remove("loading");
					pinsender.innerText = info.name;
				})
			}else {
				pinnedbar.style.display = "none";
				if (pinnedmessageslist.element.style.display == "") {
					pinsbtn.click();
				}
			}
		}
		messageslistCont.appendChild(messageslist.element);
		messagesCont.appendChild(messageslistCont);
		messagesCont.appendChild(pinnedmessageslist.element);
		mainChatArea.appendChild(messagesCont);

		
		let messageBar = document.createElement("msgbar");
		let currentReplyContainer = document.createElement("button");
		currentReplyContainer.classList.add("replycont");
		currentReplyContainer.style.display = "none";
		addRipple(currentReplyContainer);
		currentReplyContainer.addEventListener("click",function() {
			currentReplyContainer.style.display = "none";
			let id = replymsgid;
			replymsgid = undefined;
			updateMessage(id);
		})
		let currentReplyUsername = document.createElement("b");
		
		currentReplyContainer.appendChild(currentReplyUsername);
		let currentReplyContent = document.createElement("label");
		
		currentReplyContainer.appendChild(currentReplyContent);
		messageBar.appendChild(currentReplyContainer);
		
		function addAttachment(file) {
			if (file.size > 1024*1024*serverInfo.maxFileUploadSize) {
				alert(getString("file_too_big_info").replace("[SIZE]", serverInfo.maxFileUploadSize));
				return;
			}

			let itemElement = document.createElement("uploaditm");
			let imageArea = document.createElement("div");
			imageArea.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" height="40px" viewBox="0 -960 960 960" width="40px"><path d="M186.67-813.33V-536.67v-2.66V-146.67v-666.66 190.66-190.66Zm92.66 400h161q11.67-19 26.17-35.67 14.5-16.67 31.83-31h-219v66.67Zm0 166.66h123q-2.33-16.66-2-33.33.34-16.67 2.67-33.33H279.33v66.66ZM186.67-80q-27 0-46.84-19.83Q120-119.67 120-146.67v-666.66q0-27 19.83-46.84Q159.67-880 186.67-880H534l226 226v134q-15.67-6.67-32.33-10.67-16.67-4-34.34-6v-86H500.67v-190.66h-314v666.66h249q11 19 24.5 35.67t29.5 31h-303Zm476.66-392.67q81.34 0 138.67 57.33 57.33 57.33 57.33 138.67 0 81.34-57.33 138.67-57.33 57.33-138.67 57.33-81.34 0-138.67-57.33-57.33-57.33-57.33-138.67 0-81.34 57.33-138.67 57.33-57.33 138.67-57.33Zm.74 318.67q11.6 0 19.43-7.91 7.83-7.9 7.83-19.5 0-11.59-7.9-19.42-7.91-7.84-19.5-7.84-11.6 0-19.43 7.91-7.83 7.9-7.83 19.5 0 11.59 7.9 19.43 7.91 7.83 19.5 7.83Zm-19.4-80h38.66v-10.63q0-11.7 6.34-21.2 6.33-9.5 14.81-17.77 14.85-12.4 23.85-24.4 9-12 9-32 0-30.81-20.53-49.41Q696.27-408 663.85-408q-24.85 0-45.02 14.17-20.16 14.16-28.16 38.82L625.33-340q2.34-13.33 13.17-22.67 10.83-9.33 25.8-9.33 16.03 0 25.2 8 9.17 8 9.17 24 0 11-6.67 19.17-6.67 8.16-14.67 16.16-7.33 6.67-14.5 13.34-7.16 6.66-12.16 14.66-3.67 6.67-4.84 12.87-1.16 6.2-1.16 14.47V-234Z"/></svg>';
			let rembtn = document.createElement("button")
			rembtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="#000000"><path d="m291-240-51-51 189-189-189-189 51-51 189 189 189-189 51 51-189 189 189 189-51 51-189-189-189 189Z"/></svg>';
			itemElement.appendChild(imageArea);
			itemElement.appendChild(rembtn);
			attachmentsContainer.appendChild(itemElement);

			fileslist.push(file);

			onMessageInput();

			rembtn.addEventListener("click",function() {
				const index = fileslist.indexOf(file);
				if (index > -1) {
					fileslist.splice(index, 1);
					onMessageInput();
				}
				itemElement.remove();
			})
			
			if (file.type == "image/png" || 
						file.type == "image/bmp" || 
						file.type == "image/jpeg" ||
						file.type == "image/gif") {
				let reader = new FileReader();
				reader.onload = function (e) { 
					let imgs = new Image();
					imgs.src = reader.result;
					imgs.style.background = "white";
					imgs.classList.add("msgimg");
					imgs.onload = function() {
						imgs.addEventListener("click", function() {
							imageView(imgs.src);
						});
						imageArea.innerHTML = "";
						imageArea.appendChild(imgs);
					}
				};
				reader.readAsDataURL(file); 
			}
		}
		
		let attachmentsContainer = document.createElement("attachmentscont");
		messageBar.appendChild(attachmentsContainer);
		f.onchange = function() {
			if (f.files) {
				Array.prototype.forEach.call(f.files, addAttachment)
			}
		}
		
		mainChatArea.addEventListener('dragover', (e) => {
			e.preventDefault()
		});
		mainChatArea.addEventListener('drop', (e) => {
			Array.prototype.forEach.call(e.dataTransfer.files, addAttachment);
			e.preventDefault()
		});
		
		mainChatArea.addEventListener("paste", async e => {
			
			if (!e.clipboardData.files.length) {
				return;
			}
			if (e.clipboardData.files.length > 0) {
				e.preventDefault();
			}
			
			Array.prototype.forEach.call(e.clipboardData.files,function(i) {
				addAttachment(i);
			});
		});
		
		let mgbd = document.createElement("div");
		let attachbtn = document.createElement("button");
		attachbtn.addEventListener("click", function() {f.click();})
		addRipple(attachbtn);
		attachbtn.title = getString("add_attachment");
		attachbtn.classList.add("cb")
		attachbtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24"><path d="M640-520v-200h80v200h-80ZM440-244q-35-10-57.5-39T360-350v-370h80v476Zm30 164q-104 0-177-73t-73-177v-370q0-75 52.5-127.5T400-880q75 0 127.5 52.5T580-700v300h-80v-300q-1-42-29.5-71T400-800q-42 0-71 29t-29 71v370q-1 71 49 120.5T470-160q25 0 47.5-6.5T560-186v89q-21 8-43.5 12.5T470-80Zm170-40v-120H520v-80h120v-120h80v120h120v80H720v120h-80Z"/></svg>';
		mgbd.appendChild(attachbtn)
		let msginput = document.createElement("textarea");
		msginput.style.height = "40px";
		mgbd.appendChild(msginput)

		let emojibtn = document.createElement("button");
		addRipple(emojibtn);
		emojibtn.classList.add("cb");
		emojibtn.title = "Emoji";
		emojibtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px"><path d="M480-480Zm0 400q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q43 0 83 8.5t77 24.5v90q-35-20-75.5-31.5T480-800q-133 0-226.5 93.5T160-480q0 133 93.5 226.5T480-160q133 0 226.5-93.5T800-480q0-32-6.5-62T776-600h86q9 29 13.5 58.5T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm320-600v-80h-80v-80h80v-80h80v80h80v80h-80v80h-80ZM620-520q25 0 42.5-17.5T680-580q0-25-17.5-42.5T620-640q-25 0-42.5 17.5T560-580q0 25 17.5 42.5T620-520Zm-280 0q25 0 42.5-17.5T400-580q0-25-17.5-42.5T340-640q-25 0-42.5 17.5T280-580q0 25 17.5 42.5T340-520Zm140 260q68 0 123.5-38.5T684-400H276q25 63 80.5 101.5T480-260Z"/></svg>';
		mgbd.appendChild(emojibtn);
		emojibtn.addEventListener("click", function() {
			openEmojiMenu(emojibtn, function(emoji) {
				typeInTextarea(emoji, msginput);
				onMessageInput();
			}, true);
		})
		
		let sendbtn = document.createElement("button");
		addRipple(sendbtn);
		sendbtn.classList.add("cb");
		sendbtn.title = getString("send_message");
		sendbtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24"><path d="M120-160v-640l760 320-760 320Zm80-120 474-200-474-200v140l240 60-240 60v140Zm0 0v-400 400Z"/></svg>';
		mgbd.appendChild(sendbtn)
		
		messageBar.appendChild(mgbd);

		let typinglabel = document.createElement("label");
		typinglabel.classList.add("typinglabel");
		typinglabel.innerText = getString("nobody_typing");
		typinglabel.style.opacity = "0";
		messageBar.appendChild(typinglabel);

		mainChatArea.appendChild(messageBar)
		
		let chatpage;
		let selectedMessages = [];
		let sendedmessages = [];
		let crole = {"AdminOrder":0,"AllowMessageDeleting":true,"AllowEditingSettings":true,"AllowKicking":true,"AllowBanning":true,"AllowSending":true,"AllowEditingUsers":true,"AllowSendingReactions":true,"AllowPinningMessages":true};
		let replymsgid = undefined;
		
		if (!isuserchat) {
			fetch(currentServer + "getgrouprole", {body: JSON.stringify({'token': logininfo.token, 'groupid': ugid}),method: 'POST'}).then((res) => {
				if (res.ok) {
					res.text().then((text) => {
						crole = JSON.parse(text);
						if (crole.AllowSending == true) {

						}else {
							if (crole.AdminOrder == -1) {
								mgbd.innerHTML = "";
								let joinbtn = document.createElement("button");
								joinbtn.innerText = getString("join_group");
								joinbtn.style.width = "100%";
								joinbtn.style.height = "100%";
								joinbtn.style.borderRadius = "0px";
								joinbtn.classList.add("transparentbtn");
								addRipple(joinbtn,"rgba(255,200,0,0.6)",true);
								mgbd.appendChild(joinbtn);
								joinbtn.addEventListener("click",function() {
									joinbtn.disabled = true;
									fetch(currentServer + "joingroup", {body: JSON.stringify({'token': logininfo.token,'groupid': ugid}),method: 'POST'}).then((res) => {
										if (res.ok) {
											openchat(chatid);
										}else {
											alert(getString("join_group_error"));
										}
									});
								})
							}else {
								mgbd.style.display = "none";
							}
						}
					})
				}
			});
			fetch(currentServer + "getgroupmemberscount", {body: JSON.stringify({'token': logininfo.token, 'groupid': ugid}),method: 'POST'}).then((res) => {
				if (res.ok) {
					res.text().then((text) => {
						infotxt.classList.remove("loading");
						infotxt.innerText = getString("group_members_count", "count", text);
					})
				}
			});
		}

		let timemsgid = 0;
		let messagescount = 0;
		let addLoadOlderMessages = true;
		let lastmessageid = "";
		function addmsg(msg,id,order = 1) {
			if (messageslist.getItemData(id)) return;
			if (msg.type != "time") {
				if (order == 1) {
					lastmessageid = id;
				}
				let dt = new Date(msg.sendTime);
				let list = messageslist.getList();
				let lastmsg = list[order == 1 ? list.length - 1 : 0];
				let lastmsgtime;
				if (lastmsg) {
					lastmsgtime = new Date(lastmsg.data.sendTime);
				}else {
					lastmsgtime = new Date(0);
				}
				if (dt.setHours(0,0,0,0) != lastmsgtime.setHours(0,0,0,0)) {
					addmsg({
						senderUID: "0",
						content: getDayString(dt),
						sendTime: dt,
						loadOlder: addLoadOlderMessages,
						type: "time"
					},timemsgid,order)
					timemsgid++;
					addLoadOlderMessages = false;
				}

				if (id > timemsgid) {
					messagescount++;
				}
			}

			messageslist.addItem(id,{
				size: (msg.senderUID == logininfo.userID) ? 61 : (msg.senderUID == 0) ? 34 : 68,
				data: msg,
				generator: function(data, element, id, list) {
					createmsg(data,id,element);
					if (data.loadOlder) {
						getoldermessages("#" + messagescount + "-#" + (messagescount + 48), undefined, id);
					}
				},
				updater: chatmsgupdater
			}, order);
		}

		function addpinnedmsg(key, msg) {
			pinnedmessageslist.addItem(key,{
				size: (msg.senderUID == logininfo.userID) ? 61 : (msg.senderUID == 0) ? 34 : 68,
				data: msg,
				generator: function(data, element, id, list) {
					createmsg(data, key, element, {pinnedmessageslist: true})
				},
				updater: chatmsgupdater
			});
		}

		function chatmsgupdater(data, element, id, list) {
			let selectid = element.querySelector(".selectid");
			if (selectid) {
				if (selectedMessages.includes(id)) {
					element.classList.add("selected");
					selectid.innerText = selectedMessages.indexOf(id) + 1;
				}else {
					element.classList.remove("selected");
					selectid.innerText = "";
				}
			}

			element.classList.toggle("hint", replymsgid == id)

			let listdata = list.getList();
			if (listdata) {
				let thisMessageIndex = list.getListElementIndex(id);
				let isLastMessageBySender = true;
				let isFirstMessageBySender = false;
				if (thisMessageIndex > -1 && thisMessageIndex + 1 < listdata.length) {
					let nextMessage = listdata[thisMessageIndex + 1];
					if (nextMessage)
					if (nextMessage.data.senderUID == data.senderUID) isLastMessageBySender = false;
				}
				if (thisMessageIndex > -1 && thisMessageIndex - 1 >= 0) {
					let prevMessage = listdata[thisMessageIndex - 1];
					if (prevMessage)
					if (prevMessage.data.senderUID != data.senderUID) isFirstMessageBySender = true;
				}

				let sendername = element.querySelector("msgsender");
				if (sendername) {
					if (isFirstMessageBySender) {
						sendername.classList.remove("hidden");
					}else {
						sendername.classList.add("hidden");
					}
				}

				let pfpimg = element.querySelector("img.sender");
				if (pfpimg) {
					if (isLastMessageBySender) {
						pfpimg.classList.remove("hidden");
						/*if (list.element.scrollTop + list.element.offsetHeight < element.offsetTop + element.offsetHeight) {
							let maxpos = 16;
							for (let index = thisMessageIndex + 1; index >= 0; index--) {
								let item = listdata[index];
								if (item) {
									if (item.data.senderUID != data.senderUID) {
										let elem = item.element;
										maxpos = element.offsetTop + element.offsetHeight - elem.offsetTop - elem.offsetHeight - pfpimg.offsetHeight - 16;
										break;
									}
								}
							}
							
							let pos = element.offsetTop + element.offsetHeight + 16 - (list.element.scrollTop + list.element.offsetHeight);
							if (maxpos < pos) pos = maxpos;
							pfpimg.style.bottom = pos + "px";
						}else {
							pfpimg.style.bottom = "";
						}*/
					}else {
						pfpimg.classList.add("hidden");
					}
				}
			}
			let msgreactions = element.querySelector("msgreacts");
			if (msgreactions) {
				msgreactions.innerHTML = "";
				let reactions = data.reactions;
				if (reactions) {
					Object.keys(reactions).forEach(function(ir) {
						let react = reactions[ir];
						let reactMainButton = document.createElement("button");
						reactMainButton.style.cursor = "pointer";
						reactMainButton.classList.add("interactive");
						reactMainButton.addEventListener("click",function() {
							fetch(currentServer + "sendreaction", {body: JSON.stringify({'token': logininfo.token, 'chatid': chatid, 'messageid': id, 'reaction': ir}),method: 'POST'}).then((res) => {
								
							})
						})
						let reactEmojiLabel = document.createElement("label");
						reactEmojiLabel.innerText = ir;
						let reactEmojiCountLabel = document.createElement("label");
						reactEmojiCountLabel.innerText = "0";
						reactMainButton.appendChild(reactEmojiLabel);
						reactMainButton.appendChild(reactEmojiCountLabel);
						msgreactions.appendChild(reactMainButton);

						let rkk = Object.keys(react);
						let doesContainCurrentUser = false;
						Object.values(react).forEach(function(a) {
							if (a.senderUID == logininfo.userID) {
								doesContainCurrentUser = true;
							}
						})

						if (doesContainCurrentUser) {
							reactMainButton.classList.add("rcted")
						}

						reactEmojiCountLabel.innerText = rkk.length;

						reactMainButton.addEventListener("contextmenu", function(event) {
							let diag = opendialog();
							diag.title.innerText = getString("reactions_list") + ": " + ir;
							diag.inner.style.overflow = "hidden";
							diag.inner.style.display = "flex";
							diag.inner.style.flexDirection = "column";
							
							let reactionslist = createLazyList("div","div");
							reactionslist.element.classList.add("clist");
							reactionslist.setGetSize(function(list,index) {
								return 56;
							});
							reactionslist.setItemGenerator(function(list,index,urow) {
								let item = list[index];
								if (item == undefined) return;
								urow.style.display = "flex";
								urow.style.width = "100%";
								urow.style.height = "56px";
								urow.style.padding = "8px";
								let uname = document.createElement("div");
								uname.style.display = "flex";
								uname.style.alignItems = "center";
								uname.style.width = "100%";
								let userpfp = document.createElement("img");
								userpfp.classList.add("circleimg");
								userpfp.classList.add("loading");
								userpfp.loading = "lazy";
								userpfp.style.cursor = "pointer";
								userpfp.addEventListener("click",function() {
									viewInfo(item.senderUID, "user");
								});
								let usernamelbl = document.createElement("label");
								usernamelbl.classList.add("loading");
								usernamelbl.innerText = "loading..."
								usernamelbl.style.marginLeft = "8px";
								usernamelbl.style.marginRight = "8px";
								uname.appendChild(userpfp);
								uname.appendChild(usernamelbl);
								getInfo(item.senderUID, function(uii) {
									userpfp.src = getpfp(uii.picture);
									usernamelbl.innerText = uii.name;
									userpfp.classList.remove("loading");
									usernamelbl.classList.remove("loading");
									userpfp.title = getString("view_profile_of_username").replace("[NAME]", uii.name);
								});
								urow.appendChild(uname);
								let uacts = document.createElement("div");
								uacts.style.display = "flex";
								uacts.style.alignItems = "center";
								uacts.style.flexShrink = "0";
								let sendTime = document.createElement("label");
								sendTime.style.fontSize = "small";
								sendTime.innerText = formatDate(new Date(item.sendTime));
								uacts.appendChild(sendTime);
								urow.appendChild(uacts);
							});

							reactionslist.setList(Object.values(react));

							diag.inner.appendChild(reactionslist.element);
							event.preventDefault();
						})
					});
				}
				// No need to check for these if there wasn't reaction container. Because these wouldn't exist too.
				let msgpinned = element.querySelector(".msgpinned");
				if (msgpinned) msgpinned.style.display = data.isPinned ? "" : "none";

				let msgstatus = element.querySelector(".msgstatus");
				if (msgstatus) {
					if (data.status == "sending") {
						msgstatus.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 -960 960 960" width="20"><path d="m614-310 51-51-149-149v-210h-72v240l170 170ZM480-96q-79.376 0-149.188-30Q261-156 208.5-208.5T126-330.958q-30-69.959-30-149.5Q96-560 126-630t82.5-122q52.5-52 122.458-82 69.959-30 149.5-30 79.542 0 149.548 30.24 70.007 30.24 121.792 82.08 51.786 51.84 81.994 121.92T864-480q0 79.376-30 149.188Q804-261 752-208.5T629.869-126Q559.738-96 480-96Zm0-384Zm.477 312q129.477 0 220.5-91.5T792-480.477q0-129.477-91.023-220.5T480.477-792Q351-792 259.5-700.977t-91.5 220.5Q168-351 259.5-259.5T480.477-168Z"/></svg>';
					}else {
						msgstatus.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 -960 960 960" width="20"><path d="M395-285 226-455l50-50 119 118 289-288 50 51-339 339Z"/></svg>';
					}

					if (data.readBy && typeof data.readBy == "object" && data.readBy.length > 0 && !(data.readBy.length == 1 && data.readBy[0].userID == logininfo.userID && data.senderUID == logininfo.userID)) {
						msgstatus.disabled = false;
						msgstatus.title = getString("message_read_by_count", "count", data.readBy.length - 1);
					}else {
						msgstatus.disabled = true;
						msgstatus.title = "";
					}
				};


				let msgedited = element.querySelector(".msgedited");
				if (msgedited) msgedited.style.display = data.isEdited ? "" : "none";

				if (data.isEdited) {
					let msgcontent = element.querySelector("msgcontent");
					if (msgcontent) msgcontent.innerHTML = linkify(data.content);
				}
			}
		}

		function getoldermessages(prefix,callback,idtoremove) {
			fetch(currentServer + "getmessages", {body: JSON.stringify({'token': logininfo.token, 'chatid': chatid, 'prefix': prefix}),method: 'POST'}).then((res) => {
				if (res.ok) {
					res.text().then((text) => {
						isready = true;
						chatpage = JSON.parse(text);
						let mkeys = Object.keys(chatpage).reverse();
						if (mkeys.length > 0) {
							let list = messageslist.getList();
							if (messageslist.getItemData(mkeys[0]) == undefined) {
								let oldfirstmsg = list[Object.keys(list)[0]];
								let lastmsgtime = new Date(oldfirstmsg.data.sendTime);
								let newfirstmsg = chatpage[mkeys[0]];
								let newmsgtime = new Date(newfirstmsg.sendTime);
								if (idtoremove != undefined && newmsgtime.setHours(0,0,0,0) == lastmsgtime.setHours(0,0,0,0)) {
									messageslist.removeItem(idtoremove);
								}
							}

							mkeys.forEach((i,idx) => {
								if (messageslist.getItemData(i) == undefined) {
									let msg = chatpage[i];
									let dt = new Date(msg.sendTime);
									
									addmsg(msg, i, -1);
									if (idx == mkeys.length - 1) {
										addmsg({
											senderUID: "0",
											content: getDayString(dt),
											sendTime: dt,
											loadOlder: true,
											type: "time"
										},timemsgid,-1)
										timemsgid++;
									}
								}
							})
						}

						if (callback) {
							callback();
						}
					})
				}
			})
		}

		function showmessage(id, hint = true) {
			function show() {
				messageslist.scrollToItem(id, function(list, id, cont) {
					if (hint && replymsgid != id) {
						cont.classList.add("hint");
						setTimeout(function() {
							cont.classList.remove("hint");
						},1000);
					}
				});
			}
			if (messageslist.getItemData(id)) {
				show();
			}else {
				getoldermessages("#" + messagescount + "-" + id, show);
			}
		}

		let newReadMessages = [];
		let readSendTimeout = null;

		function sendReadMessages() {
			readSendTimeout = null;
			fetch(currentServer + "readmessage", {body: JSON.stringify({'token': logininfo.token, 'chatid': chatid, 'messageids': newReadMessages}),method: 'POST'});
			newReadMessages.length = 0;
		}

		function updateMessage(id) {
			messageslist.updateItem(id);
			if (pinnedmessages[id]) {
				pinnedmessageslist.updateItem(id);
			}
		}

		function createmsg(msg,id,msgc,extra) {
			if (msgc == undefined) {
				return;
			}
			let dt = new Date(msg.sendTime);
			function selectmessage() {
				if (msg.type == "time") return;
				let idx = selectedMessages.indexOf(id);
				if (idx > -1) {
					selectedMessages.splice(idx,1);
					updateMessage(id);
				}else {
					selectedMessages.push(id);
				}
				messageslist.element.classList.toggle("selection", selectedMessages.length > 0);
				pinnedmessageslist.element.classList.toggle("selection", selectedMessages.length > 0);
				messageBar.classList.toggle("hidden", selectedMessages.length > 0);
				selectedMessages.forEach(function(msgid) {
					updateMessage(msgid);
				})
			}
			function reply() {
				let oldreplyid = replymsgid;
				replymsgid = id;
				currentReplyContainer.style.display = "";
				if (msg.senderUID == "0") {
					currentReplyContent.innerText = "Pamuk is here!";
					formatSystemMessage(msg.content, function(text) {
						currentReplyContent.innerText = text;
					})
				}else {
					currentReplyContent.innerText = getMessageString(msg);
				}

				currentReplyUsername.innerText = "Loading...";
				currentReplyUsername.classList.add("loading");
				getInfo(msg.senderUID,(user) => {
					currentReplyUsername.innerText = user.name;
					currentReplyUsername.classList.remove("loading");
				})

				if (pinnedmessageslist.element.style.display == "") {
					pinsbtn.click();
				}

				msginput.focus();

				updateMessage(id);
				if (oldreplyid) {
					updateMessage(oldreplyid);
				}
			}

			msgc.addEventListener("keydown",function(e) {
				e.preventDefault();
				if (e.key == "r") {
					reply();
				}
				if (e.key == "s") {
					selectmessage();
				}
				if (e.key == "m") {
					spawnMessageMenu(true);
				}
			})

			msgc.addEventListener("click",function() {
				if (selectedMessages.length > 0) {
					selectmessage();
				}
			})

			function spawnMessageMenu(spawnOnMessage = false) {
				let ctxdiv = createPopupContainer(spawnOnMessage ? msgbubble : undefined);
				ctxdiv.classList.add("customctx");
				ctxdiv.style.width = "315px";

				function createButton() {
					let btn = document.createElement("button");
					addRipple(btn);
					
					btn.addEventListener("click", function() {
						ctxdiv.close();
					})

					return btn;
				}

				if (crole.AllowSendingReactions == true) {
					let reactionsContainer = document.createElement("div");
					reactionsContainer.classList.add("reactionsbar");
					reactionemojis.forEach((item) => {
						let itm = item.toString();
						let reactionbtn = createButton();
						reactionbtn.classList.add("emoji");
						let reacted = false;
						if (msg.reactions) {
							if (msg.reactions[itm]) {
								Object.values(msg.reactions[itm]).forEach(function(s) {
									if (s.senderUID == logininfo.userID) {
										reactionbtn.classList.add("reacted");
										reacted = true;
									}
								})
							}
						}
						reactionbtn.innerText = itm;
						reactionsContainer.appendChild(reactionbtn);
						reactionbtn.addEventListener("click",function() {
							fetch(currentServer + "sendreaction", {body: JSON.stringify({'token': logininfo.token, 'chatid': chatid, 'messageid': id, 'reaction': itm}),method: 'POST'})
							if (reacted) {
								reactionbtn.classList.remove("reacted");
							}else {
								reactionbtn.classList.add("reacted");
							}
						});
					});

					let morebtn = createButton();
					morebtn.innerText = getString("more_reactions");
					reactionsContainer.appendChild(morebtn);
					morebtn.addEventListener("click", function() {
						openEmojiMenu(morebtn, function(emoji) {
							fetch(currentServer + "sendreaction", {body: JSON.stringify({'token': logininfo.token, 'chatid': chatid, 'messageid': id, 'reaction': emoji}),method: 'POST'});
						});
					})

					ctxdiv.appendChild(reactionsContainer);
				}

				let actionsContainer = document.createElement("div");
				ctxdiv.appendChild(actionsContainer);
				addKeyboardListSelectionSupport(actionsContainer);
				setTimeout(function() {actionsContainer.focus();}, 100);

				if (extra) {
					if (extra.pinnedmessageslist == true) {
						let gotobutton = createButton();
						gotobutton.innerText = getString("message_action_goto_message");
						gotobutton.disabled = !crole.AllowSending;
						gotobutton.addEventListener("click", function() {
							if (pinnedmessageslist.element.style.display == "") {
								pinsbtn.click();
							}
							showmessage(id);
						})
						actionsContainer.appendChild(gotobutton);
					}
				}

				let replybutton = createButton();
				replybutton.innerText = getString("message_action_reply_to_message");
				replybutton.disabled = !crole.AllowSending;
				replybutton.addEventListener("click", function() {
					reply();
				})
				actionsContainer.appendChild(replybutton);
				
				if (msg.senderUID == logininfo.userID && msg.forwardedFromUID == undefined) {
					let editbutton = createButton();
					editbutton.innerText = getString("message_action_edit_message");
					editbutton.addEventListener("click", function() {
						let editDialog = opendialog();
						editDialog.title.innerText = getString("message_action_edit_message");
						editDialog.inner.style.display = "flex";
						editDialog.inner.style.flexDirection = "column";
						editDialog.inner.style.alignItems = "center";

						let editTextarea = document.createElement("textarea");
						editTextarea.value = msg.content;
						editTextarea.style.width = "500px";
						editTextarea.style.height = "300px";
						editTextarea.style.maxWidth = "100%";
						editDialog.inner.appendChild(editTextarea);

						let applyBtn = document.createElement("button");
						applyBtn.innerText = getString("send_message");
						editDialog.inner.appendChild(applyBtn);
						applyBtn.disabled = true;

						editTextarea.addEventListener("input", function() {
							applyBtn.disabled = editTextarea.value.trim() == "" || editTextarea.value == msg.content;
						});

						applyBtn.addEventListener("click", function() {
							editDialog.closebtn.click();
							fetch(currentServer + "editmessage", {body: JSON.stringify({'token': logininfo.token, 'chatid': chatid, 'messageid': id, 'content': editTextarea.value.trim()}),method: 'POST'});
						})

						editTextarea.focus();
					})
					actionsContainer.appendChild(editbutton);
				}

				let forwardbutton = createButton();
				forwardbutton.innerText = getString("message_action_forward_message");
				forwardbutton.addEventListener("click", function() {
					let diag = opendialog();
					diag.title.innerText = getString("message_action_forward_message");
					diag.inner.style.overflow = "hidden";
					diag.inner.style.display = "flex";
					diag.inner.style.flexDirection = "column";
					let bottomBar = document.createElement("div");
					bottomBar.classList.add("bbar");
					let forwardChatsLabel = document.createElement("label");
					forwardChatsLabel.style.textOverflow = "ellipsis";
					forwardChatsLabel.style.overflow = "hidden";
					forwardChatsLabel.style.whiteSpace = "nowrap";
					forwardChatsLabel.style.width = "100%";
					bottomBar.appendChild(forwardChatsLabel);
					let sendButton = document.createElement("button");
					sendButton.classList.add("cb");
					sendButton.title = getString("send_message");
					sendButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24"><path d="M120-160v-640l760 320-760 320Zm80-120 474-200-474-200v140l240 60-240 60v140Zm0 0v-400 400Z"/></svg>';
					bottomBar.appendChild(sendButton);
					let fchatselectsid = [];
					let gous = [];
					function refreshlabel() {
						forwardChatsLabel.innerText = gous.join(", ");
					}
					let chatslist = createLazyList("div","button");
					chatslist.element.classList.add("clist");
					chatslist.setGetSize(function(list,index) {
						return 60;
					});
					chatslist.setItemGenerator(function(list,index,itmcont) {
						let item = list[index];
						if (item == undefined) return;
						chatsListItemGenerator(item, itmcont);
						let cinfo = {};
						let id = item["chatid"] ?? item.group;
						itmcont.addEventListener("click",function() {
							if (fchatselectsid.includes(id)) {
								gous.splice(fchatselectsid.indexOf(id),1);
								fchatselectsid.splice(fchatselectsid.indexOf(id),1);
							}else {
								fchatselectsid.push(id);
								gous.push(cinfo.name);
							}
							refreshlabel();
							chatslist.updateItem();
						})
						getInfo(item.type == "user" ? item.user : item.group, function(info) {
							cinfo = info;
						});
					});

					chatslist.setItemUpdater(function(list,index,itmcont) {
						let item = list[index];
						if (item == undefined) return;
						let id = item["chatid"] ?? item.group;
						itmcont.classList.toggle("active", fchatselectsid.includes(id));
					});

					chatslist.setList(chats);

					diag.inner.appendChild(chatslist.element)
					diag.inner.appendChild(bottomBar)

					sendButton.onclick = function() {
						let messages = selectedMessages;
						if (messages.length == 0) messages = [id];
						fetch(currentServer + "forwardmessage", {body: JSON.stringify({'token': logininfo.token, 'chatid': chatid, 'messageids': messages, 'chatidstosend': fchatselectsid}),method: 'POST'}).then((res) => {

						})
						diag.closebtn.click();
					}
				})
				actionsContainer.appendChild(forwardbutton);
				let selectbutton = createButton();
				selectbutton.innerText = getString("message_action_select_message");
				selectbutton.addEventListener("click", function() {
					selectmessage();
				})
				actionsContainer.appendChild(selectbutton);
				let savebtn = createButton();
				savebtn.innerText = getString("message_action_save_message");
				savebtn.addEventListener("click", function() {
					let messages = selectedMessages;
					if (messages.length == 0) messages = [id];
					fetch(currentServer + "savemessage", {body: JSON.stringify({'token': logininfo.token, 'chatid': chatid, 'messageids': messages}),method: 'POST'}).then((res) => {

					})
				})
				actionsContainer.appendChild(savebtn);
				let pinbtn = createButton();
				pinbtn.innerText = msgpinned.style.display == "" ? getString("message_action_unpin_message") : getString("message_action_pin_message");
				pinbtn.addEventListener("click", function() {
					let messages = selectedMessages;
					if (messages.length == 0) messages = [id];
					fetch(currentServer + "pinmessage", {body: JSON.stringify({'token': logininfo.token, 'chatid': chatid, 'messageids': messages}),method: 'POST'}).then((res) => {
						
					})
				})
				pinbtn.disabled = !crole.AllowPinningMessages;
				actionsContainer.appendChild(pinbtn);
				let copybutton = createButton();
				copybutton.innerText = getString("copy_selected_text");
				copybutton.addEventListener("click", function() {
					document.execCommand('copy');
				})
				actionsContainer.appendChild(copybutton);
				let deletebutton = createButton();
				deletebutton.innerText = getString("message_action_delete_message");
				deletebutton.addEventListener("click", () => {
					if (confirm(getString("message_action_delete_message_confirm"))) {
						let messages = selectedMessages;
						if (messages.length == 0) messages = [id];
						fetch(currentServer + "deletemessage", {body: JSON.stringify({'token': logininfo.token, 'chatid': chatid, 'messageids': messages}),method: 'POST'}).then((res) => {
							
						})
					}
				})
				actionsContainer.appendChild(deletebutton);

				if (selectedMessages.length > 0) {
					deletebutton.disabled = false;
				}else {
					deletebutton.disabled = !(crole.AllowMessageDeleting || msg.senderUID == logininfo.userID);
				}
			}

			msgc.addEventListener("contextmenu",function(event) {
				if ((event.pointerType == "touch" || isTouch) && selectedMessages.length == 0) return;
				let parent = event.target;
				while (parent) {
					tagname = parent.tagName.toString();
					if (tagname.toLowerCase() == "a") return;
					if (tagname.toLowerCase() == "button") return;
					parent = parent.parentElement;
				}
				if (msg.type != "time") {
					spawnMessageMenu();
					event.preventDefault();
				}
			});
			
			let msgm = document.createElement("msgmain");
			let msgbubble = document.createElement("msgbubble");
			let msgcontent = document.createElement("msgcontent");
			let msgreactions = document.createElement("msgreacts");
			let msgstate = document.createElement("msgstate");
			let msgtimelbl = document.createElement("label");
			let msgsender = document.createElement("msgsender");
			let msgsendertxt = document.createElement("label");
			let msgpfp = document.createElement("img");
			
			msgsender.classList.add("sender", "interactive");
			msgpfp.classList.add("sender");
			msgpfp.classList.add("loading", "interactive");
			msgsendertxt.innerText = "loading..."
			msgsendertxt.classList.add("loading");
			msgcontent.style.overflowWrap = "break-word";

			if (msg.type != "time") {
				let selectid = document.createElement("div");
				selectid.classList.add("selectid");
				msgc.appendChild(selectid);
			};

			if (msg.senderUID == "0") {
				msgcontent.innerText = "Pamuk is here!";
				formatSystemMessage(msg.content, function(text) {
					msgcontent.innerText = text;
				})
			}else {
				msgcontent.innerHTML = linkify(msg.content);
			}
			msgtimelbl.innerText = getTimeString(dt);

			if (msg.forwardedFromUID != undefined) {
				let forwardInfo = document.createElement("div");
				forwardInfo.classList.add("interactive");
				forwardInfo.style.fontSize = "12px";
				forwardInfo.style.cursor = "pointer";
				forwardInfo.innerText = getString("forwarded_from_username").replace("[NAME]", "???");

				forwardInfo.addEventListener("click",function() {
					viewInfo(msg.forwardedFromUID, "user")
				})

				getInfo(msg.forwardedFromUID,function(user) {
					forwardInfo.innerText = getString("forwarded_from_username").replace("[NAME]", user.name);
				})

				msgbubble.appendChild(forwardInfo);
			}

			if (msg.replyMessageContent != undefined) {
				let repliedtocont = document.createElement("button");
				repliedtocont.classList.add("replycont", "interactive");
				addRipple(repliedtocont);
				repliedtocont.addEventListener("click",function() {
					showmessage(msg.replyMessageID);
				})
				let replysname = document.createElement("b");
				replysname.innerText = "loading...";
				replysname.classList.add("loading");
				getInfo(msg.replyMessageSenderUID,function(user) {
					replysname.innerText = user.name;
					replysname.classList.remove("loading");
				})

				repliedtocont.appendChild(replysname);
				let replycnt = document.createElement("label");
				if (msg.replyMessageSenderUID == "0") {
					replycnt.innerText = "Pamuk is here!";
					formatSystemMessage(msg.replyMessageContent, function(text) {
						replycnt.innerText = text;
					})
				}else {
					let item = messageslist.getItemData(msg.replyMessageID) ?? pinnedmessageslist.getItemData(msg.replyMessageID);
					replycnt.innerText = getMessageString(item ?? {
						content: msg.replyMessageContent
					});
				}
				repliedtocont.appendChild(replycnt);
				msgbubble.appendChild(repliedtocont);
			}



			if (msg.senderUID != 0) {
				msgm.appendChild(msgsender);
				getInfo(msg.senderUID,(user) => {
					msgpfp.classList.remove("loading");
					msgsendertxt.classList.remove("loading");
					msgsendertxt.innerText = user.name;
					msgpfp.src = getpfp(user.picture);
					msgpfp.title = user.name;
				})

				msgpfp.style.cursor = "pointer";
				msgpfp.addEventListener("click",function() {
					viewInfo(msg.senderUID,"user")
				})
			}
			msgm.appendChild(msgbubble);
			if (msg.files != undefined) {
				if (msg.gImages == undefined) msg.gImages = [];
				if (msg.gVideos == undefined) msg.gVideos = [];
				if (msg.gAudio == undefined) msg.gAudio = [];
				if (msg.gFiles == undefined) msg.gFiles = [];
				
				let gridcont = null;
				//Grid
				function createMediaElement(i, type) {
					if (gridcont == null) {
						gridcont = document.createElement("div");
						gridcont.classList.add("msgmediacont");
						msgbubble.appendChild(gridcont);
					}
					let cont = document.createElement("div");
					cont.classList.add("msgmedia", "interactive");

					let iconcont = document.createElement("div");

					if (i.hasThumbnail) {
						let imgs = new Image();
						imgs.src = i.url.replace(/%SERVER%/g,currentServer) + (i.url.includes("%SERVER%") ? "&type=thumb" : "");
						let img = document.createElement("img");
						img.style.background = "white";
						img.classList.add("loading");
						imgs.onload = function() {
							img.src = imgs.src;
							img.classList.remove("loading");
						}
						cont.appendChild(img);

						if (type == "video") {
							iconcont.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" height="40px" viewBox="0 -960 960 960" width="40px"><path d="M320-263v-438q0-15 10-24.17 10-9.16 23.33-9.16 4.34 0 8.84 1.16 4.5 1.17 8.83 3.5L715.67-510q7.66 5.33 11.5 12.33 3.83 7 3.83 15.67t-3.83 15.67q-3.84 7-11.5 12.33L371-234.33q-4.33 2.33-8.83 3.5-4.5 1.16-8.84 1.16-13.33 0-23.33-9.16Q320-248 320-263Z"/></svg>';
							iconcont.classList.add("icon");
						}
					}else {
						if (type == "image") {
							iconcont.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" height="48px" viewBox="0 -960 960 960" width="48px"><path d="M180-120q-24 0-42-18t-18-42v-600q0-24 18-42t42-18h600q24 0 42 18t18 42v600q0 24-18 42t-42 18H180Zm86-157h429q9 0 13-8t-1-16L590-457q-5-6-12-6t-12 6L446-302l-81-111q-5-6-12-6t-12 6l-86 112q-6 8-2 16t13 8Z"/></svg>';
						}else {
							iconcont.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" height="48px" viewBox="0 -960 960 960" width="48px"><path d="M655-521q11-7 11-19t-11-19L459-685q-11-8-23-1.5T424-666v252q0 14 12 20.5t23-1.5l196-126ZM260-200q-24 0-42-18t-18-42v-560q0-24 18-42t42-18h560q24 0 42 18t18 42v560q0 24-18 42t-42 18H260ZM140-80q-24 0-42-18t-18-42v-590q0-13 8.5-21.5T110-760q13 0 21.5 8.5T140-730v590h590q13 0 21.5 8.5T760-110q0 13-8.5 21.5T730-80H140Z"/></svg>';
						}
					}

					
					
					cont.appendChild(iconcont);

					cont.style.width = cont.style.height = Math.max(240 / (msg.gImages.length + msg.gVideos.length), 100) + "px";
					cont.title = i.name;

					let info = document.createElement("div");
					info.classList.add("info");
					info.innerText = humanFileSize(i.size);
					cont.appendChild(info);
					gridcont.appendChild(cont);

					if (type == "video") {
						cont.onclick = function() {videoView(i.url.replace(/%SERVER%/g, currentServer))};
					}else if (type == "image") {
						cont.onclick = function() {imageView(i.url.replace(/%SERVER%/g, currentServer))};
					}
				}
				msg.gImages.forEach(function(i) {
					createMediaElement(i, "image")
				})
				msg.gVideos.forEach(function(i) {
					createMediaElement(i, "video")
				})

				// List
				msg.gAudio.forEach(function(i) {
					let fd = document.createElement("button");
					fd.classList.add("messageattachment", "interactive");
					addRipple(fd, "rgba(255,255,255,0.6)");
					let path = i.url.replace(/%SERVER%/g,currentServer);
					fd.setAttribute("data-audiopath", path);
					let fileico = document.createElement("div");
					fileico.classList.add("playico");
					fileico.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px"><path d="M320-273v-414q0-17 12-28.5t28-11.5q5 0 10.5 1.5T381-721l326 207q9 6 13.5 15t4.5 19q0 10-4.5 19T707-446L381-239q-5 3-10.5 4.5T360-233q-16 0-28-11.5T320-273Z"/></svg>';
					let filename = i.name;
					fd.appendChild(fileico)
					let il = document.createElement("div");
					il.classList.add("info");
					let namel = document.createElement("label");
					namel.innerText = filename;
					il.appendChild(namel);
					let sizel = document.createElement("label");
					sizel.innerText = humanFileSize(i.size);
					il.appendChild(sizel);
					fd.appendChild(il);

					fd.addEventListener("click",function() {
						playAudio(path, chatid);
						audioTitle.innerText = filename;
					})

					msgbubble.appendChild(fd);
				})
				msg.gFiles.forEach(function(i) {
					let a = document.createElement("a");
					a.download = i.name;
					a.target = "_blank";
					a.href = i.url.replace(/%SERVER%/g,currentServer);
					let fd = document.createElement("button");
					fd.classList.add("messageattachment", "interactive");
					addRipple(fd, "rgba(255,255,255,0.6)");
					let fileico = document.createElement("div");
					fileico.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px"><path d="M760-200H320q-33 0-56.5-23.5T240-280v-560q0-33 23.5-56.5T320-920h247q16 0 30.5 6t25.5 17l194 194q11 11 17 25.5t6 30.5v367q0 33-23.5 56.5T760-200Zm0-440L560-840v140q0 25 17.5 42.5T620-640h140ZM160-40q-33 0-56.5-23.5T80-120v-520q0-17 11.5-28.5T120-680q17 0 28.5 11.5T160-640v520h400q17 0 28.5 11.5T600-80q0 17-11.5 28.5T560-40H160Z"/></svg>';
					let filename = i.name ?? getString("message_attachment_file");
					fd.appendChild(fileico)
					let il = document.createElement("div");
					il.classList.add("info");
					let namel = document.createElement("label");
					namel.innerText = filename;
					il.appendChild(namel);
					
					if (i.size) {
						let sizel = document.createElement("label");
						sizel.innerText = humanFileSize(i.size);
						il.appendChild(sizel);
					}
					
					fd.appendChild(il);

					fd.addEventListener("click",function() {
						a.click();
					})

					msgbubble.appendChild(fd);
				})
			}

			msgbubble.appendChild(msgcontent);
			msgbubble.appendChild(msgreactions);

			if (msg.type != "time") {
				msgm.appendChild(msgstate);
			}

			let msgstatus = document.createElement("button");
			msgstatus.classList.add("msgstatus", "cb", "small", "interactive");
			msgstatus.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 -960 960 960" width="20"><path d="M395-285 226-455l50-50 119 118 289-288 50 51-339 339Z"/></svg>';
			msgstatus.addEventListener("click", function() {
				let diag = opendialog();
				diag.title.innerText = getString("message_read_by_count", "count", msg.readBy.length);
				diag.inner.style.overflow = "hidden";
				diag.inner.style.display = "flex";
				diag.inner.style.flexDirection = "column";
				
				let readlist = createLazyList("div","div");
				readlist.element.classList.add("clist");
				readlist.setGetSize(function(list,index) {
					return 56;
				});
				readlist.setItemGenerator(function(list,index,urow) {
					let item = list[index];
					if (item == undefined) return;
					urow.style.display = "flex";
					urow.style.width = "100%";
					urow.style.height = "56px";
					urow.style.padding = "8px";
					let uname = document.createElement("div");
					uname.style.display = "flex";
					uname.style.alignItems = "center";
					uname.style.width = "100%";
					let userpfp = document.createElement("img");
					userpfp.classList.add("circleimg");
					userpfp.classList.add("loading");
					userpfp.loading = "lazy";
					userpfp.style.cursor = "pointer";
					userpfp.addEventListener("click",function() {
						viewInfo(item.userID, "user");
					});
					let usernamelbl = document.createElement("label");
					usernamelbl.classList.add("loading");
					usernamelbl.innerText = "loading..."
					usernamelbl.style.marginLeft = "8px";
					usernamelbl.style.marginRight = "8px";
					uname.appendChild(userpfp);
					uname.appendChild(usernamelbl);
					getInfo(item.userID, function(uii) {
						userpfp.src = getpfp(uii.picture);
						usernamelbl.innerText = uii.name;
						userpfp.classList.remove("loading");
						usernamelbl.classList.remove("loading");
						userpfp.title = getString("view_profile_of_username").replace("[NAME]", uii.name);
					});
					urow.appendChild(uname);
					let uacts = document.createElement("div");
					uacts.style.display = "flex";
					uacts.style.alignItems = "center";
					uacts.style.flexShrink = "0";
					let readTime = document.createElement("label");
					readTime.style.fontSize = "small";
					readTime.innerText = formatDate(new Date(item.readTime));
					uacts.appendChild(readTime);
					urow.appendChild(uacts);
				});

				readlist.setList(msg.readBy);

				diag.inner.appendChild(readlist.element);		
			})

			let msgpinned = document.createElement("div");
			msgpinned.classList.add("msgpinned");
			msgpinned.title = getString("message_pinned_hint");
			msgpinned.style.display = msg.isPinned ? "" : "none";
			msgpinned.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px"><path d="M624-744v264l85 85q5 5 8 11.5t3 14.5v20.81q0 15.38-10.35 25.79Q699.3-312 684-312H516v222q0 15.3-10.29 25.65Q495.42-54 480.21-54T454.5-64.35Q444-74.7 444-90v-222H276q-15.3 0-25.65-10.4Q240-332.81 240-348.19V-369q0-8 3-14.5t8-11.5l85-85v-264h-12q-15.3 0-25.65-10.29Q288-764.58 288-779.79t10.35-25.71Q308.7-816 324-816h312q15.3 0 25.65 10.29Q672-795.42 672-780.21t-10.35 25.71Q651.3-744 636-744h-12Z"/></svg>';

			let msgedited = document.createElement("div");
			msgedited.classList.add("msgedited");
			msgedited.title = getString("message_edited_hint");
			msgedited.style.display = msg.isEdited ? "" : "none";
			msgedited.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px"><path d="M216-216h51l375-375-51-51-375 375v51Zm-35.82 72q-15.18 0-25.68-10.3-10.5-10.29-10.5-25.52v-86.85q0-14.33 5-27.33 5-13 16-24l477-477q11-11 23.84-16 12.83-5 27-5 14.16 0 27.16 5t24 16l51 51q11 11 16 24t5 26.54q0 14.45-5.02 27.54T795-642L318-165q-11 11-23.95 16t-27.24 5h-86.63ZM744-693l-51-51 51 51Zm-127.95 76.95L591-642l51 51-25.95-25.05Z"/></svg>';

			if (msg.senderUID == logininfo.userID) {
				msgm.classList.add("sender");
				msgc.appendChild(document.createElement("ma"));
				msgsender.appendChild(document.createElement("ma"));
				msgsender.appendChild(msgsendertxt)
				msgstate.appendChild(document.createElement("ma"));
				msgstate.appendChild(msgtimelbl);
				msgc.appendChild(msgm);
				msgc.appendChild(msgpfp);
			}else {
				if (msg.senderUID == 0) {
					msgc.appendChild(document.createElement("ma"));
					msgc.appendChild(msgm);
					msgc.appendChild(document.createElement("ma"));
					if (msg.type != "time") {
						msgstate.appendChild(msgtimelbl);
						msgstate.appendChild(document.createElement("ma"));
					}
				}else {
					msgc.appendChild(msgpfp);
					msgc.appendChild(msgm);
					msgc.appendChild(document.createElement("ma"));
					msgsender.appendChild(msgsendertxt)
					msgsender.appendChild(document.createElement("ma"));
					msgstate.appendChild(msgtimelbl);
					msgstate.appendChild(document.createElement("ma"));
				}
			}

			msgstate.appendChild(msgpinned);
			msgstate.appendChild(msgedited);
			msgstate.appendChild(msgstatus);

			let replydragstart = null;
			let dragy = null;
			let dragtime = null;
			let lastdiff = 0;
			let cancelled = true;
			let draglocked = false;
			msgc.addEventListener("touchstart", function(event) {
				if (selectedMessages.length > 0) return;
				if (msg.type != "time") {
					replydragstart = event.touches[0].clientX;
					dragy = event.touches[0].clientY;
					dragtime = Date.now();
					cancelled = false;
				}
			})
			msgc.addEventListener("touchmove", function(event) {
				if (replydragstart == null) return;
				let x = event.touches[0].clientX;
				let y = event.touches[0].clientY;
				let diff = Math.max(0, replydragstart - x);
				if (Math.abs(dragy - y) > 20 && !draglocked) {
					msgm.style.transform = "";
					cancelled = true;
				}else if (!cancelled) {
					msgm.style.transform = "translateX(" + Math.max(-diff, -100) + "px)";
					lastdiff = diff;

					if (diff > 10) {
						draglocked = true;
					}

					if (draglocked) {
						event.preventDefault();
					}
				}
			})
			msgc.addEventListener("touchend", function(event) {
				msgm.style.transform = "";
				if (cancelled) {

				}else if (lastdiff < 5 && (Date.now() - dragtime) < 200) {
					// Cancel if its a interactive element
					let tagname = event.target.tagName.toString();
					let parent = event.target;
					while (parent) {
						if (parent.classList.contains("interactive")) return;
						parent = parent.parentElement;
					}
					// Spawn context menu
					setTimeout(function() {spawnMessageMenu()}, 100);
					event.preventDefault();
				}else if (lastdiff >= 50) {
					reply();
					event.preventDefault();
				}
				lastdiff = 0;
				cancelled = true;
				replydragstart = null;
				draglocked = false;
			})

			msgc.addEventListener("touchcancel", function(event) {
				msgm.style.transform = "";
				replydragstart = null;
				lastdiff = 0;
				cancelled = true;
				draglocked = false;
			})
			
			if (msg.readBy && typeof msg.readBy == "object") {
				let add = true;
				for (let index = 0; index < msg.readBy.length; index++) {
					let user = msg.readBy[index];
					if (user.userID == logininfo.userID) {
						add = false;
						break;
					}
				}

				if (add) {
					newReadMessages.push(id);
					if (readSendTimeout == null) readSendTimeout = setTimeout(sendReadMessages, 1000);
				}
			}
			//return {message: msgc, status:msgstatus,msgreactions: msgreactions,reactions: rdata, pinned:msgpinned};;
		}
		
		sendbtn.disabled = true;
		let sendtyping = true;

		function onMessageInput() {
			if (msginput.value.trim().length > 0 || fileslist.length > 0) {
				sendbtn.disabled = false;
			}else {
				sendbtn.disabled = true;
			}

			if (sendtyping) {
				fetch(currentServer + "settyping", {body: JSON.stringify({'token': logininfo.token, 'chatid': chatid}),method: 'POST'});
				sendtyping = false;
				setTimeout(function() {sendtyping = true}, 2000);
			}
		}

		msginput.addEventListener("input", onMessageInput)
		
		sendbtn.addEventListener("click",function() {
			let content = msginput.value.trim();
			let replymessageid = replymsgid;
			let msgid = "send" + Math.round(Math.random() * 100000);
			addmsg({
				senderUID:logininfo.userID,
				content: content,
				sendTime: new Date(),
				status: "sending"
			},msgid);

			messageslist.element.scrollTop = messageslist.element.scrollHeight;
			
			let files = [];
			let fll = Object.assign([], fileslist);
			function upload() {
				if (fll.length > 0) {
					let file = fll.shift();
					uploadFile(file, {
						preDone: function(data) {
							files.push(data.url);
						},
						done: function(data) {
							upload();
						},
						onError: function(error) {
							messageslist.removeItem(msgid);
						}
					})
				}else {
					send();
				}
			}
			function send() {
				fetch(currentServer + "sendmessage", {body: JSON.stringify({'token': logininfo.token, 'chatid': chatid, 'content': content, 'replymessageid': replymessageid, 'files': (files.length > 0 ? files : null)}),method: 'POST'}).then((res) => {
					if (res.ok) {
						res.text().then((text) => {
							res = JSON.parse(text);
							if (res.result == "error") {

							}else {
								let data = messageslist.getItemData(msgid);
								if (data) {
									data["status"] = "sent";
									messageslist.updateItem(msgid,data);
								}
							}

							sendedmessages.push(msgid);
						})
					}else {
						messageslist.removeItem(msgid);
					}
				}).catch(() => {
					messageslist.removeItem(msgid);
				});
			}
			upload();

			fileslist = [];
			attachmentsContainer.innerHTML = "";
			msginput.value = "";
			currentReplyContainer.style.display = "none";
			replymsgid = undefined;
			sendbtn.disabled = true;
			msginput.focus();
			updateMessage(replymessageid);
		});
		
		msginput.addEventListener("keydown",function(e) {
			if (e.key == "Enter" && !e.shiftKey && !isTouch) {
				sendbtn.click();
				e.preventDefault();
			}
		});
		
		addHook(["chat:" + chatid]);
		fetch(currentServer + "getmessages", {body: JSON.stringify({'token': logininfo.token, 'chatid': chatid, 'prefix': "#0-#48"}),method: 'POST'}).then((res) => {
			if (res.ok) {
				fetch(currentServer + "getpinnedmessages", {body: JSON.stringify({'token': logininfo.token, 'chatid': chatid}),method: 'POST'}).then((res) => {
					if (res.ok) {
						res.text().then((text) => {
							pinnedmessages = JSON.parse(text);
							updatepinnedbar();
							for (const [key, msg] of Object.entries(pinnedmessages)) {
								addpinnedmsg(key, msg);
							}
						});
					}
				});

				fetch(currentServer + "gettyping", {body: JSON.stringify({'token': logininfo.token, 'chatid': chatid}),method: 'POST'}).then((res) => {
					if (res.ok) {
						res.json().then((val) => {
							let index = val.indexOf(logininfo.userID);
							if (index >= 0) {
								val.splice(index,1);
							}
							typingUsers = val;
							updateTypingUsers();
						});
					}
				});

				if (isuserchat) addOnlineHook(ugid, function(text) {
					infotxt.classList.remove("loading");
					infotxt.innerText = formatOnlineStatus(text);
				});

				res.text().then((text) => {
					isready = true;
					chatpage = JSON.parse(text);
					let mkeys = Object.keys(chatpage);

					mkeys.forEach(i => {
						let msg = chatpage[i];
						addmsg(msg,i);
						updatessince = i;
					})
				})
			}else {
				messageslist.element.innerHTML = "";
				let errorcont = document.createElement("div");
				let errortitle = document.createElement("h3");
				errortitle.innerText = getString("chat_load_error");
				errorcont.appendChild(errortitle);
				let errormsg = document.createElement("label");
				errormsg.innerText = getString("chat_load_error_info");
				errorcont.appendChild(errormsg);
				messageslist.element.style.alignItems = "center";
				messageslist.element.style.justifyContent = "center";
				messageslist.element.appendChild(errorcont);
				messageBar.remove();
				kill();
			}
		})


		function updateTypingUsers() {
			if (typingUsers.length == 0) {
				typinglabel.innerText = getString("nobody_typing");
				typinglabel.style.opacity = "0";
			}else {
				let usernameslist = [];
				typingUsers.forEach(function(i) {
					getInfo(i,function(u) {
						usernameslist.push(u.name);
						if (typingUsers.length == usernameslist.length) {
							typinglabel.innerText = getString("list_typing").replace("[LIST]", usernameslist.join(", "));
							typinglabel.style.opacity = "";
						}
					})
				});
			}
		}
		
		function applyChatUpdates(json) {
			let keys = Object.keys(json);
			keys.forEach((i) => {
				updatessince = i;
				let val = json[i];
				if (i == "TYPING") { // Backwards compatibility
					// Here the value is a array with all users that are typing.
					let index = val.indexOf(logininfo.userID);
					if (index >= 0) {
						val.splice(index,1);
					}
					typingUsers = val;
					updateTypingUsers();
				}else if (i.startsWith("TYPING|")) {
					// Here the value is true/false and event name is "TYPING|[User ID]"
					let user = i.split("|")[1];
					if (user != logininfo.userID) {
						if (val == true) {
							if (!typingUsers.includes(user)) typingUsers.push(user);
						}else {
							let ind = typingUsers.indexOf(user);
							if (ind != -1) {
								typingUsers.splice(ind, 1);
							}
						}
					}
					updateTypingUsers();
				}else {
					let key = val.id;
					if (val.event == "NEWMESSAGE") {
						if (messageslist.getItemData(key) == undefined) {
							chatpage[key] = val;
							addmsg(val,key);
						}
					}else if (val.event == "DELETED") {
						let index = messageslist.getListElementIndex(key);
						messageslist.removeItem(key);

						// update previous and next items so pfp/name showing/hiding applies properly
						let list = messageslist.getList();
						if (list[index - 1]) messageslist.updateItem(list[index - 1].key);
						if (list[index]) messageslist.updateItem(list[index].key);

						let selectedMessagesIndex = selectedMessages.indexOf(key);
						if (selectedMessagesIndex != -1) {
							selectedMessages.splice(selectedMessagesIndex, 1);
							messageslist.element.classList.toggle("selection", selectedMessages.length > 0);
							pinnedmessageslist.element.classList.toggle("selection", selectedMessages.length > 0);
							messageBar.classList.toggle("hidden", selectedMessages.length > 0);
							selectedMessages.forEach(function(msgid) {
								updateMessage(msgid);
							})
						}
						if (pinnedmessages[key]) {
							delete pinnedmessages[key];
							pinnedmessageslist.removeItem(key);
							updatepinnedbar();
						}
					}else if (val.event == "READ") {
						let data = messageslist.getItemData(key);
						if (data) {
							data.readBy.push({
								userID: val.userID,
								readTime: val.readTime
							});
							messageslist.updateItem(key, data);
						}
						// But message MIGHT be loaded in pinned messages area too.
						let pdata = pinnedmessageslist.getItemData(key);
						if (pdata) {
							pdata.readBy = data.readBy;
							pinnedmessageslist.updateItem(key, pdata);
						}
					}else if (val.event == "REACTIONS") { //Legacy
						let data = messageslist.getItemData(key);
						if (data) {
							data.reactions = val.rect;
							messageslist.updateItem(key, data);
						}
						// But message MIGHT be loaded in pinned messages area too.
						let pdata = pinnedmessageslist.getItemData(key);
						if (pdata) {
							pdata.reactions = val.rect;
							pinnedmessageslist.updateItem(key, pdata);
						}
					}else if (val.event == "REACTED") {
						let data = messageslist.getItemData(key);
						let emoji = val.reaction;
						if (data) {
							if (!data.reactions.hasOwnProperty(emoji)) data.reactions[emoji] = {}; // Create emoji subobject if doesn't exist.

							data.reactions[emoji][val.senderUID] = {
								reaction: emoji,
								senderUID: val.senderUID,
								sendTime: val.sendTime
							}
							messageslist.updateItem(key, data);
						}
						// But message MIGHT be loaded in pinned messages area too.
						let pdata = pinnedmessageslist.getItemData(key);
						if (pdata) {
							pdata.reactions = data.reactions;
							pinnedmessageslist.updateItem(key, pdata);
						}
					}else if (val.event == "UNREACTED") {
						let data = messageslist.getItemData(key);
						let emoji = val.reaction;
						if (data) {
							delete data.reactions[emoji][val.senderUID];
							if (Object.keys(data.reactions[emoji]).length == 0) {
								delete data.reactions[emoji];
							}
							messageslist.updateItem(key, data);
						}
						// But message MIGHT be loaded in pinned messages area too.
						let pdata = pinnedmessageslist.getItemData(key);
						if (pdata) {
							pdata.reactions = data.reactions;
							pinnedmessageslist.updateItem(key, pdata);
						}
					}else if (val.event == "EDITED") {
						let data = messageslist.getItemData(key);
						data.isEdited = true;
						data.content = val.content;
						messageslist.updateItem(key, data);
						// But message MIGHT be loaded in pinned messages area too.
						let pdata = pinnedmessageslist.getItemData(key);
						if (pdata) {
							pdata.content = data.content;
							pdata.isEdited = true;
							pinnedmessageslist.updateItem(key, pdata);
						}
					}else if (val.event == "PINNED") {
						let data = messageslist.getItemData(key);
						if (data) {
							data.isPinned = true;
							messageslist.updateItem(key, data);
						}
						pinnedmessages[key] = val;
						updatepinnedbar();
						addpinnedmsg(key,val);
					}else if (val.event == "UNPINNED") {
						let data = messageslist.getItemData(key);
						if (data) {
							data.isPinned = false;
							messageslist.updateItem(key, data);
						}
						if (pinnedmessages[key]) {
							delete pinnedmessages[key];
							pinnedmessageslist.removeItem(key);
							updatepinnedbar();
						}
					}
				}
			})
			sendedmessages.forEach(function(i) {
				messageslist.removeItem(i);
			})
			sendedmessages = [];
		}

		return {
			chat: mainChatArea,
			titlebar: titlebar,
			pfp: pfpimg,
			titlelabel: titletxt,
			infolabel: infotxt,
			addmsg: addmsg,
			backbutton:backbtn,
			kill: kill,
			applyChatUpdates: applyChatUpdates
		};
	}
}

if (currentServer == "") {
	if (localStorage.getItem("server") == null) {
		openConnectArea();
	}else {
		currentServer = localStorage.getItem("server");
		getServerInfo(currentServer).then(async function(info) {
			if (info == null) {
				openConnectArea(true);
				return;
			}

			if (!await checkServerCompatibility(info)) {
				openConnectArea(true);
				return;
			}

			serverInfo = info;

			if (localStorage.getItem("token") == null) {
					openLoginArea();
			}else {
				fetch(currentServer + "getsessioninfo", {body: JSON.stringify({'token': localStorage.getItem("token")}),method: 'POST'}).then(function(res) {
					if (res.ok) {
						res.json().then(function (info) {
							logininfo = info;
							openMainArea();
						})
					}else {
						openLoginArea();
					}
				}).catch(function() {
					openConnectArea(true);
				});
			}
		});
	}
}else {
	fetch(currentServer + "ping").then(function() {
		openLoginArea();
	}).catch(function() {
		openConnectArea(true);
	})
}
function humanFileSize(bytes, si=false, dp=1) {
 	const thresh = si ? 1000 : 1024;

  	if (Math.abs(bytes) < thresh) {
		return bytes + ' B';
  	}

  	const units = si 
		? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'] 
		: ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
  	let u = -1;
  	const r = 10**dp;

  	do {
		bytes /= thresh;
		++u;
  	} while (Math.round(Math.abs(bytes) * r) / r >= thresh && u < units.length - 1);


  	return bytes.toFixed(dp) + ' ' + units[u];
}
}

//something I made

function addKeyboardListSelectionSupport(element, options = {}) {
	let direction = options.direction ?? "vertical";
	let startIndex = options.startIndex ?? 0;
	let index = -1;
	
	let prevItemKey = direction == "horizontal" ? "ArrowLeft" : "ArrowUp";
	let nextItemKey = direction == "horizontal" ? "ArrowRight" : "ArrowDown";
	let listenningKeys = [prevItemKey, nextItemKey];

	function selectItem(index) {
		element.children[index].focus();
	}

	element.tabIndex = "0";
	element.addEventListener("keydown", function(e) {
		if (listenningKeys.includes(e.key)) {
			e.preventDefault();
			if (index == -1) {
				if (startIndex < 0) {
					index = element.children.length + startIndex;
				}else {
					index = startIndex - 1;
				}
			}
			if (e.key == prevItemKey) {
				index--;
				if (index < 0) index = 0;
				selectItem(index);
			}
			if (e.key == nextItemKey) {
				index++;
				if (index > element.children.length - 1) index = element.children.length - 1;
				selectItem(index);
			}
		}
	});

	return {
		setStartIndex: function(index) {
			startIndex = index;
		},
		setDirection: function(dir) {
			direction = dir;
		},
	}
}

function createDynamicList(elemtype = "div", innertype = "div") {
	let listObject = {};

	let list = [];

	let direction = 1;
	let pos = -1;
	let scrolldirection = 1;
	let lastscrollpos = 0;
	let lastheight = 0;

	let setPos = true;
	let poscooldown = undefined;

	let listelement = document.createElement(elemtype);
	listelement.style.overflow = "auto";
	// Keyboard item selection support
	let kbdConf = addKeyboardListSelectionSupport(listelement);

	function scrollhook(newpos, oldpos) {}

	function setscrollhook(fn) {
		scrollhook = fn;
	}

	function onScroll() {
		if (setPos) {
			if (listelement.scrollTop > lastscrollpos) {
				scrolldirection = 1;
			}else if (listelement.scrollTop < lastscrollpos) {
				scrolldirection = -1;
			}//else it's horizontal scroll
			
			if (listelement.scrollTop == 0) {
				pos = -1;
			}else if (listelement.scrollTop < listelement.scrollHeight - listelement.offsetHeight - 28) {
				pos = 0;
			}else {
				pos = 1;
			}
		}

		scrollhook(listelement.scrollTop, lastscrollpos, pos);

		lastscrollpos = listelement.scrollTop;
	}

	listelement.addEventListener("scroll", onScroll);

	function resize() {
		if (lastheight != 0) {
			if (direction == -1) {
				let diff = lastheight - listelement.offsetHeight;
				listelement.scrollTop += Math.max(diff, 0);
			}
		}
		lastheight = listelement.offsetHeight;
	}

	new ResizeObserver(resize).observe(listelement)

	function getListElementIndex(key) {
		for (let index = 0; index < list.length; index++) {
			let element = list[index];
			if (element)
			if (element.key == key) return index;
		}
	}
	function getListElement(key) {
		for (let index = 0; index < list.length; index++) {
			let element = list[index];
			if (element)
			if (element.key == key) return element;
		}
	}

	function additem(key, item, order = 1) {
		if (getListElement(key)) {
			return;
		}

		item.key = key;

		if (poscooldown) {
			clearTimeout(poscooldown);
		}

		if (pos == 1) {
			setPos = false;

			poscooldown = setTimeout(function() {
				setPos = true;
			}, 100)
		}

		let element = document.createElement(innertype);
		element.tabIndex = "0";
		element.style.height = item.size + "px"; //Assumed size, will be removed when element loads.
		if (order == 1) {
			listelement.appendChild(element)
			if (pos == 1) {
				listelement.scrollTop = listelement.scrollHeight;
			}
		}
		if (order == -1) {
			listelement.prepend(element);
			listelement.scrollTop += item.size; //FIXME
			list.unshift(item);
		}else {
			list.push(item);
		}
		item.element = element;
		let viewobserver = new IntersectionObserver(onintersection, {root: null, threshold: 0})
		let loaded = false;
		viewobserver.observe(element);

		let oldsize = item.size;
		function elemresize() {
			if (pos == 1) {
				listelement.scrollTop = listelement.scrollHeight;
			}else if (scrolldirection == -1) {
				let diff = element.offsetHeight - oldsize;
				listelement.scrollTop += diff;
			}
		}
		new ResizeObserver(elemresize).observe(element);
		
		function onintersection(entries, opts){
			entries.forEach(function (entry) {
				let visible = entry.isIntersecting;
				if (visible) {
					if (loaded == false) {
						viewobserver.unobserve(element);
						element.style.height = "";
						item.generator(item.data, element, key, listObject);
						loaded = true;
						item.updater(item.data, element, key, listObject);
					}
				}
			})
		}
	}


	function updateitem(key = null, data = null) {
		if (key != null) {
			let item = getListElement(key);
			if (item) {
				if (data != null) {
					item.data = data;
				}
				item.updater(item.data, item.element, key, listObject);
			}
		}else {
			list.forEach(function(i) {
				i.updater(i.data, i.element, i.key, listObject);
			});
		}
	}

	function getitemdata(key) {
		let item = getListElement(key);
		if (item) {
			return item.data;
		}
	}

	function removeitem(key) {
		let item = getListElement(key);
		if (item) {
			item.element.remove();
			let index = list.indexOf(item);
			if (index >= 0) {
				list.splice(index, 1);
			}
		}
	}

	function clearitems() {
		list.forEach(function(item) {
			item.element.remove();
			delete list[getListElementIndex(key)];
		})
	}

	function setdirection(d) {
		direction = d;
		if (direction == -1) {
			pos = 1;
			scrolldirection = -1;
			kbdConf.setStartIndex(-1);
		}
		if (direction == 1) {
			pos = -1;
			scrolldirection = 1;
			kbdConf.setStartIndex(0);
		}
	}

	function getelement(key) {
		let item = getListElement(key);
		if (item) {
			return item.element;
		}
	}

	function getlist() {
		return list;
	}

	function scrolltoitem(id, fn) {
		let cont = getelement(id);
		if (cont) {
			function scroll() {
				let offset = listelement.offsetHeight / 8;
				let top = Math.min(Math.max(cont.offsetTop - offset,0), listelement.scrollHeight - listelement.offsetHeight);
				listelement.scrollTop += (top - listelement.scrollTop) / 8;
				onScroll();
				if (Math.abs(listelement.scrollTop - Math.round(top)) > 10) {
					requestAnimationFrame(scroll);
				}else {
					fn(list, id, cont);
				}
			}
			requestAnimationFrame(scroll);
		}
	}

	listObject = {
		element: listelement,
		addItem: additem,
		removeItem: removeitem,
		updateItem: updateitem,
		getItemData: getitemdata,
		clearItems: clearitems,
		setDirection: setdirection,
		getElement: getelement,
		getList: getlist,
		scrollToItem: scrolltoitem,
		setScrollHook: setscrollhook,
		getListElement: getListElement,
		getListElementIndex: getListElementIndex
	};

	return listObject;
}

function createLazyList(elemtype = "div",innertype = "div") {
	let list = [];
	let listelement = document.createElement(elemtype);
	listelement.style.overflow = "auto";
	// Keyboard item selection support
	addKeyboardListSelectionSupport(listelement);

	let itemgenerator = function(list,index,element) {};
	let itemupdater = function(list,index,element) {};
	let getsize = function(list,index) {};


	function setitemgenerator(f) {
		itemgenerator = f;
	}
	function setitemupdater(f) {
		itemupdater = f;
	}
	function setgetsize(f) {
		getsize = f;
	}
	function setlist(l) {
		list = l;
		init();
	}

	function init() {
		elements = {};
		listelement.innerHTML = "";
		list.forEach(function(i,idx) {
			let size = getsize(list,idx);
			let element = document.createElement(innertype);
			element.tabIndex = "0";
			element.style.height = size + "px"; //Assumed size, will be removed when element loads.
			listelement.appendChild(element);
			let viewobserver = new IntersectionObserver(onintersection, {root: null, threshold: 0})
			let loaded = false;
			viewobserver.observe(element);
			function onintersection(entries, opts){
				entries.forEach(function (entry) {
					let visible = entry.isIntersecting;
					if (visible) {
						if (loaded == false) {
							viewobserver.unobserve(element);
							element.style.height = "";
							itemgenerator(list, idx, element);
							loaded = true;
							itemupdater(list, idx, element);
						}
					}
				})
			}
		});
	}

	function updateitem(index = -1) {
		if (index > 0) {
			itemupdater(list, index, listelement.children[index]);
		}else {
			list.forEach(function(i,idx) {
				itemupdater(list, idx, listelement.children[idx]);
			});
		}
	}

	return {
		element: listelement,
		setList: setlist,
		setItemGenerator: setitemgenerator,
		setItemUpdater: setitemupdater,
		setGetSize: setgetsize,
		updateItem: updateitem
	}
}

function getpfp(url,fallback = "person.svg") {
	if (url) {
		if (url.trim() == "") {
			return fallback;
		}else {
			return url.replace(/%SERVER%/g,currentServer) + (url.includes("%SERVER%") ? "&type=thumb" : "");
		}
	}else {
		return fallback;
	}
}



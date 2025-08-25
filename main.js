let isTouch = false;

addEventListener("pointerdown", function(event) {
	isTouch = event.pointerType == "touch";
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
	let sd = 1;
	
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
				sd += 0.1;
			}else {
				sd -= 0.1;
				if (sd < 0.1) {
					sd = 0.1;
				}
			}
			zoom();
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
	closebtn.title = "Close";
	bg.appendChild(closebtn);
	closebtn.addEventListener("click",function() {
		bg.click();
	});

	var img = document.createElement("img")
	img.style.background = "white"
	img.src = url;
	img.onload = function() {
		w = img.width;
		h = img.height;
		zoom();
	};
	bg.appendChild(img)
	document.body.appendChild(bg)
	
	function zoom() {
		img.style.width = w * sd + "px";
		img.style.height = h * sd + "px";
		if (w * sd > window.innerWidth) {
			bg.style.justifyContent = "";
		}else {
			bg.style.justifyContent = "center";
		}
		if (h * sd > window.innerHeight) {
			bg.style.alignItems = "";
		}else {
			bg.style.alignItems = "center";
		}
	}
    
	bg.focus();
	return bg;
}

let currentServer = "";

// Add load event listener and add delay so splash is visible
window.onload = function loaded() {setTimeout(init,1000);};

// Start the app
function init() {
let logininfo = {};
let currentuser = {};
let chats = []
let reactionemojis = ["👍","👎","😃","😂","👏","😭","💛","🤔","🎉","🔥", "💀","😘","😐","😡","👌","😆","😱","😋"];
let cachedinfo = {};
let idcallbacks = {};

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
					res.text().then((text) => {
						//Yay! now we attempt to parse it then callback all of them
						let info = JSON.parse(text);
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
		fetch(currentServer + "addhook", {body: JSON.stringify({'token': logininfo.token, "ids": ["user:" + userid]}), method: "POST"});
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
	title.innerText = "Welcome To Pamukky!"
	connectcnt.appendChild(title);
	let infoLabel = document.createElement("label");
	infoLabel.innerText = "Enter server URL to begin:\n"
	connectcnt.appendChild(infoLabel);
	let serverInput = document.createElement("input");
	serverInput.placeholder = "URL or IP address";
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
	connectButton.innerText = "Connect"
	connectButton.style.width = "100%";
	connectcnt.appendChild(connectButton);
	document.body.appendChild(connectcnt);
	addRipple(connectButton,"rgba(255,200,0,0.6)");
	
	if (err) {
		errorLabel.innerText = "Connection failed."
	}
	
	connectButton.addEventListener("click",function() {
		connectButton.disabled = true;
		errorLabel.classList.remove("errorlabel");
		errorLabel.classList.add("infolabel");
		errorLabel.innerText = "Please wait...";
		
		fetch(serverInput.value + "ping").then((res) => {
			if (res.ok) {
				res.text().then((text) => {
					console.log(text); //debug, usually just "Pong"
					currentServer = serverInput.value;
					localStorage.setItem("server", serverInput.value); // Save the server url to localStorage.
					openLoginArea();
				})
			}else {
				connectButton.disabled = false;
			}
		}).catch(() => {
			connectButton.disabled = false;
			errorLabel.classList.add("errorlabel");
			errorLabel.classList.remove("infolabel");
			errorLabel.innerText = "Connection failed."
		})
	})
}

function openLoginArea() {
	document.title = "Pamukky";
	document.body.innerHTML = "";
	let logincnt = document.createElement("centeredPopup");
	let title = document.createElement("h1");
	title.innerText = "Welcome To Pamukky!"
	logincnt.appendChild(title);
	let infoLabel = document.createElement("label");
	infoLabel.innerText = "Login to this Pamukky server:\n"
	logincnt.appendChild(infoLabel);
	let emailLabel = document.createElement("input");
	emailLabel.placeholder = "E-Mail";
	emailLabel.style.display = "block";
	emailLabel.style.width = "100%";
	emailLabel.style.marginTop = "5px";
	emailLabel.type = "email";
	emailLabel.style.marginBottom = "5px";
	logincnt.appendChild(emailLabel);
	let passwordLabel = document.createElement("input");
	passwordLabel.placeholder = "Password";
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
	loginbutton.innerText = "Login"
	loginbutton.style.width = "100%";
	logincnt.appendChild(loginbutton);
	document.body.appendChild(logincnt);
	let registerButton = document.createElement("button")
	registerButton.innerText = "Register"
	registerButton.style.width = "100%";
	logincnt.appendChild(registerButton);
	let backToConnectButton = document.createElement("button")
	backToConnectButton.innerText = "Connect to other server..."
	backToConnectButton.style.width = "100%";
	logincnt.appendChild(backToConnectButton);
	document.body.appendChild(logincnt);
	addRipple(loginbutton,"rgba(255,200,0,0.6)");
	addRipple(registerButton,"rgba(255,200,0,0.6)");
	addRipple(backToConnectButton,"rgba(255,200,0,0.6)");
	
	loginbutton.addEventListener("click",function() {
		loginbutton.disabled = true;
		registerButton.disabled = true;
		
		fetch(currentServer + "login", {body: JSON.stringify({'email': emailLabel.value,'password': passwordLabel.value}),method: 'POST'}).then((res) => {
			if (res.ok) {
				res.text().then((text) => {
					logininfo = JSON.parse(text);
					localStorage.setItem("logininfo", text);
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
	
	registerButton.addEventListener("click",function() {
		loginbutton.disabled = true;
		registerButton.disabled = true;
		
		fetch(currentServer + "signup", {body: JSON.stringify({'email': emailLabel.value,'password': passwordLabel.value}),method: 'POST'}).then((res) => {
			if (res.ok) {
				res.text().then((text) => {
					logininfo = JSON.parse(text);
					localStorage.setItem("logininfo", text);
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
			playedAudio = null
		}
		playedAudio = new Audio(path);
		playedAudio.play();
		playedAudioPath = path;
		playedAudioChat = chatid;
		updateAudioBar();
	}

	Notification.requestPermission();

	document.body.innerHTML = "";
	let maincont = document.createElement("main");
	let leftArea = document.createElement("leftarea");
	let leftTitleBar = document.createElement("titlebar");
	let rightArea = document.createElement("rightarea");

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
						callback(info.name + " pinned a message.");
						break;
					case "UNPINNEDMESSAGE":
						callback(info.name + " unpinned a message.");
						break;
					case "EDITGROUP":
						callback(info.name + " edited this group.");
						break;
					case "JOINGROUP":
						callback(info.name + " joined, say hi!");
						break;
					case "LEFTGROUP":
						callback(info.name + " left...");
						break;
					
				}
			})
		}else {
			callback("Some action was done here.");
		}
	}

	function viewInfo(id,type) {
		let diag = opendialog();
		diag.title.innerText = "Info";
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

						fetch(currentServer + "getonline", {body: JSON.stringify({'token': logininfo.token, 'uid': id}),method: 'POST'}).then((res) => {
							if (res.ok) {
								res.text().then((text) => {
									infotxt.classList.remove("loading");
									if (text == "Online") {
										infotxt.innerText = "Online";
									}else {
										let dt = new Date(text);
										infotxt.innerText = "Last Online: " + dt.getDate() + "/" + (dt.getMonth() + 1) + "/" + dt.getFullYear() + ", " + dt.getHours().toString().padStart(2, '0') + ":" + dt.getMinutes().toString().padStart(2, '0');
									}
								})
							}
						});
						
						let namerow = document.createElement("tr");
						let namettl = document.createElement("td");
						namettl.innerText = "Name";
						namettl.style.fontWeight = "bold";
						namerow.appendChild(namettl);
						let nameval = document.createElement("td");
						nameval.innerText = infod.name;
						namerow.appendChild(nameval);

						let desrow = document.createElement("tr");
						let desttl = document.createElement("td");
						desttl.style.fontWeight = "bold";
						desttl.innerText = "Bio";
						desrow.appendChild(desttl);
						let desval = document.createElement("td");
						desval.innerText = infod.bio;
						desrow.appendChild(desval);

						infotable.appendChild(namerow);
						infotable.appendChild(desrow);

					})
				}else {
					diag.inner.innerText = "Error";
				}
			}).catch(function() {
				diag.inner.innerText = "Error";
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
						pfpimge.title = "Click here to upload";
						pfpimge.src = getpfp(infod.picture,"group.svg");
						pfpimge.addEventListener("click",function () {f.click();})
						
						infotxt.innerText = id;
						infotxt.classList.remove("loading");

						let namerow = document.createElement("tr");
						let namettl = document.createElement("td");
						namettl.innerText = "Name";
						namerow.appendChild(namettl);
						let nameval = document.createElement("td");
						let nameinp = document.createElement("input");
						nameinp.value = infod.name;
						nameval.appendChild(nameinp);
						namerow.appendChild(nameval);
						infotable.appendChild(namerow);
						
						let desrow = document.createElement("tr");
						let desttl = document.createElement("td");
						desttl.innerText = "Description";
						desrow.appendChild(desttl);
						let desval = document.createElement("td");
						let desinp = document.createElement("input");
						desinp.value = infod.info;
						desval.appendChild(desinp);
						desrow.appendChild(desval);
						infotable.appendChild(desrow);

						let pubrow = document.createElement("tr");
						let pubttl = document.createElement("td");
						pubttl.innerText = "Public";
						pubrow.appendChild(pubttl);
						let pubval = document.createElement("td");
						let pubinp = document.createElement("input");
						pubinp.type = "checkbox";
						pubinp.checked = infod.isPublic;
						pubval.appendChild(pubinp);
						pubrow.appendChild(pubval);
						infotable.appendChild(pubrow);
						
						let roles = {};
						let crole = {};
						fetch(currentServer + "getgrouprole", {body: JSON.stringify({'token': logininfo.token, 'groupid': id}),method: 'POST'}).then((res) => {
							if (res.ok) {
								res.text().then((text) => {
									crole = JSON.parse(text);
									if (crole.AllowEditingSettings == true) {
										let editrolesbtn = document.createElement("button");
										editrolesbtn.innerText = "Edit roles";
										editrolesbtn.addEventListener("click",function() {
											let diaga = opendialog();
											diaga.title.innerText = "Edit roles";
											diaga.inner.style.display = "flex";
											diaga.inner.style.flexDirection = "column";
											diaga.inner.style.alignItems = "center";

											fetch(currentServer + "getgrouproles", {body: JSON.stringify({'token': logininfo.token, 'groupid': id}),method: 'POST'}).then((res) => {
												if (res.ok) {
													res.text().then((text) => {
														roles = JSON.parse(text);
														rokeys = Object.keys(roles);

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
						membersbtn.innerText = "Members";
						membersbtn.addEventListener("click",function() {
							let users = {};
							let rokeys = {};
							let diag = opendialog();
							diag.inner.style.overflow = "hidden";
							diag.inner.style.display = "flex";
							diag.inner.style.flexDirection = "column";
							diag.title.innerText = "Members";
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
									userpfp.title = "View profile of " + uii.name;
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
									roleselect.title = "Change role of this user";
									roleselect.style.width = "100%";
									rokeys.forEach(function(i) {
										let opt = document.createElement("option");
										opt.value = i;
										opt.innerText = i;
										roleselect.appendChild(opt);
									})
									roleselect.value = user.role;
									roleselect.addEventListener("change",function() {
										//alert("wait..")
										fetch(currentServer + "edituser", {body: JSON.stringify({'token': logininfo.token, 'groupid': id, 'userid': user.userID, 'role': roleselect.value }),method: 'POST'}).then((res) => {
											if (res.ok) {
												res.text().then((text) => {

												})
											}else {

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
										kickbtn.title = "Kick";
										kickbtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px"><path d="M640-520v-80h240v80H640Zm-280 40q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47ZM40-160v-112q0-34 17.5-62.5T104-378q62-31 126-46.5T360-440q66 0 130 15.5T616-378q29 15 46.5 43.5T680-272v112H40Zm80-80h480v-32q0-11-5.5-20T580-306q-54-27-109-40.5T360-360q-56 0-111 13.5T140-306q-9 5-14.5 14t-5.5 20v32Zm240-320q33 0 56.5-23.5T440-640q0-33-23.5-56.5T360-720q-33 0-56.5 23.5T280-640q0 33 23.5 56.5T360-560Zm0-80Zm0 400Z"/></svg>';
										kickbtn.addEventListener("click",function() {
											if (confirm("Do you really want to kick this user?")) {
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
										banbtn.title = "Ban";
										banbtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="M480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q54 0 104-17.5t92-50.5L228-676q-33 42-50.5 92T160-480q0 134 93 227t227 93Zm252-124q33-42 50.5-92T800-480q0-134-93-227t-227-93q-54 0-104 17.5T284-732l448 448Z"/></svg>';
										banbtn.addEventListener("click",function() {
											if (confirm("Do you really want to ban this user?")) {
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
													let cuser = users[logininfo.uid];
													if (cuser) {
														crole = roles[cuser.role];
													}
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
						bannedusersbtn.innerText = "Banned members";
						bannedusersbtn.addEventListener("click",function() {
							let users = {};
							let rokeys = {};
							let diag = opendialog();
							diag.inner.style.overflow = "hidden";
							diag.inner.style.display = "flex";
							diag.inner.style.flexDirection = "column";
							diag.title.innerText = "Banned members";
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
									userpfp.title = "View profile of " + uii.name;
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
									unbanbtn.title = "Unban";
									unbanbtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z"/></svg>';
									unbanbtn.addEventListener("click",function() {
										if (confirm("Do you really want to unban this user?")) {
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
									});
								}
							});
						})
						diag.inner.appendChild(bannedusersbtn);

						
						let savebtn = document.createElement("button");
						savebtn.innerText = "Save";
						savebtn.addEventListener("click",function() {
							if (ufl) {
								fetch(currentServer + "upload", {headers: {'token': logininfo.token},method: 'POST',body: file}).then(function(response) { response.json().then(function(data) {
									ufl = false;
									if (data.status == "success") {
										fetch(currentServer + "editgroup", {body: JSON.stringify({'token': logininfo.token, 'groupid': id, 'name': nameinp.value, 'picture': data.url, 'info': desinp.value, 'roles': roles, 'ispublic': pubinp.checked }),method: 'POST'}).then((res) => {
											if (res.ok) {

											}else {
												
											}
										})
									}
								})}).catch(function(error) {console.error(error);});
							}else {
								fetch(currentServer + "editgroup", {body: JSON.stringify({'token': logininfo.token, 'groupid': id, 'name': nameinp.value, 'picture': infod.picture, 'info': desinp.value, 'roles': roles, 'ispublic': pubinp.checked }),method: 'POST'}).then((res) => {
									if (res.ok) {

									}else {
										
									}
								})
							}
						})

						let leavebtn = document.createElement("button");
						leavebtn.innerText = "Leave";
						leavebtn.addEventListener("click",function() {
							if (confirm("Do you really want to leave this group?\nIf you are the owner, promote someone else as the owner BEFORE leaving the group.")) {
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
					diag.inner.innerText = "Error";
				}
			}).catch(function() {
				diag.inner.innerText = "Error";
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
		let tflex = document.createElement("div");
		tflex.style.display = "flex";
		tflex.style.alignItems = "center";
		tflex.style.flexShrink = "0";
		let titlelbl = document.createElement("h4");
		titlelbl.innerText = "Dialog";
		titlelbl.style.marginRight = "auto";
		
		let closed = false;

		let closebtn = document.createElement("button");
		addRipple(closebtn,"rgba(255,200,0,0.6)");
		closebtn.title = "Close";
		closebtn.style.flexShrink = "0";
		closebtn.style.width = "25px";
		closebtn.style.height = "25px";
		closebtn.style.padding = "0";
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
		addRipple(dockbtn,"rgba(255,200,0,0.6)");
		dockbtn.title = "Dock to right";
		dockbtn.style.flexShrink = "0";
		dockbtn.style.width = "25px";
		dockbtn.style.height = "25px";
		dockbtn.style.padding = "0";
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
		
		tflex.appendChild(titlelbl);
		if (document.body.clientWidth > 1200) {tflex.appendChild(dockbtn)};
		tflex.appendChild(closebtn);
		dialoginside.appendChild(tflex);
		let innercont = document.createElement("div");
		innercont.style.overflow = "auto";
		innercont.style.minWidth = "100%";
		innercont.style.flexGrow = "1";
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

	function openmenu(menuitems, element) {
		activePopupCount++;
		inertMainUI();
		
		let popupmenu = document.createElement("div");
		popupmenu.classList.add("popupmenu");
		popupmenu.tabIndex = "0";

		let rect = element.getBoundingClientRect();
		popupmenu.style.top = rect.top + rect.height + "px";
		popupmenu.style.left = rect.left + "px";

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
			addRipple(menuitem,"rgba(255,200,0,0.6)");
			popupmenu.appendChild(menuitem);

			menuitem.addEventListener("click",function() {
				close();
				item.callback();
			})
		});
		
		let closed = false;
		function close() {
			if (closed) return;
			closed = true;

			activePopupCount--;
			inertMainUI();

			//popupmenu.style.maxHeight = "0px";
			popupmenu.style.opacity = "";
			
			maincont.removeEventListener("pointerdown", close);

			setTimeout(function() {
				popupmenu.remove();
			},200)
		}

		document.body.appendChild(popupmenu);
		popupmenu.focus();
		requestAnimationFrame(function() {
			let popuprect = popupmenu.getBoundingClientRect();
			if (popuprect.width + popuprect.left > document.body.clientWidth) {
				popupmenu.style.left = "";
				popupmenu.style.right = (document.body.clientWidth - rect.right) + "px";
			}
			popupmenu.style.opacity = "1";
			//popupmenu.style.maxHeight = "calc(100% - " + popupmenu.style.top + ")";
		});
		maincont.addEventListener("pointerdown", close);
		popupmenu.addEventListener("keydown",function(e) {
			if (e.key == "Escape") close();
		})
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
								let val = json[key];
								if (val.hasOwnProperty("online") && val["online"] != null) {
									updateOnlineHook(uid, val["online"]);
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
	let currentchatid = 0;
	function openchat(chatid) {
		let infoid = "0";
		let type;
		if (chatid.includes("-")) {
			let spl = chatid.split("-");
			if (spl[0] != logininfo.uid) {
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
		addRipple(itmcont,"rgba(255,200,0,0.6)");
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
					let dtt = new Date(msg.sendTime);
					let nowdate = new Date();
					//try {
					if (dtt.setHours(0,0,0,0) == nowdate.setHours(0,0,0,0)) {
						lmt.innerText = dt.getHours().toString().padStart(2, '0') + ":" + dt.getMinutes().toString().padStart(2, '0');
					}else {
						lmt.innerText = dt.getDate() + "/" + (dt.getMonth() + 1) + "/" + dt.getFullYear() + " " + dt.getHours().toString().padStart(2, '0') + ":" + dt.getMinutes().toString().padStart(2, '0');
					}
					lastmsgcontent.innerText = "User: " + msg.content.split("\n")[0];
					if (msg.senderUID == "0") {
						formatSystemMessage(msg.content, function(text) {
							lastmsgcontent.innerText = text;
							lastmsgcontent.classList.remove("loading");
						});
					}else {
						getInfo(msg.senderUID, function(sender) {
							lastmsgcontent.innerText = sender.name + ": " + msg.content.split("\n")[0];
							lastmsgcontent.classList.remove("loading");
						});
					}
				}else {
					lastmsgcontent.innerText = "No Messages. Send one to start conversation.";
					lmt.style.display = "none";
				}
			}
			lmt.classList.remove("loading");
			lastmsgcontent.classList.remove("loading");
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
		if (index == 0) {
			let rfb = document.createElement("button");
			rfb.addEventListener("click",function() {
				loadchats();
			})
			rfb.innerText = "Refresh"
			element.appendChild(rfb);
			return;
		}
		if (index == list.length - 1) {
			let fabhint = document.createElement("label");
			fabhint.style.display = "block";
			fabhint.style.margin = "8px";
			fabhint.innerText = "Click on the \"+\" button to add a new chat.";
			element.appendChild(fabhint);
			return;
		}
		let item = list[index];
		if (item == undefined) return;

		let itmbtn = document.createElement("button");
		element.appendChild(itmbtn);

		let id = item["chatid"] ?? item.group;
		chatsListItemGenerator(item, itmbtn);

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
	fab.title = "Add new chat";
	fab.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" height="40" viewBox="0 -960 960 960" width="40"><path d="M446.667-446.667H200v-66.666h246.667V-760h66.666v246.667H760v66.666H513.333V-200h-66.666v-246.667Z"/></svg>';
	leftArea.appendChild(fab);
	let profilebtn = document.createElement("button");
	profilebtn.title = "Edit profile...";
	profilebtn.style.height = "100%";
	profilebtn.classList.add("transparentbtn")
	profilebtn.style.display = "flex";
	profilebtn.style.alignItems = "center";
	addRipple(profilebtn,"rgba(255,200,0,0.6)");

	let pfpimg = document.createElement("img");
	pfpimg.classList.add("circleimg")
	profilebtn.appendChild(pfpimg);
	let namelbl = document.createElement("label");
	namelbl.style.cursor = "pointer";
	namelbl.style.margin = "8px";
	profilebtn.appendChild(namelbl);
	
	fab.addEventListener("click",function() {
		let diag = opendialog();
		diag.title.innerText = "Add chat";
		diag.inner.style.display = "flex";
		diag.inner.style.flexDirection = "column";
		diag.inner.style.alignItems = "center";
		
		let tinput = document.createElement("input");
		tinput.style.width = "100%";
		diag.inner.appendChild(tinput);
		
		let bflex = document.createElement("div");
		bflex.style.display = "flex";
		diag.inner.appendChild(bflex);
		
		let adduserchatbtn = document.createElement("button");
		adduserchatbtn.innerText = "Add user chat";
		adduserchatbtn.addEventListener("click",function() {
			fetch(currentServer + "adduserchat", {body: JSON.stringify({'token': logininfo.token,'email': tinput.value}),method: 'POST'}).then((res) => {
				if (res.ok) {
					res.text().then((text) => {
						diag.closebtn.click();
					})
				}
			})
		})
		bflex.appendChild(adduserchatbtn);
		
		let creategroupbtn = document.createElement("button");
		creategroupbtn.innerText = "Create group...";
		creategroupbtn.addEventListener("click",function() {
			let f = document.createElement('input');
			f.type='file';
			f.accept = 'image/*';
			
			let ufl = false;
			let file;
			
			let diaga = opendialog();
			diaga.title.innerText = "Create group";
			diaga.inner.style.display = "flex";
			diaga.inner.style.flexDirection = "column";
			diaga.inner.style.alignItems = "center";
			
			let pfpimge = document.createElement("img");
			pfpimge.classList.add("circleimg");
			pfpimge.style.width = "80px";
			pfpimge.style.height = "80px";
			pfpimge.style.cursor = "pointer";
			pfpimge.title = "Click here to upload";
			//pfpimge.src = currentuser.picture.replace(/%SERVER%/g,currserver);
			pfpimge.addEventListener("click",function () {f.click();})
			diaga.inner.appendChild(pfpimge);
			
			let infotable = document.createElement("table");
			
			let namerow = document.createElement("tr");
			let namettl = document.createElement("td");
			namettl.innerText = "Name";
			namerow.appendChild(namettl);
			let nameval = document.createElement("td");
			let nameinp = document.createElement("input");
			nameinp.value = "New group";
			nameval.appendChild(nameinp);
			namerow.appendChild(nameval);
			infotable.appendChild(namerow);
			
			let desrow = document.createElement("tr");
			let desttl = document.createElement("td");
			desttl.innerText = "Description";
			desrow.appendChild(desttl);
			let desval = document.createElement("td");
			let desinp = document.createElement("input");
			desinp.value = "This is my new group!";
			desval.appendChild(desinp);
			desrow.appendChild(desval);
			infotable.appendChild(desrow);
			diaga.inner.appendChild(infotable);
			
			let bflex = document.createElement("div");
			bflex.style.display = "flex";
			diaga.inner.appendChild(bflex);
			
			let createbtn = document.createElement("button");
			createbtn.innerText = "Create group";
			createbtn.addEventListener("click",function() {
				if (ufl) {
					fetch(currentServer + "upload", {headers: {'token': logininfo.token},method: 'POST',body: file}).then(function(response) { response.json().then(function(data) {
						if (data.status == "success") {
							fetch(currentServer + "creategroup", {body: JSON.stringify({'token': logininfo.token, 'name': nameinp.value, 'picture': data.url, 'info': desinp.value }),method: 'POST'}).then((res) => {
								diag.closebtn.click();
								diaga.closebtn.click();
							})
						}
					})}).catch(function(error) {console.error(error);});
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
		joingroupbtn.innerText = "Join group";
		joingroupbtn.addEventListener("click",function() {
			fetch(currentServer + "joingroup", {body: JSON.stringify({'token': logininfo.token,'groupid': tinput.value}),method: 'POST'}).then((res) => {
				if (res.ok) {
					diag.closebtn.click();
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
		diag.title.innerText = "Edit profile";
		diag.inner.style.display = "flex";
		diag.inner.style.flexDirection = "column";
		diag.inner.style.alignItems = "center";
		
		
		let pfpimge = document.createElement("img");
		pfpimge.classList.add("circleimg");
		pfpimge.style.width = "80px";
		pfpimge.style.height = "80px";
		pfpimge.style.cursor = "pointer";
		pfpimge.title = "Click here to upload";
		pfpimge.src = getpfp(currentuser.picture);
		pfpimge.addEventListener("click",function () {f.click();})
		diag.inner.appendChild(pfpimge);
		
		let infotable = document.createElement("table");
		let namerow = document.createElement("tr");
		let namettl = document.createElement("td");
		namettl.innerText = "Name";
		namerow.appendChild(namettl);
		let nameval = document.createElement("td");
		let nameinp = document.createElement("input");
		nameinp.value = currentuser.name;
		nameval.appendChild(nameinp);
		namerow.appendChild(nameval);
		
		let desrow = document.createElement("tr");
		let desttl = document.createElement("td");
		desttl.innerText = "Bio";
		desrow.appendChild(desttl);
		let desval = document.createElement("td");
		let desinp = document.createElement("input");
		desinp.value = currentuser.bio;
		desval.appendChild(desinp);
		desrow.appendChild(desval);
		
		
		infotable.appendChild(namerow);
		infotable.appendChild(desrow);
		diag.inner.appendChild(infotable);
		
		let cpass = document.createElement("button");
		cpass.innerText = "Change password";
		cpass.addEventListener("click",function() {
			let diag = opendialog();
			diag.title.innerText = "Change password";
			diag.inner.style.display = "flex";
			diag.inner.style.flexDirection = "column";
			diag.inner.style.alignItems = "center";
			let cpasstable = document.createElement("table");
			let opr = document.createElement("tr");
			let pprt = document.createElement("td");
			pprt.innerText = "Old password";
			opr.appendChild(pprt);
			let oprv = document.createElement("td");
			let oprinp = document.createElement("input");
			oprinp.type = "password";
			oprv.appendChild(oprinp);
			opr.appendChild(oprv);
			
			let npr = document.createElement("tr");
			let npt = document.createElement("td");
			npt.innerText = "New password";
			npr.appendChild(npt);
			let nprv = document.createElement("td");
			let nprinp = document.createElement("input");
			nprinp.type = "password";
			nprv.appendChild(nprinp);
			npr.appendChild(nprv);
			
			let npc = document.createElement("tr");
			let npcc = document.createElement("td");
			npcc.innerText = "Confirm password";
			npc.appendChild(npcc);
			let nprc = document.createElement("td");
			let npcinp = document.createElement("input");
			npcinp.type = "password";
			nprc.appendChild(npcinp);
			npc.appendChild(nprc);
			
			
			cpasstable.appendChild(opr);
			cpasstable.appendChild(npr);
			cpasstable.appendChild(npc);
			diag.inner.appendChild(cpasstable);
			
			let changebtn = document.createElement("button");
			changebtn.innerText = "Change";
			changebtn.addEventListener("click",function() {
				if (npcinp.value != nprinp.value) {
					alert("New and Confirm doesnt match!");
					return;
				}
				fetch(currentServer + "changepassword", {body: JSON.stringify({'token': logininfo.token, 'oldpassword': oprinp.value, 'password': nprinp.value  }),method: 'POST'}).then((res) => {
					res.text().then((text) => {
						
						info = JSON.parse(text);
						if (info["status"] == "error") {
							alert(text);
							return;
						}
						//logininfo = info;
						alert("Password changed!");
					})
				})
			});
			diag.inner.appendChild(changebtn);
		})
		diag.inner.appendChild(cpass);
		
		let savebtn = document.createElement("button");
		savebtn.innerText = "Save";
		savebtn.addEventListener("click",function() {
			if (ufl) {
				fetch(currentServer + "upload", {headers: {'token': logininfo.token},method: 'POST',body: file}).then(function(response) { response.json().then(function(data) {
					if (data.status == "success") {
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
				})}).catch(function(error) {console.error(error);});
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
		lout.innerText = "Logout";
		lout.addEventListener("click",function() {
			fetch(currentServer + "logout", {body: JSON.stringify({'token': logininfo.token}),method: 'POST'}).then((res) => {
				if (res.ok) {
					localStorage.setItem("logininfo", null);
					location.reload();
				}
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
		getInfo(logininfo.uid, (info) => {
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
		fetch(currentServer + "addhook", {body: JSON.stringify({'token': logininfo.token, "ids": ["chatslist"]}), method: "POST"});
	})


	function createChatView(chatid,ugid) {
		let menuspawned = false;
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
		let mchat = document.createElement("mchat");
		let titlebar = document.createElement("titlebar");
		let backbtn = document.createElement("button");
		addRipple(backbtn,"rgba(255,200,0,0.6)");
		backbtn.title = "Back";
		backbtn.classList.add("cb")
		backbtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 -960 960 960" width="20"><path d="M384-96 0-480l384-384 68 68-316 316 316 316-68 68Z"/></svg>';
		backbtn.style.display = "none";
		titlebar.appendChild(backbtn)
		let pfpimg = document.createElement("img");
		pfpimg.classList.add("circleimg")
		titlebar.appendChild(pfpimg);
		let titletxt = document.createElement("h4");
		titletxt.style.marginLeft = "4px";
		titlebar.appendChild(titletxt);
		let infotxt = document.createElement("label");
		infotxt.style.fontSize = "10px";
		infotxt.style.margin = "6px";
		infotxt.innerText = "loading";
		infotxt.classList.add("loading");
		titlebar.appendChild(infotxt);
		titlebar.appendChild(document.createElement("ma"));
		
		let infobtn = document.createElement("button");
		addRipple(infobtn,"rgba(255,200,0,0.6)");
		infobtn.title = "Info";
		infobtn.classList.add("cb")
		infobtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 -960 960 960" width="20"><path d="M444-288h72v-240h-72v240Zm35.789-312Q495-600 505.5-610.289q10.5-10.29 10.5-25.5Q516-651 505.711-661.5q-10.29-10.5-25.5-10.5Q465-672 454.5-661.711q-10.5 10.29-10.5 25.5Q444-621 454.289-610.5q10.29 10.5 25.5 10.5Zm.487 504Q401-96 331-126q-70-30-122.5-82.5T126-330.958q-30-69.959-30-149.5Q96-560 126-629.5t82.5-122Q261-804 330.958-834q69.959-30 149.5-30Q560-864 629.5-834t122 82.5Q804-699 834-629.276q30 69.725 30 149Q864-401 834-331q-30 70-82.5 122.5T629.276-126q-69.725 30-149 30ZM480-168q130 0 221-91t91-221q0-130-91-221t-221-91q-130 0-221 91t-91 221q0 130 91 221t221 91Zm0-312Z"/></svg>';
		infobtn.addEventListener("click",function() {
			viewInfo(ugid,isuserchat ? "user" : "group")
		})
		
		titlebar.appendChild(infobtn);
		let optionsbtn = document.createElement("button");
		addRipple(optionsbtn,"rgba(255,200,0,0.6)");
		optionsbtn.title = "Options";
		optionsbtn.classList.add("cb")
		optionsbtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px"><path d="M479.79-192Q450-192 429-213.21t-21-51Q408-294 429.21-315t51-21Q510-336 531-314.79t21 51Q552-234 530.79-213t-51 21Zm0-216Q450-408 429-429.21t-21-51Q408-510 429.21-531t51-21Q510-552 531-530.79t21 51Q552-450 530.79-429t-51 21Zm0-216Q450-624 429-645.21t-21-51Q408-726 429.21-747t51-21Q510-768 531-746.79t21 51Q552-666 530.79-645t-51 21Z"/></svg>';
		optionsbtn.addEventListener("click",function(e) {
			openmenu([{
				content: "Mute...",
				icon: '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px"><path d="M160-200v-80h80v-280q0-83 50-147.5T420-792v-28q0-25 17.5-42.5T480-880q25 0 42.5 17.5T540-820v28q80 20 130 84.5T720-560v280h80v80H160Zm320-300Zm0 420q-33 0-56.5-23.5T400-160h160q0 33-23.5 56.5T480-80ZM320-280h320v-280q0-66-47-113t-113-47q-66 0-113 47t-47 113v280Z"/></svg>',
				callback: function() {
					openmenu([
						{
							content: mutedchats.includes(chatid) ? "Unmute for this client" : "Mute for this client",
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
							content: servermutedchats.hasOwnProperty(chatid) ? "Unmute for this account" : "Mute for this account",
							icon: servermutedchats.hasOwnProperty(chatid) ? '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px"><path d="M160-200v-80h80v-280q0-33 8.5-65t25.5-61l60 60q-7 16-10.5 32.5T320-560v280h248L56-792l56-56 736 736-56 56-146-144H160Zm560-154-80-80v-126q0-66-47-113t-113-47q-26 0-50 8t-44 24l-58-58q20-16 43-28t49-18v-28q0-25 17.5-42.5T480-880q25 0 42.5 17.5T540-820v28q80 20 130 84.5T720-560v206Zm-276-50Zm36 324q-33 0-56.5-23.5T400-160h160q0 33-23.5 56.5T480-80Zm33-481Z"/></svg>' : '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px"><path d="M160-200v-80h80v-280q0-83 50-147.5T420-792v-28q0-25 17.5-42.5T480-880q25 0 42.5 17.5T540-820v28q80 20 130 84.5T720-560v280h80v80H160Zm320-300Zm0 420q-33 0-56.5-23.5T400-160h160q0 33-23.5 56.5T480-80ZM320-280h320v-280q0-66-47-113t-113-47q-66 0-113 47t-47 113v280Z"/></svg>',
							callback: function() {
								fetch(currentServer + "mutechat", {body: JSON.stringify({'token': logininfo.token, 'chatid': chatid, 'toggle': !servermutedchats.hasOwnProperty(chatid)}),method: 'POST'}).then((res) => {
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
		mchat.appendChild(titlebar);


		let messageslist = createDynamicList("messageslist","msgcont");
		messageslist.setDirection(-1);
		/*messageslist.element.addEventListener("scroll", function() {
			messageslist.updateItem();
		});*/
		let pinnedmessageslist = createDynamicList("messageslist","msgcont");
		pinnedmessageslist.element.style.display = "none";

		let pinnedbar = document.createElement("pinbar");
		pinnedbar.style.display = "none";
		let mpint = document.createElement("button");
		mpint.classList.add("replycont");
		mpint.style.height = "58px";
		addRipple(mpint,"rgba(255,200,0,0.6)");
		pinnedbar.appendChild(mpint);
		mpint.addEventListener("click",function() {
			let k = Object.keys(pinnedmessages);
			if (pinnedmessageslist.element.style.display == "") {
				pinsbtn.click();
			}
			showmessage(k[k.length - 1]);
		});
		let pinsbtn = document.createElement("button");
		pinsbtn.title = "Pinned messages";
		addRipple(pinsbtn,"rgba(255,200,0,0.6)");
		pinsbtn.classList.add("cb")
		pinsbtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="#000000"><path d="M624-744v264l85 85q5 5 8 11.5t3 14.5v20.81q0 15.38-10.35 25.79Q699.3-312 684-312H516v222q0 15.3-10.29 25.65Q495.42-54 480.21-54T454.5-64.35Q444-74.7 444-90v-222H276q-15.3 0-25.65-10.4Q240-332.81 240-348.19V-369q0-8 3-14.5t8-11.5l85-85v-264h-12q-15.3 0-25.65-10.29Q288-764.58 288-779.79t10.35-25.71Q308.7-816 324-816h312q15.3 0 25.65 10.29Q672-795.42 672-780.21t-10.35 25.71Q651.3-744 636-744h-12Z"/></svg>';
		pinnedbar.appendChild(pinsbtn);
		mchat.appendChild(pinnedbar);


		pinsbtn.addEventListener("click",function() {
			if (messageslist.element.style.display == "") {
				pinnedmessageslist.element.style.display = "";
				messageslist.element.style.display = "none";
				mgb.style.display = "none";
			}else {
				pinnedmessageslist.element.style.display = "none";
				messageslist.element.style.display = "";
				if (crole.AllowSending == true) {
					mgb.style.display = "";
				}else {
					mgb.style.display = "none";
				}
			}
		});

		let pinsender = document.createElement("b");
		let pincontent = document.createElement("label");
		mpint.appendChild(pinsender);
		mpint.appendChild(pincontent);
		function updatepinnedbar() {
			let k = Object.keys(pinnedmessages);
			if (k.length > 0) {
				if (pinnedbar.style.display == "none") { //FIXME
					messageslist.element.scrollTop += 56;
				}
				pinnedbar.style.display = "";
				let msg = pinnedmessages[k[k.length - 1]];
				if (msg.senderUID == "0") {
					pincontent.innerText = "Pamuk is here!";
					formatSystemMessage(msg.content, function(text) {
						pincontent.innerText = text;
					})
				}else {
					pincontent.innerText = msg.content;
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
		
		mchat.appendChild(pinnedmessageslist.element);
		mchat.appendChild(messageslist.element);

		
		let mgb = document.createElement("msgbar");
		let rc = document.createElement("button");
		rc.classList.add("replycont");
		addRipple(rc,"rgba(255,200,0,0.6)");
		rc.addEventListener("click",function() {
			rc.style.display = "none";
			replymsgid = undefined;
		})
		let replysname = document.createElement("b");
		
		rc.appendChild(replysname);
		let replycnt = document.createElement("label");
		
		rc.appendChild(replycnt);
		mgb.appendChild(rc);
		
		function uploadfile(file) {
			let reader = new FileReader();
			reader.onload = function (e) { 
				ufl = true;
				let att = document.createElement("uploaditm");
				let ui = document.createElement("div");
				let rb = document.createElement("button")
				rb.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="#000000"><path d="m291-240-51-51 189-189-189-189 51-51 189 189 189-189 51 51-189 189 189 189-51 51-189-189-189 189Z"/></svg>';
				let img = document.createElement("img");
				img.style.background = "white";
				let imgs = new Image();
				imgs.src = reader.result;
				/*if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
					// dark mode
					img.src = "file_dark.svg";
				}else {
					img.src = "file.svg";
				}*/
				img.classList.add("msgimg");
				imgs.onload = function() {
					img.src = imgs.src;
				}
				ui.appendChild(img)
				att.appendChild(ui);
				att.appendChild(rb);
				atc.appendChild(att);
				fileslist.push(file);
				rb.addEventListener("click",function() {
					const index = fileslist.indexOf(file);
					if (index > -1) {
						fileslist.splice(index, 1);
						if (fileslist.length > 0) {
							sendbtn.disabled = false;
						}else {
							sendbtn.disabled = true;
						}
					}
					atc.removeChild(att);
				})
				sendbtn.disabled = false;
			};

			reader.readAsDataURL(file); 
		}
		
		let atc = document.createElement("attachmentscont");
		mgb.appendChild(atc);
		f.onchange = function() {
			if (f.files) {
				Array.prototype.forEach.call(f.files,function(i) {
					uploadfile(i);
				})
			}
			
		}
		
		rc.style.display = "none";
		
		mchat.addEventListener('dragover', (e) => {
			e.preventDefault()
		});
		mchat.addEventListener('drop', (e) => {
			Array.prototype.forEach.call(e.dataTransfer.files,function(i) {
				uploadfile(i);
			});
			e.preventDefault()
		});
		
		mchat.addEventListener("paste", async e => {
			
			if (!e.clipboardData.files.length) {
				return;
			}
			if (e.clipboardData.files.length > 0) {
				e.preventDefault();
			}
			
			Array.prototype.forEach.call(e.clipboardData.files,function(i) {
				uploadfile(i);
			});
		});
		
		let mgbd = document.createElement("div");
		let attachbtn = document.createElement("button");
		attachbtn.addEventListener("click", function() {f.click();})
		addRipple(attachbtn,"rgba(255,200,0,0.6)");
		attachbtn.title = "Add attachment";
		attachbtn.classList.add("cb")
		attachbtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24"><path d="M640-520v-200h80v200h-80ZM440-244q-35-10-57.5-39T360-350v-370h80v476Zm30 164q-104 0-177-73t-73-177v-370q0-75 52.5-127.5T400-880q75 0 127.5 52.5T580-700v300h-80v-300q-1-42-29.5-71T400-800q-42 0-71 29t-29 71v370q-1 71 49 120.5T470-160q25 0 47.5-6.5T560-186v89q-21 8-43.5 12.5T470-80Zm170-40v-120H520v-80h120v-120h80v120h120v80H720v120h-80Z"/></svg>';
		mgbd.appendChild(attachbtn)
		let msginput = document.createElement("textarea");
		msginput.style.height = "40px";
		mgbd.appendChild(msginput)
		
		let sendbtn = document.createElement("button");
		addRipple(sendbtn,"rgba(255,200,0,0.6)");
		sendbtn.classList.add("cb");
		sendbtn.title = "Send";
		sendbtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24"><path d="M120-160v-640l760 320-760 320Zm80-120 474-200-474-200v140l240 60-240 60v140Zm0 0v-400 400Z"/></svg>';
		mgbd.appendChild(sendbtn)
		
		mgb.appendChild(mgbd);

		let typinglabel = document.createElement("label");
		typinglabel.classList.add("typinglabel");
		typinglabel.innerText = "Nobody is typing";
		typinglabel.style.opacity = "0";
		mgb.appendChild(typinglabel);

		mchat.appendChild(mgb)
		
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
								joinbtn.innerText = "Join Group";
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
						infotxt.innerText = text + " Members";
					})
				}
			});
		}

		let timemsgid = 0;
		let messagescount = 0;
		let addLoadOlderMessages = true;
		function addmsg(msg,id,order = 1) {
			if (messageslist.getItemData(id)) return;
			if (msg.type != "time") {
				let dt = new Date(msg.sendTime);
				let list = messageslist.getList();
				let keys = Object.keys(list);
				let lastmsg = list[keys[keys.length - 1]];
				let lastmsgtime;
				if (lastmsg) {
					lastmsgtime = new Date(lastmsg.data.sendTime);
				}else {
					lastmsgtime = new Date(0);
				}
				if (dt.setHours(0,0,0,0) != lastmsgtime.setHours(0,0,0,0)) {
					addmsg({
						senderUID: "0",
						content: dt.getDate() + "/" + (dt.getMonth() + 1) + "/" + dt.getFullYear(),
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
				size: (msg.senderUID == logininfo.uid) ? 61 : (msg.senderUID == 0) ? 34 : 68,
				data: msg,
				generator: function(data, element, id) {
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
				size: (msg.senderUID == logininfo.uid) ? 61 : (msg.senderUID == 0) ? 34 : 68,
				data: msg,
				generator: function(data, element, id) {
					createmsg(data, key, element, {pinnedmessageslist: true})
				},
				updater: chatmsgupdater
			});
		}

		function chatmsgupdater(data,element,id) {
			if (selectedMessages.includes(id)) {
				element.style.background = "orange";
			}else {
				element.style.background = "";
			}
			/*let senderStuff = element.getElementsByClassName("sender");
			let listdata = messageslist.getList();
			if (listdata) {
				let keys = Object.keys(listdata);
				let thisMessageIndex = keys.indexOf(id);
				let isLastMessageBySender = true;
				if (thisMessageIndex > -1 && thisMessageIndex + 1 < listdata.length - 1) {
					let nextMessage = listdata[keys[thisMessageIndex + 1]];
					if (nextMessage.data.senderUID == data.senderUID) isLastMessageBySender = false;
				}
				Array.prototype.forEach.call(senderStuff, function(i) {
					if (isLastMessageBySender) {
						i.classList.remove("hidden");
						if (i.tagName.toLowerCase() == "img") {
							if (chatslist.element.scrollTop + chatslist.element.offsetHeight - (element.offsetTop + element.offsetHeight) < 0) {
								i.style.outline = "1px solid orange";
								i.style.top = ((chatslist.element.scrollHeight - (chatslist.element.scrollTop + chatslist.element.offsetHeight)) - (element.offsetParent.offsetHeight - element.offsetParent.scrollTop - element.offsetTop - element.offsetHeight)) + "px";
							}else {
								i.style.outline = "";
								i.style.bottom = "16px";
							}
						}
					}else {
						i.classList.add("hidden");
					}
				});
			}*/
			let msgreactions = element.querySelector("msgreacts");
			if (msgreactions) {
				msgreactions.innerHTML = "";
				let reactions = data.reactions;
				if (reactions) {
					Object.keys(reactions).forEach(function(ir) {
						let react = reactions[ir];
						let reacc = document.createElement("button");
						reacc.style.cursor = "pointer";
						reacc.addEventListener("click",function() {
							fetch(currentServer + "sendreaction", {body: JSON.stringify({'token': logininfo.token, 'chatid': chatid, 'messageid': id, 'reaction': ir}),method: 'POST'}).then((res) => {
								
							})
						})
						let reace = document.createElement("label");
						reace.innerText = ir;
						let cnter = document.createElement("label");
						cnter.innerText = "0";
						reacc.appendChild(reace);
						reacc.appendChild(cnter);
						msgreactions.appendChild(reacc);

						let rkk = Object.keys(react);
						let doescontaincurr = false;
						Object.keys(react).forEach(function(aa) {
							let a = react[aa];
							if (a.senderUID == logininfo.uid) {
								doescontaincurr = true;
							}
						})

						if (doescontaincurr) {
							reacc.classList.add("rcted")
						}

						cnter.innerText = rkk.length;

						reacc.addEventListener("contextmenu", function(event) {
							let diag = opendialog();
							diag.title.innerText = "Reactions: " + ir;
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
									userpfp.title = "View profile of " + uii.name;
								});
								urow.appendChild(uname);
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
				};
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
											content: dt.getDate() + "/" + (dt.getMonth() + 1) + "/" + dt.getFullYear(),
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

		function showmessage(id) {
			function show() {
				let cont = messageslist.getElement(id);
				if (cont) {
					function scroll() {
						let top = Math.min(Math.max(cont.offsetTop - 250,0), messageslist.element.scrollHeight - messageslist.element.offsetHeight);
						messageslist.element.scrollTop += (top - messageslist.element.scrollTop) / 8;
						if (Math.abs(messageslist.element.scrollTop - Math.round(top)) > 10) {
							requestAnimationFrame(function() {scroll();})
						}else {
							cont.classList.add("hint");
							setTimeout(function() {
								cont.classList.remove("hint");
							},1000)
						}
					}
					requestAnimationFrame(function() {scroll();});
				}
			}
			if (messageslist.getItemData(id)) {
				show();
			}else {
				getoldermessages("#" + messagescount + "-" + id, show);
			}
		}

		function createmsg(msg,id,msgc,extra) {
			if (msgc == undefined) {
				return;
			}
			let dt = new Date(msg.sendTime);
			function selectmessage() {
				let idx = selectedMessages.indexOf(id);
				if (idx > -1) {
					selectedMessages.splice(idx,1);
				}else {
					selectedMessages.push(id);
				}
				messageslist.updateItem(id);
				if (pinnedmessages[id]) {
					pinnedmessageslist.updateItem(id);
				}
			}
			function reply() {
				replymsgid = id;
				rc.style.display = "";
				if (msg.senderUID == "0") {
					replycnt.innerText = "Pamuk is here!";
					formatSystemMessage(msg.content, function(text) {
						replycnt.innerText = text;
					})
				}else {
					replycnt.innerText = msg.content.length > 0 ? msg.content : "Message";
				}
				getInfo(msg.senderUID,(user) => {
					replysname.innerText = user.name;
				})
				if (pinnedmessageslist.element.style.display == "") {
					pinsbtn.click();
				}
				msginput.focus();
			}

			msgc.addEventListener("click",function() {
				if (selectedMessages.length > 0) {
					selectmessage();
				}
			})

			function spawnmenu(pos) {
				if (menuspawned) return;
				menuspawned = true;

				activePopupCount++;
				inertMainUI();

				let ctxdiv = document.createElement("div");
				ctxdiv.style.position = "absolute";
				ctxdiv.style.top = pos.y + "px";
				ctxdiv.style.left = pos.x + "px";
				ctxdiv.classList.add("customctx");
				ctxdiv.style.width = "315px";
				if (crole.AllowSendingReactions == true) {
					let reactionsdiv = document.createElement("div");
					reactionsdiv.classList.add("reactionsbar");
					reactionemojis.forEach((item) => {
						let itm = item.toString();
						let reactionbtn = document.createElement("button");
						let reacted = false;
						if (msg.reactions) {
							if (msg.reactions[itm]) {
								Object.values(msg.reactions[itm]).forEach(function(s) {
									if (s.senderUID == logininfo.uid) {
										reactionbtn.classList.add("reacted");
										reacted = true;
									}
								})
							}
						}
						reactionbtn.innerText = itm;
						reactionsdiv.appendChild(reactionbtn);
						reactionbtn.addEventListener("click",function() {
							fetch(currentServer + "sendreaction", {body: JSON.stringify({'token': logininfo.token, 'chatid': chatid, 'messageid': id, 'reaction': itm}),method: 'POST'})
							if (reacted) {
								reactionbtn.classList.remove("reacted");
							}else {
								reactionbtn.classList.add("reacted");
							}
							clik();
						});
					});
					ctxdiv.appendChild(reactionsdiv);
				}
				let cnt = document.createElement("div");
				ctxdiv.appendChild(cnt);
				if (extra) {
					if (extra.pinnedmessageslist == true) {
						let gotobutton = document.createElement("button");
						addRipple(gotobutton,"rgba(255,200,0,0.6)",true);
						gotobutton.innerText = "Go to message";
						gotobutton.disabled = !crole.AllowSending;
						gotobutton.addEventListener("click", function() {
							if (pinnedmessageslist.element.style.display == "") {
								pinsbtn.click();
							}
							showmessage(id);
							clik();
						})
						cnt.appendChild(gotobutton);
					}
				}
				let replybutton = document.createElement("button");
				addRipple(replybutton,"rgba(255,200,0,0.6)",true);
				replybutton.innerText = "Reply";
				replybutton.disabled = !crole.AllowSending;
				replybutton.addEventListener("click", function() {
					reply();
					clik();
				})
				cnt.appendChild(replybutton);
				let forwardbutton = document.createElement("button");
				addRipple(forwardbutton,"rgba(255,200,0,0.6)",true);
				forwardbutton.innerText = "Forward message...";
				forwardbutton.addEventListener("click", function() {
					let diag = opendialog();
					diag.title.innerText = "Forward message";
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
						itmcont.style.background = fchatselectsid.includes(id) ? "orange" : "";
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
					clik();
				})
				cnt.appendChild(forwardbutton);
				let selectbutton = document.createElement("button");
				selectbutton.innerText = "Select...";
				addRipple(selectbutton,"rgba(255,200,0,0.6)",true);
				selectbutton.addEventListener("click", function() {
					selectmessage();
					clik();
				})
				cnt.appendChild(selectbutton);
				let savebtn = document.createElement("button");
				savebtn.innerText = "Save message";
				addRipple(savebtn,"rgba(255,200,0,0.6)",true);
				savebtn.addEventListener("click", function() {
					let messages = selectedMessages;
					if (messages.length == 0) messages = [id];
					fetch(currentServer + "savemessage", {body: JSON.stringify({'token': logininfo.token, 'chatid': chatid, 'messageids': messages}),method: 'POST'}).then((res) => {

					})
					clik();
				})
				cnt.appendChild(savebtn);
				let pinbtn = document.createElement("button");
				pinbtn.innerText = msgpinned.style.display == "" ? "Unpin message" : "Pin message";
				addRipple(pinbtn,"rgba(255,200,0,0.6)",true);
				pinbtn.addEventListener("click", function() {
					let messages = selectedMessages;
					if (messages.length == 0) messages = [id];
					fetch(currentServer + "pinmessage", {body: JSON.stringify({'token': logininfo.token, 'chatid': chatid, 'messageids': messages}),method: 'POST'}).then((res) => {
						
					})
					clik();
				})
				pinbtn.disabled = !crole.AllowPinningMessages;
				cnt.appendChild(pinbtn);
				let copybutton = document.createElement("button");
				addRipple(copybutton,"rgba(255,200,0,0.6)",true);
				copybutton.innerText = "Copy selected text";
				copybutton.addEventListener("click", function() {
					document.execCommand('copy');
					clik();
				})
				cnt.appendChild(copybutton);
				let deletebutton = document.createElement("button");
				addRipple(deletebutton,"rgba(255,0,0,0.6)",true);
				deletebutton.innerText = "Delete message";
				deletebutton.addEventListener("click", () => {
					if (confirm("Do you really want to delete?")) {
						let messages = selectedMessages;
						if (messages.length == 0) messages = [id];
						fetch(currentServer + "deletemessage", {body: JSON.stringify({'token': logininfo.token, 'chatid': chatid, 'messageids': messages}),method: 'POST'}).then((res) => {
							
						})
					}
					clik();
				})
				cnt.appendChild(deletebutton);
				let clik = function() {
					activePopupCount--;
					inertMainUI();
					
					ctxdiv.style.pointerEvents = "none";
					ctxdiv.style.opacity = "0";
					maincont.removeEventListener("pointerdown", clik);
					setTimeout(function() {
						document.body.removeChild(ctxdiv);
						menuspawned = false;
					},250)
				}
				if (selectedMessages.length > 0) {
					deletebutton.disabled = false;
				}else {
					deletebutton.disabled = !(crole.AllowMessageDeleting || msg.senderUID == logininfo.uid);
				}

				ctxdiv.style.opacity = "0";
				document.body.appendChild(ctxdiv);
				requestAnimationFrame(function() {
					ctxdiv.style.opacity = "";
				});
				maincont.addEventListener("pointerdown",clik)
				if (pos.x > document.body.clientWidth - ctxdiv.offsetWidth) {
					ctxdiv.style.left = (document.body.clientWidth - ctxdiv.offsetWidth) + "px";
				}
				if (pos.y > document.body.clientHeight - ctxdiv.offsetHeight) {
					ctxdiv.style.top = (document.body.clientHeight - ctxdiv.offsetHeight) + "px";
				}
			}

			msgc.addEventListener("contextmenu",function(event) {
				if (event.pointerType == "touch" && selectedMessages.length == 0) return;
				let tagname = event.target.tagName.toString();
				if (tagname.toLowerCase() == "video") return;
				if (tagname.toLowerCase() == "img") return;
				let parent = event.target;
				while (parent) {
					tagname = parent.tagName.toString();
					if (tagname.toLowerCase() == "a") return;
					if (tagname.toLowerCase() == "button") return;
					parent = parent.parentElement;
				}
				if (msg.type != "time") {
					spawnmenu({x: event.clientX, y: event.clientY});
					event.preventDefault();
				}
			});
			let msgm = document.createElement("msgmain");
			let msgbubble = document.createElement("msgbubble");
			let msgcontent = document.createElement("msgcontent");
			let msgreactions = document.createElement("msgreacts");
			let msgtime = document.createElement("msgtime");
			let msgtimelbl = document.createElement("label");
			let msgsender = document.createElement("msgsender");
			let msgsendertxt = document.createElement("label");
			let msgpfp = document.createElement("img");
			msgsender.classList.add("sender");
			msgpfp.classList.add("sender");
			msgpfp.classList.add("loading");
			msgsendertxt.innerText = "loading..."
			msgsendertxt.classList.add("loading");
			msgcontent.style.overflowWrap = "break-word";
			if (msg.senderUID == "0") {
				msgcontent.innerText = "Pamuk is here!";
				formatSystemMessage(msg.content, function(text) {
					msgcontent.innerText = text;
				})
			}else {
				msgcontent.innerHTML = linkify(msg.content);
			}
			msgtimelbl.innerText = dt.getHours().toString().padStart(2, '0') + ":" + dt.getMinutes().toString().padStart(2, '0');

			if (msg.forwardedFromUID != undefined) {
				let il = document.createElement("div");
				il.style.fontSize = "12px";
				il.innerText = "Forwarded from "
				let fu = document.createElement("b");
				fu.classList.add("loading");
				fu.style.cursor = "pointer";
				fu.innerText = "loading..."
				fu.addEventListener("click",function() {
					viewInfo(msg.forwardedFromUID, "user")
				})
				getInfo(msg.forwardedFromUID,function(user) {
					fu.innerText = user.name;
					fu.classList.remove("loading");
				})
				il.appendChild(fu);
				msgbubble.appendChild(il);
			}

			if (msg.replyMessageContent != undefined) {
				let rc = document.createElement("button");
				rc.classList.add("replycont");
				addRipple(rc,"rgba(255,200,0,0.6)");
				rc.addEventListener("click",function() {
					showmessage(msg.replyMessageID);
				})
				let replysname = document.createElement("b");
				replysname.innerText = "loading...";
				replysname.classList.add("loading");
				getInfo(msg.replyMessageSenderUID,function(user) {
					replysname.innerText = user.name;
					replysname.classList.remove("loading");
				})

				rc.appendChild(replysname);
				let replycnt = document.createElement("label");
				if (msg.replyMessageSenderUID == "0") {
					replycnt.innerText = "Pamuk is here!";
					formatSystemMessage(msg.replyMessageContent, function(text) {
						replycnt.innerText = text;
					})
				}else {
					replycnt.innerText = msg.replyMessageContent.length > 0 ? msg.replyMessageContent : "Message";
				}
				rc.appendChild(replycnt);
				msgbubble.appendChild(rc);
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

				//Grid
				msg.gImages.forEach(function(i) {
					let imgs = new Image();
					imgs.src = i.url.replace(/%SERVER%/g,currentServer) + (i.url.includes("%SERVER%") ? "&type=thumb" : "");
					let img = document.createElement("img");
					img.style.background = "white";
					img.classList.add("msgimg");
					img.onclick = function() {
						let a = document.createElement("a");
						a.href = i.url.replace(/%SERVER%/g,currentServer);
						a.target = "_blank";
						a.click();
					}
					imgs.onload = function() {
						img.src = imgs.src;
						img.onclick = function() {
							imageView(i.url.replace(/%SERVER%/g,currentServer));
						}
					}
					img.style.width = img.style.height = Math.max(240 / msg.gImages.length,64) + "px";
					let index = i.url.lastIndexOf("=") + 1; let filename = i.url.substr(index);
					img.title = filename;
					msgbubble.appendChild(img);
				})
				msg.gVideos.forEach(function(i) {
					let vid = document.createElement("video");
					//vid.muted = true;
					//vid.autoplay = true;
					vid.controls = true;
					vid.src = i.url.replace(/%SERVER%/g,currentServer);
					vid.style.aspectRatio = "16/9";
					vid.style.width = "100%";
					let index = i.url.lastIndexOf("=") + 1; let filename = i.url.substr(index);
					vid.title = filename;
					msgbubble.appendChild(vid);
				})
				// -----
				if (msg.gImages.length + msg.gVideos.length > 0) msgbubble.appendChild(document.createElement("br"));

				// List
				msg.gAudio.forEach(function(i) {
					let fd = document.createElement("button");
					fd.classList.add("filed");
					addRipple(fd, "rgba(255,255,255,0.6)");
					let path = i.url.replace(/%SERVER%/g,currentServer);
					fd.setAttribute("data-audiopath", path);
					let fileico = document.createElement("div");
					fileico.classList.add("playico");
					fileico.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px"><path d="M320-273v-414q0-17 12-28.5t28-11.5q5 0 10.5 1.5T381-721l326 207q9 6 13.5 15t4.5 19q0 10-4.5 19T707-446L381-239q-5 3-10.5 4.5T360-233q-16 0-28-11.5T320-273Z"/></svg>';
					let filename = i.name;
					fd.appendChild(fileico)
					let il = document.createElement("div");
					il.style.display = "flex";
					il.style.flexDirection = "column";
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
					fd.classList.add("filed");
					addRipple(fd, "rgba(255,255,255,0.6)");
					let fileico = document.createElement("div");
					fileico.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px"><path d="M760-200H320q-33 0-56.5-23.5T240-280v-560q0-33 23.5-56.5T320-920h247q16 0 30.5 6t25.5 17l194 194q11 11 17 25.5t6 30.5v367q0 33-23.5 56.5T760-200Zm0-440L560-840v140q0 25 17.5 42.5T620-640h140ZM160-40q-33 0-56.5-23.5T80-120v-520q0-17 11.5-28.5T120-680q17 0 28.5 11.5T160-640v520h400q17 0 28.5 11.5T600-80q0 17-11.5 28.5T560-40H160Z"/></svg>';
					let filename = i.name;
					fd.appendChild(fileico)
					let il = document.createElement("div");
					il.style.display = "flex";
					il.style.flexDirection = "column";
					let namel = document.createElement("label");
					namel.innerText = filename;
					il.appendChild(namel);
					let sizel = document.createElement("label");
					sizel.innerText = humanFileSize(i.size);
					il.appendChild(sizel);
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
				msgm.appendChild(msgtime);
			}

			let msgstatus = null;
			let msgpinned = document.createElement("div");
			msgpinned.classList.add("msgpinned");
			msgpinned.title = "Pinned";
			msgpinned.style.display = msg.isPinned ? "" : "none";
			msgpinned.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="#000000"><path d="M624-744v264l85 85q5 5 8 11.5t3 14.5v20.81q0 15.38-10.35 25.79Q699.3-312 684-312H516v222q0 15.3-10.29 25.65Q495.42-54 480.21-54T454.5-64.35Q444-74.7 444-90v-222H276q-15.3 0-25.65-10.4Q240-332.81 240-348.19V-369q0-8 3-14.5t8-11.5l85-85v-264h-12q-15.3 0-25.65-10.29Q288-764.58 288-779.79t10.35-25.71Q308.7-816 324-816h312q15.3 0 25.65 10.29Q672-795.42 672-780.21t-10.35 25.71Q651.3-744 636-744h-12Z"/></svg>';


			if (msg.senderUID == logininfo.uid) {
				msgm.classList.add("sender");
				msgc.appendChild(document.createElement("ma"));
				msgsender.appendChild(document.createElement("ma"));
				msgsender.appendChild(msgsendertxt)
				msgtime.appendChild(document.createElement("ma"));
				msgtime.appendChild(msgtimelbl);
				msgstatus = document.createElement("div");
				msgstatus.classList.add("msgstatus");
				msgstatus.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 -960 960 960" width="20"><path d="M395-285 226-455l50-50 119 118 289-288 50 51-339 339Z"/></svg>';
				msgtime.appendChild(msgstatus);
				msgc.appendChild(msgm);
				msgc.appendChild(msgpfp);
			}else {
				if (msg.senderUID == 0) {
					msgc.appendChild(document.createElement("ma"));
					msgc.appendChild(msgm);
					msgc.appendChild(document.createElement("ma"));
					if (msg.type != "time") {
						msgtime.appendChild(msgtimelbl);
						msgtime.appendChild(document.createElement("ma"));
					}
				}else {
					msgc.appendChild(msgpfp);
					msgc.appendChild(msgm);
					msgc.appendChild(document.createElement("ma"));
					msgsender.appendChild(msgsendertxt)
					msgsender.appendChild(document.createElement("ma"));
					msgtime.appendChild(msgtimelbl);
					msgtime.appendChild(document.createElement("ma"));
				}
			}
			msgtime.appendChild(msgpinned);

			let replydragstart = null;
			let dragy = null;
			let dragtime = null;
			let lastdiff = 0;
			let cancelled = true;
			let draglocked = false;
			msgc.addEventListener("touchstart", function(event) {
				if (selectedMessages.length > 0) return;
				let tagname = event.target.tagName.toString();
				if (tagname.toLowerCase() == "video") return;
				if (tagname.toLowerCase() == "img") return;
				let parent = event.target;
				while (parent) {
					tagname = parent.tagName.toString();
					if (tagname.toLowerCase() == "a") return;
					if (tagname.toLowerCase() == "button") return;
					parent = parent.parentElement;
				}
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
					msgm.style.transform = "translateX(" + Math.max(-diff, -50) + "px)";
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
					setTimeout(function() {spawnmenu({x: replydragstart, y: dragy});}, 100);
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
			//return {message: msgc, status:msgstatus,msgreactions: msgreactions,reactions: rdata, pinned:msgpinned};;
		}
		
		sendbtn.disabled = true;
		let sendtyping = true;
		msginput.addEventListener("input",function() {
			if (msginput.value.trim().length == 0 && fileslist.length < 1) {
				sendbtn.disabled = true;
			}else {
				sendbtn.disabled = false;
			}
			if (sendtyping) {
				fetch(currentServer + "settyping", {body: JSON.stringify({'token': logininfo.token, 'chatid': chatid}),method: 'POST'});
				sendtyping = false;
				setTimeout(function() {sendtyping = true}, 2000);
			}
		})
		
		sendbtn.addEventListener("click",function() {
			let content = msginput.value.trim();
			let replymessageid = replymsgid;
			let msgid = "send" + Math.round(Math.random() * 100000);
			addmsg({
				senderUID:logininfo.uid,
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
					fetch(currentServer + "upload", {headers: {'token': logininfo.token,"filename": encodeURI(file.name)},method: 'POST',body: file}).then(function(response) { response.json().then(function(data) {
						if (data.status == "success") {
							files.push(data.url);
							upload();
						}
					})}).catch(function(error) {console.error(error);});
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
			atc.innerHTML = "";
			msginput.value = "";
			rc.style.display = "none";
			replymsgid = undefined;
			sendbtn.disabled = true;
			msginput.focus();
		});
		
		msginput.addEventListener("keydown",function(e) {
			if (e.key == "Enter" && !e.shiftKey && !isTouch) {
				sendbtn.click();
				e.preventDefault();
			}
		});

		fetch(currentServer + "addhook", {body: JSON.stringify({'token': logininfo.token, "ids": ["chat:" + chatid]}), method: "POST"});
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
							let index = val.indexOf(logininfo.uid);
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
					if (text == "Online") {
						infotxt.innerText = "Online";
					}else {
						let dt = new Date(text);
						infotxt.innerText = "Last Online: " + dt.getDate() + "/" + (dt.getMonth() + 1) + "/" + dt.getFullYear() + ", " + dt.getHours().toString().padStart(2, '0') + ":" + dt.getMinutes().toString().padStart(2, '0');
					}
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
				errortitle.innerText = "Couldn't open chat.";
				errorcont.appendChild(errortitle);
				let errormsg = document.createElement("label");
				errormsg.innerText = "Please tell the issue to server's owner if this is not normal.";
				errorcont.appendChild(errormsg);
				messageslist.element.style.alignItems = "center";
				messageslist.element.style.justifyContent = "center";
				messageslist.element.appendChild(errorcont);
				mgb.remove();
				kill();
			}
		})


		function updateTypingUsers() {
			if (typingUsers.length == 0) {
				typinglabel.innerText = "Nobody is typing";
				typinglabel.style.opacity = "0";
			}else {
				let usernameslist = [];
				typingUsers.forEach(function(i) {
					getInfo(i,function(u) {
						usernameslist.push(u.name);
						if (typingUsers.length == usernameslist.length) {
							typinglabel.innerText = usernameslist.join(",") + " is typing...";
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
					let index = val.indexOf(logininfo.uid);
					if (index >= 0) {
						val.splice(index,1);
					}
					typingUsers = val;
					updateTypingUsers();
				}else if (i.startsWith("TYPING|")) {
					// Here the value is true/false and event name is "TYPING|[User ID]"
					let user = i.split("|")[1];
					if (user != logininfo.uid) {
						if (val == true) {
							typingUsers.push(user);
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
					}
					if (val.event == "DELETED") {
						messageslist.removeItem(key);
						if (pinnedmessages[key]) {
							delete pinnedmessages[key];
							pinnedmessageslist.removeItem(key);
							updatepinnedbar();
						}
					}
					if (val.event == "REACTIONS") { //Legacy
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
					}
					if (val.event == "REACTED") {
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
					}
					if (val.event == "UNREACTED") {
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
					}
					if (val.event == "PINNED") {
						let data = messageslist.getItemData(key);
						if (data) {
							data.isPinned = true;
							messageslist.updateItem(key, data);
						}
						pinnedmessages[key] = val;
						updatepinnedbar();
						addpinnedmsg(key,val);
					}
					if (val.event == "UNPINNED") {
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
			chat: mchat,
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
		fetch(currentServer + "ping").then(function() {
			if (localStorage.getItem("logininfo") == null) {
				openLoginArea();
			}else {
				logininfo = JSON.parse(localStorage.getItem("logininfo"));
				openMainArea();
			}
			
		}).catch(function() {
			openConnectArea(true);
		})
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
function createDynamicList(elemtype = "div", innertype = "div") {
	let list = {};
	
	let direction = 1;
	let pos = -1;
	let scrolldirection = 1;
	let lastscrollpos = 0;
	let lastheight = 0;

	let listelement = document.createElement(elemtype);
	listelement.style.overflow = "auto";

	listelement.addEventListener("scroll",function() {
		if (listelement.scrollTop > lastscrollpos) {
			scrolldirection = 1;
		}else if (listelement.scrollTop < lastscrollpos) {
			scrolldirection = -1;
		}//else it's horizontal scroll
		lastscrollpos = listelement.scrollTop;
		if (listelement.scrollTop == 0) {
			pos = -1;
		}else if (Math.abs(listelement.scrollHeight - listelement.clientHeight - listelement.scrollTop) <= 1) {
			pos = 1;
		}else {
			pos = 0;
		}
	});

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

	function additem(key, item, order = 1) {
		if (list[key]) {
			return;
		}
		let element = document.createElement(innertype);
		element.style.height = item.size + "px"; //Assumed size, will be removed when element loads.
		if (order == 1) {
			listelement.appendChild(element)
			if (direction == -1) {
				if (pos == 1) {
					listelement.scrollTop += item.size; 
				}
			}
		}
		if (order == -1) {
			listelement.prepend(element);
			listelement.scrollTop += item.size; //FIXME
		}
		item.element = element;
		let viewobserver = new IntersectionObserver(onintersection, {root: null, threshold: 0})
		let loaded = false;
		list[key] = item;
		viewobserver.observe(element);
		function onintersection(entries, opts){
			entries.forEach(function (entry) {
				let visible = entry.isIntersecting;
				if (visible) {
					if (loaded == false) {
						viewobserver.unobserve(element);
						element.style.height = "";
						item.generator(item.data, element, key);
						loaded = true;
						item.updater(item.data, element, key);
						if (scrolldirection == -1  || pos == 1) { //FIXME: Doesn't scroll to bottom properly on first open because this smh isn't -1.
							requestAnimationFrame(function() { 
								let diff = element.offsetHeight - item.size;
								listelement.scrollTop += diff;
							})
						}
					}
				}
			})
		}
	}


	function updateitem(key = null, data = null) {
		if (key != null) {
			if (list[key]) {
				if (data != null) {
					list[key].data = data;
				}
				list[key].updater(list[key].data, list[key].element, key);
			}
		}else {
			Object.keys(list).forEach(function(k) {
				let i = list[k];
				i.updater(i.data, i.element, k);
			});
		}
	}

	function getitemdata(key) {
		if (list[key]) {
			return list[key].data;
		}
	}

	function removeitem(key) {
		if (list[key]) {
			let item = list[key];
			item.element.remove();
			delete list[key];
		}
	}

	function clearitems() {
		Object.keys(list).forEach(function(key) {
			let item = list[key];
			item.element.remove();
			delete list[key];
		})
	}

	function setdirection(d) {
		direction = d;
		if (direction == -1) {
			pos = 1;
			scrolldirection = -1;
		}
		if (direction == 1) {
			pos = -1;
			scrolldirection = 1;
		}
	}

	function getelement(key) {
		if (list[key]) {
			let item = list[key];
			return item.element
		}
	}

	function getlist() {
		return list;
	}

	return {
		element: listelement,
		addItem: additem,
		removeItem: removeitem,
		updateItem: updateitem,
		getItemData: getitemdata,
		clearItems: clearitems,
		setDirection: setdirection,
		getElement: getelement,
		getList: getlist
	}
}

function createLazyList(elemtype = "div",innertype = "div") {
	let list = [];
	let listelement = document.createElement(elemtype);
	listelement.style.overflow = "auto";

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

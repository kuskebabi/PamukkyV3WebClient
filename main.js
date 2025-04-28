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


function loaded() {setTimeout(init,1000);}
function init() {

let currserver = "";
let logininfo = {};
let currentuser = {};
let chats = []
let reactionemojis = ["👍","👎","😃","😂","👏","😭","💛","🤔","🎉","🔥", "💀","😘","😐","😡","👌","😆","😱","😋"];
let cacheduserinfo = {};
let uidcallbacks = {};
function getuserinfo(uid, callback) {
	if (uid == 0) {
		callback({
			name: "Pamuk",
			picture: "",
			info: "Birb"
		});
		return;
	}
	if (cacheduserinfo.hasOwnProperty(uid)) { // Return the cached
		callback(cacheduserinfo[uid]);
	}else {
		if (uidcallbacks.hasOwnProperty(uid)) {
			uidcallbacks[uid].push(callback); //Just add this in callback list
		}else { //New request
			uidcallbacks[uid] = [callback]; //create the array
			fetch(currserver + "getuser", {body: JSON.stringify({'token': logininfo.token, 'uid': uid}),method: 'POST'}).then((res) => {
				if (res.ok) {
					res.text().then((text) => {
						//Yay! now we attempt to parse it then callback all of them
						let info = JSON.parse(text);
						cacheduserinfo[uid] = info;
						uidcallbacks[uid].forEach((callback) => {
							callback(info);
						})
					})
				}else { // non 200 response
					uidcallbacks[uid].forEach((callback) => {
						callback({
							name: "Unknown User",
							picture: "",
							info: ""
						});
					})
				}
			}).catch(() => { //Error in response
				uidcallbacks[uid].forEach((callback) => {
					callback({
						name: "Unknown User",
						picture: "",
						info: ""
					});
				})
			});
		}
	}
}
let cachedgroupinfo = {};
let gidcallbacks = {};
function getgroupinfo(gid, callback) {
	if (cachedgroupinfo.hasOwnProperty(gid)) { // Return the cached
		callback(cachedgroupinfo[gid]);
	}else {
		if (gidcallbacks.hasOwnProperty(gid)) {
			gidcallbacks[gid].push(callback); //Just add this in callback list
		}else { //New request
			gidcallbacks[gid] = [callback]; //create the array
			fetch(currserver + "getgroup", {body: JSON.stringify({'token': logininfo.token, 'groupid': gid}),method: 'POST'}).then((res) => {
				if (res.ok) {
					res.text().then((text) => {
						//Yay! now we attempt to parse it then callback all of them
						let info = JSON.parse(text);
						cachedgroupinfo[gid] = info;
						gidcallbacks[gid].forEach((callback) => {
							callback(info);
						})
					})
				}else { // non 200 response
					gidcallbacks[gid].forEach((callback) => {
						callback({
							name: "Unknown Group",
							picture: "",
							info: ""
						});
					})
				}
			}).catch(() => { //Error in response
				gidcallbacks[gid].forEach((callback) => {
					callback({
						name: "Unknown Group",
						picture: "",
						info: ""
					});
				})
			});
		}
	}
}


const searchParams = new URLSearchParams(window.location.search);
if (searchParams.has("server")) {
	currserver = searchParams.get("server");
}

function openconnectarea(err) {
	document.body.innerHTML = "";
	let connectcnt = document.createElement("centeredPopup");
	let title = document.createElement("h1");
	title.innerText = "Welcome To Pamukky!"
	connectcnt.appendChild(title);
	let it = document.createElement("label");
	it.innerText = "Enter Server URL To Begin:\n"
	connectcnt.appendChild(it);
	let servertb = document.createElement("input");
	servertb.placeholder = "URL or IP";
	servertb.style.display = "block";
	servertb.style.width = "100%";
	servertb.style.marginTop = "5px";
	servertb.style.marginBottom = "5px";
	servertb.value = currserver;
	connectcnt.appendChild(servertb);
	let errlbl = document.createElement("label");
	errlbl.classList.add("errorlabel");
	errlbl.innerText = " ";
	connectcnt.appendChild(errlbl);
	let connectbtn = document.createElement("button")
	connectbtn.innerText = "Connect"
	connectbtn.style.width = "100%";
	connectcnt.appendChild(connectbtn);
	document.body.appendChild(connectcnt);
	addRipple(connectbtn,"rgba(255,200,0,0.6)");
	
	if (err) {
		errlbl.innerText = "Failled Connecting"
	}
	
	connectbtn.addEventListener("click",function() {
		connectbtn.disabled = true;
		errlbl.classList.remove("errorlabel");
		errlbl.classList.add("infolabel");
		errlbl.innerText = "Please Wait...";
		
		fetch(servertb.value + "ping").then((res) => {
			if (res.ok) {
				res.text().then((text) => {
					console.log(text)
					currserver = servertb.value;
					localStorage.setItem("server", servertb.value);
					openloginarea();
				})
			}else {
				connectbtn.disabled = false;
			}
		}).catch(() => {
			connectbtn.disabled = false;
			errlbl.classList.add("errorlabel");
			errlbl.classList.remove("infolabel");
			errlbl.innerText = "Failled Connecting"
		})
	})
}

function openloginarea() {
	document.body.innerHTML = "";
	let logincnt = document.createElement("centeredPopup");
	let title = document.createElement("h1");
	title.innerText = "Welcome To Pamukky!"
	logincnt.appendChild(title);
	let it = document.createElement("label");
	it.innerText = "Login To Pamukky:\n"
	logincnt.appendChild(it);
	let emailtb = document.createElement("input");
	emailtb.placeholder = "E-Mail";
	emailtb.style.display = "block";
	emailtb.style.width = "100%";
	emailtb.style.marginTop = "5px";
	emailtb.type = "email";
	emailtb.style.marginBottom = "5px";
	logincnt.appendChild(emailtb);
	let passwordtb = document.createElement("input");
	passwordtb.placeholder = "Password";
	passwordtb.type = "password";
	passwordtb.style.display = "block";
	passwordtb.style.width = "100%";
	passwordtb.style.marginTop = "5px";
	passwordtb.style.marginBottom = "5px";
	logincnt.appendChild(passwordtb);
	let errlbl = document.createElement("label");
	errlbl.classList.add("errorlabel");
	errlbl.innerText = " ";
	logincnt.appendChild(errlbl);
	let loginbtn = document.createElement("button")
	loginbtn.innerText = "Login"
	loginbtn.style.width = "100%";
	logincnt.appendChild(loginbtn);
	document.body.appendChild(logincnt);
	let registerbtn = document.createElement("button")
	registerbtn.innerText = "Register"
	registerbtn.style.width = "100%";
	logincnt.appendChild(registerbtn);
	let connectbtn = document.createElement("button")
	connectbtn.innerText = "Connect to other server..."
	connectbtn.style.width = "100%";
	logincnt.appendChild(connectbtn);
	document.body.appendChild(logincnt);
	addRipple(loginbtn,"rgba(255,200,0,0.6)");
	addRipple(registerbtn,"rgba(255,200,0,0.6)");
	addRipple(connectbtn,"rgba(255,200,0,0.6)");
	
	loginbtn.addEventListener("click",function() {
		loginbtn.disabled = true;
		registerbtn.disabled = true;
		
		fetch(currserver + "login", {body: JSON.stringify({'email': emailtb.value,'password': passwordtb.value}),method: 'POST'}).then((res) => {
			if (res.ok) {
				res.text().then((text) => {
					logininfo = JSON.parse(text);
					localStorage.setItem("logininfo", text);
					loadmainarea();
				})
			}else {
				res.json().then((json) => {
					errlbl.innerText = json.description;
				});
				loginbtn.disabled = false;
				registerbtn.disabled = false;
			}
		}).catch(() => {
			loginbtn.disabled = false;
			registerbtn.disabled = false;
		})
	})
	
	registerbtn.addEventListener("click",function() {
		loginbtn.disabled = true;
		registerbtn.disabled = true;
		
		fetch(currserver + "signup", {body: JSON.stringify({'email': emailtb.value,'password': passwordtb.value}),method: 'POST'}).then((res) => {
			if (res.ok) {
				res.text().then((text) => {
					logininfo = JSON.parse(text);
					localStorage.setItem("logininfo", text);
					loadmainarea();
				})
			}else {
				res.json().then((json) => {
					errlbl.innerText = json.description;
				});
				loginbtn.disabled = false;
				registerbtn.disabled = false;
			}
		}).catch(() => {
			loginbtn.disabled = false;
			registerbtn.disabled = false;
		})
	})
	
	connectbtn.addEventListener("click",function() {
		openconnectarea();
	})
}

function loadmainarea() {
	Notification.requestPermission();
	function viewuginfo(ugid,type,grole) {
		let diag = opendialog();
		diag.title.innerText = "Info";
		diag.inner.style.display = "flex";
		diag.inner.style.flexDirection = "column";
		diag.inner.style.alignItems = "center";
		if (type == "user") {
			fetch(currserver + "getuser", {body: JSON.stringify({'token': logininfo.token, 'uid': ugid}),method: 'POST'}).then((res) => {
				if (res.ok) {
					res.text().then((text) => {
						let infod = JSON.parse(text);
						
						let pfpimge = document.createElement("img");
						pfpimge.style.boxShadow = "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)";
						pfpimg.loading = "lazy";
						pfpimge.classList.add("circleimg");
						pfpimge.style.width = "80px";
						pfpimge.style.height = "80px";
						pfpimge.src = infod.picture.replace(/%SERVER%/g,currserver);
						diag.inner.appendChild(pfpimge);
						
						let infotable = document.createElement("table");
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
						desval.innerText = infod.description;
						desrow.appendChild(desval);
						
						
						infotable.appendChild(namerow);
						infotable.appendChild(desrow);
						diag.inner.appendChild(infotable);
					})
				}
			})
		}else {
			fetch(currserver + "getgroup", {body: JSON.stringify({'token': logininfo.token, 'groupid': ugid}),method: 'POST'}).then((res) => {
				if (res.ok) {
					res.text().then((text) => {
						let infod = JSON.parse(text);
						
						let f = document.createElement('input');
						f.type='file';
						f.accept = 'image/*';
						
						let ufl = false;
						let file;
						
						let pfpimge = document.createElement("img");
						pfpimge.style.boxShadow = "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)";
						pfpimge.classList.add("circleimg");
						pfpimge.loading = "lazy";
						pfpimge.style.width = "80px";
						pfpimge.style.height = "80px";
						pfpimge.style.cursor = "pointer";
						pfpimge.title = "Click to upload";
						pfpimge.src = infod.picture.replace(/%SERVER%/g,currserver);
						pfpimge.addEventListener("click",function () {f.click();})
						diag.inner.appendChild(pfpimge);
						
						let idlabel = document.createElement("label");
						idlabel.innerText = ugid;
						diag.inner.appendChild(idlabel);
						
						let infotable = document.createElement("table");
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
						diag.inner.appendChild(infotable);
						
						let userstable = document.createElement("table");
						
						diag.inner.appendChild(userstable);
						let roles = {};
						fetch(currserver + "getgrouproles", {body: JSON.stringify({'token': logininfo.token, 'groupid': ugid}),method: 'POST'}).then((res) => {
							if (res.ok) {
								res.text().then((text) => {
									roles = JSON.parse(text);
									let rokeys = Object.keys(roles);
									fetch(currserver + "getgroupusers", {body: JSON.stringify({'token': logininfo.token, 'groupid': ugid}),method: 'POST'}).then((res) => {
										if (res.ok) {
											res.text().then((text) => {
												let users = JSON.parse(text);
												let ukeys = Object.keys(users);
												let cuser = users[logininfo.uid];
												let crole = roles[cuser.role];
												if (crole.AllowEditingSettings == true) {
													let editrolesbtn = document.createElement("button");
													editrolesbtn.innerText = "Edit Roles";
													diag.inner.appendChild(editrolesbtn);
													editrolesbtn.addEventListener("click",function() {
														let diaga = opendialog();
														diaga.title.innerText = "Edit Roles";
														diaga.inner.style.display = "flex";
														diaga.inner.style.flexDirection = "column";
														diaga.inner.style.alignItems = "center";
														
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
													})
												}
												ukeys.forEach(function (e) {
													let user = users[e];
													let urow = document.createElement("tr");
													let uname = document.createElement("td");
													uname.style.display = "flex";
													uname.style.alignItems = "center";
													let userpfp = document.createElement("img");
													userpfp.classList.add("circleimg");
													userpfp.loading = "lazy";
													let usernamelbl = document.createElement("label");
													uname.appendChild(userpfp);
													uname.appendChild(usernamelbl);
													fetch(currserver + "getuser", {body: JSON.stringify({'uid': user.user}),method: 'POST'}).then((res) => {
														if (res.ok) {
															res.text().then((text) => {
																let uii = JSON.parse(text);
																userpfp.src = uii.picture.replace(/%SERVER%/g,currserver);
																usernamelbl.innerText = uii.name;
															})
														}
													});
													urow.appendChild(uname);
													let urole = document.createElement("td");
													if (!crole.AllowEditingUsers) {
														urole.innerText = user.role;
													}else {
														let ri = document.createElement("select");
														rokeys.forEach(function(i) {
															let opt = document.createElement("option");
															opt.value = i;
															opt.innerText = i;
															ri.appendChild(opt);
														})
														ri.value = user.role;
														ri.addEventListener("change",function() {
															//alert("wait..")
															fetch(currserver + "edituser", {body: JSON.stringify({'token': logininfo.token, 'groupid': ugid, 'userid': user.user, 'role': ri.value }),method: 'POST'}).then((res) => {
																if (res.ok) {
																	res.text().then((text) => {
																		
																	})
																}else {
																	
																}
															})
														});
														urole.appendChild(ri);
													}
													urow.appendChild(urole);
													userstable.appendChild(urow);
												})
											});
										}
									});
								});
							}
						});
						
						let savebtn = document.createElement("button");
						savebtn.innerText = "Save";
						savebtn.addEventListener("click",function() {
							if (ufl) {
								fetch(currserver + "upload", {headers: {'token': logininfo.token},method: 'POST',body: file}).then(function(response) { response.json().then(function(data) {
									console.log(data);
									if (data.status == "success") {
										fetch(currserver + "editgroup", {body: JSON.stringify({'token': logininfo.token, 'groupid': ugid, 'name': nameinp.value, 'picture': data.url, 'info': desinp.value, 'roles': roles }),method: 'POST'}).then((res) => {
											if (res.ok) {
												res.text().then((text) => {
													
												})
											}else {
												
											}
										})
									}
								})}).catch(function(error) {console.error(error);});
							}else {
								fetch(currserver + "editgroup", {body: JSON.stringify({'token': logininfo.token, 'groupid': ugid, 'name': nameinp.value, 'picture': infod.picture, 'info': desinp.value, 'roles': roles  }),method: 'POST'}).then((res) => {
									if (res.ok) {
										res.text().then((text) => {
											
										})
									}else {
										
									}
								})
							}
						})
						diag.inner.appendChild(savebtn);
						
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
				}
			})
		}
	}
	
	function opendialog() {
		let bgcover = document.createElement("div");
		bgcover.style.background = "rgba(0,0,0,0.3)";
		bgcover.style.width = "100%";
		bgcover.style.height = "100%";
		bgcover.style.top = "0";
		bgcover.style.left = "0";
		bgcover.style.display = "flex";
		bgcover.style.position = "fixed";
		bgcover.style.alignItems = "center";
		bgcover.style.justifyContent = "center";
		bgcover.style.zIndex = "6";
		bgcover.addEventListener("pointerdown",function(e) {
			if (e.target == bgcover) {
				document.body.removeChild(bgcover);
			}
		})
		
		let dialoginside = document.createElement("centeredPopup");
		dialoginside.style.maxHeight = "100%";
		dialoginside.style.overflow = "auto";
		let tflex = document.createElement("div");
		tflex.style.display = "flex";
		tflex.style.alignItems = "center";
		let titlelbl = document.createElement("h4");
		titlelbl.innerText = "Dialog";
		titlelbl.style.marginRight = "auto";
		let closebtn = document.createElement("button");
		addRipple(closebtn,"rgba(255,200,0,0.6)");
		closebtn.style.flexShrink = "0";
		closebtn.style.width = "25px";
		closebtn.style.height = "25px";
		closebtn.style.padding = "0";
		closebtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 -960 960 960" width="20"><path d="m291-240-51-51 189-189-189-189 51-51 189 189 189-189 51 51-189 189 189 189-51 51-189-189-189 189Z"/></svg>';
		closebtn.addEventListener("click",function(e) {
			if (isatdock == true) {
				maincont.removeChild(dialoginside);
				
			}else {
				document.body.removeChild(bgcover);
				
			}
		})
		let isatdock = false;
		
		let dockbtn = document.createElement("button");
		addRipple(dockbtn,"rgba(255,200,0,0.6)");
		dockbtn.style.flexShrink = "0";
		dockbtn.style.width = "25px";
		dockbtn.style.height = "25px";
		dockbtn.style.padding = "0";
		dockbtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 -960 960 960" width="20"><path d="M216-144q-29.7 0-50.85-21.15Q144-186.3 144-216v-168h72v168h528v-528H216v168h-72v-168q0-29.7 21.15-50.85Q186.3-816 216-816h528q29.7 0 50.85 21.15Q816-773.7 816-744v528q0 29.7-21.15 50.85Q773.7-144 744-144H216Zm216-144-51-51 105-105H144v-72h342L381-621l51-51 192 192-192 192Z"/></svg>';
		dockbtn.addEventListener("click",function(e) {
			if (isatdock == true) {
				document.body.appendChild(bgcover);
				bgcover.appendChild(dialoginside);
				innercont.style.maxHeight = (document.body.clientHeight * 0.7) + "px";
				dialoginside.classList.remove("docked")
			}else {
				document.body.removeChild(bgcover);
				bgcover.removeChild(dialoginside);
				maincont.appendChild(dialoginside);
				innercont.style.maxHeight = (document.body.clientHeight - 33) + "px";
				dialoginside.classList.add("docked")
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
		innercont.style.maxHeight = (document.body.clientHeight * 0.7) + "px";
		dialoginside.appendChild(innercont);
		
		bgcover.appendChild(dialoginside);
		
		document.body.appendChild(bgcover);
		
		return {
			bgcover: bgcover,
			dialog:dialoginside,
			title: titlelbl,
			inner:innercont,
			closebtn:closebtn
		}
	}
	
	let currentchatview;
	let chatitems = {};
	let readnotifications = [];
	let ttimer = setInterval(function() {
		if (logininfo == undefined || logininfo == null) {
			clearTimeout(ttimer);
			return;
		}
		fetch(currserver + "setonline", {body: JSON.stringify({'token': logininfo.token}),method: 'POST'}).then((res) => {
			if (!res.ok) {
				openloginarea();
			}
		})
		fetch(currserver + "getnotifications", {body: JSON.stringify({'token': logininfo.token}),method: 'POST'}).then((res) => {
			if (!res.ok) {
				openloginarea();
				return;
			}
			res.json().then((nots) => {
				let list = Object.keys(nots);
				list.forEach(function(i) {
					if (readnotifications.indexOf(i) <= -1) {
						let notif = nots[i];
						Notification.requestPermission();
						if (document.hasFocus() == false || currentchatid != notif.chatid) {
							var notification = new Notification(notif.user.name + ' - Pamukky', { body: notif.content, icon: notif.user.picture });
							var audio = new Audio('notif.mp3');
							audio.play();
							notification.addEventListener('click', (event) => {
								chatitems[notif.chatid].click();
							});
						}
						readnotifications.push(i);
					}
				})
			})
		}).catch(() => {
			openloginarea();
			clearTimeout(ttimer);
		})
	},1000)
	fetch(currserver + "setonline", {body: JSON.stringify({'token': logininfo.token}),method: 'POST'}).then((res) => {
		if (!res.ok) {
			openloginarea();
			clearTimeout(ttimer);
		}
		
	})
	
	document.body.innerHTML = "";
	let maincont = document.createElement("main");
	let leftarea = document.createElement("leftarea");
	let titlebar = document.createElement("titlebar");
	titlebar.classList.add("grd");
	let chatslist = document.createElement("clist");
	//chatslist.style.paddingBottom = "24px";
	let fab = document.createElement("button");
	fab.classList.add("fab");
	fab.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" height="40" viewBox="0 -960 960 960" width="40"><path d="M446.667-446.667H200v-66.666h246.667V-760h66.666v246.667H760v66.666H513.333V-200h-66.666v-246.667Z"/></svg>';
	leftarea.appendChild(fab);
	let profilebtn = document.createElement("button");
	profilebtn.style.height = "100%";
	profilebtn.classList.add("transparentbtn")
	profilebtn.style.display = "flex";
	profilebtn.style.alignItems = "center";
	addRipple(profilebtn,"rgba(255,200,0,0.6)");

	let pfpimg = document.createElement("img");
	pfpimg.classList.add("circleimg")
	pfpimg.style.margin = "4px";
	profilebtn.appendChild(pfpimg);
	let namelbl = document.createElement("label");
	namelbl.style.margin = "4px";
	profilebtn.appendChild(namelbl);
	fetch(currserver + "getuser", {body: JSON.stringify({'uid': logininfo.uid}),method: 'POST'}).then((res) => {
		if (res.ok) {
			res.text().then((text) => {
				info = JSON.parse(text);
				namelbl.innerText = info.name;
				pfpimg.src = info.picture.replace(/%SERVER%/g,currserver);
				currentuser = info;
			})
		}else {
			openloginarea();
			clearTimeout(ttimer);
		}
	}).catch(() => {
		openloginarea();
		clearTimeout(ttimer);
	})
	
	fab.addEventListener("click",function() {
		let diag = opendialog();
		diag.title.innerText = "Add Chat";
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
		adduserchatbtn.innerText = "Add User Chat";
		adduserchatbtn.addEventListener("click",function() {
			fetch(currserver + "adduserchat", {body: JSON.stringify({'token': logininfo.token,'email': tinput.value}),method: 'POST'}).then((res) => {
				if (res.ok) {
					res.text().then((text) => {
						loadchats();
						diag.closebtn.click();
					})
				}
			}).catch(() => {
				//openloginarea();
			})
		})
		bflex.appendChild(adduserchatbtn);
		
		let creategroupbtn = document.createElement("button");
		creategroupbtn.innerText = "Create Group";
		creategroupbtn.addEventListener("click",function() {
			let f = document.createElement('input');
			f.type='file';
			f.accept = 'image/*';
			
			let ufl = false;
			let file;
			
			let diaga = opendialog();
			diaga.title.innerText = "Create Group";
			diaga.inner.style.display = "flex";
			diaga.inner.style.flexDirection = "column";
			diaga.inner.style.alignItems = "center";
			
			let pfpimge = document.createElement("img");
			pfpimge.classList.add("circleimg");
			pfpimge.style.width = "80px";
			pfpimge.style.height = "80px";
			pfpimge.style.cursor = "pointer";
			pfpimge.title = "Click to upload";
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
			nameinp.value = "New Group";
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
			createbtn.innerText = "Create Group";
			createbtn.addEventListener("click",function() {
				if (ufl) {
					fetch(currserver + "upload", {headers: {'token': logininfo.token},method: 'POST',body: file}).then(function(response) { response.json().then(function(data) {
						console.log(data);
						if (data.status == "success") {
							fetch(currserver + "creategroup", {body: JSON.stringify({'token': logininfo.token, 'name': nameinp.value, 'picture': data.url, 'info': desinp.value }),method: 'POST'}).then((res) => {
								loadchats();
								diag.closebtn.click();
							})
						}
					})}).catch(function(error) {console.error(error);});
				}else {
					fetch(currserver + "creategroup", {body: JSON.stringify({'token': logininfo.token, 'name': nameinp.value, 'picture': "", 'info': desinp.value }),method: 'POST'}).then((res) => {
						loadchats();
						diag.closebtn.click();
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
		joingroupbtn.innerText = "Join Group";
		joingroupbtn.addEventListener("click",function() {
			fetch(currserver + "joingroup", {body: JSON.stringify({'token': logininfo.token,'groupid': tinput.value}),method: 'POST'}).then((res) => {
				if (res.ok) {
					loadchats();
					diag.closebtn.click();
				}
			}).catch(() => {
				//openloginarea();
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
		diag.title.innerText = "Edit Profile";
		diag.inner.style.display = "flex";
		diag.inner.style.flexDirection = "column";
		diag.inner.style.alignItems = "center";
		
		
		let pfpimge = document.createElement("img");
		pfpimge.classList.add("circleimg");
		pfpimge.style.width = "80px";
		pfpimge.style.height = "80px";
		pfpimge.style.cursor = "pointer";
		pfpimge.title = "Click to upload";
		pfpimge.src = currentuser.picture.replace(/%SERVER%/g,currserver);
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
		desinp.value = currentuser.description;
		desval.appendChild(desinp);
		desrow.appendChild(desval);
		
		
		infotable.appendChild(namerow);
		infotable.appendChild(desrow);
		diag.inner.appendChild(infotable);
		
		let cpass = document.createElement("button");
		cpass.innerText = "Change Password";
		cpass.addEventListener("click",function() {
			let diag = opendialog();
			diag.title.innerText = "Change Password";
			diag.inner.style.display = "flex";
			diag.inner.style.flexDirection = "column";
			diag.inner.style.alignItems = "center";
			let cpasstable = document.createElement("table");
			let opr = document.createElement("tr");
			let pprt = document.createElement("td");
			pprt.innerText = "Old Password";
			opr.appendChild(pprt);
			let oprv = document.createElement("td");
			let oprinp = document.createElement("input");
			oprinp.type = "password";
			oprv.appendChild(oprinp);
			opr.appendChild(oprv);
			
			let npr = document.createElement("tr");
			let npt = document.createElement("td");
			npt.innerText = "New Password";
			npr.appendChild(npt);
			let nprv = document.createElement("td");
			let nprinp = document.createElement("input");
			nprinp.type = "password";
			nprv.appendChild(nprinp);
			npr.appendChild(nprv);
			
			let npc = document.createElement("tr");
			let npcc = document.createElement("td");
			npcc.innerText = "Confirm Password";
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
				fetch(currserver + "changepassword", {body: JSON.stringify({'token': logininfo.token, 'oldpassword': oprinp.value, 'password': nprinp.value  }),method: 'POST'}).then((res) => {
					//if (res.ok) {
						res.text().then((text) => {
							
							info = JSON.parse(text);
							if (info["status"] == "error") {
								alert(text);
								return;
							}
							logininfo = info;
							alert("Password Changed!");
						})
					//}else {
						
					//}
				})
			});
			diag.inner.appendChild(changebtn);
		})
		diag.inner.appendChild(cpass);
		
		let savebtn = document.createElement("button");
		savebtn.innerText = "Save";
		savebtn.addEventListener("click",function() {
			if (ufl) {
				fetch(currserver + "upload", {headers: {'token': logininfo.token},method: 'POST',body: file}).then(function(response) { response.json().then(function(data) {
					console.log(data);
					if (data.status == "success") {
						info.picture = data.url;
						fetch(currserver + "updateuser", {body: JSON.stringify({'token': logininfo.token, 'name': nameinp.value, 'picture': info.picture,'description': desinp.value }),method: 'POST'}).then((res) => {
							if (res.ok) {
								res.text().then((text) => {
									namelbl.innerText = info.name;
									pfpimg.src = info.picture.replace(/%SERVER%/g,currserver);
									currentuser = info;
								})
							}
						})
					}
				})}).catch(function(error) {console.error(error);});
			}else {
				fetch(currserver + "updateuser", {body: JSON.stringify({'token': logininfo.token, 'name': nameinp.value, 'picture': currentuser.picture,'description': desinp.value  }),method: 'POST'}).then((res) => {
					if (res.ok) {
						res.text().then((text) => {
							info = JSON.parse(text);
							namelbl.innerText = info.name;
							pfpimg.src = info.picture.replace(/%SERVER%/g,currserver);
							currentuser = info;
						})
					}else {
						openloginarea();
					}
				})
			}
		})
		
		diag.inner.appendChild(savebtn);
		
		
		let lout = document.createElement("button");
		lout.innerText = "Logout";
		lout.addEventListener("click",function() {
			localStorage.setItem("logininfo", null);
			location.reload();
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
						if (ci.naturalWidth < 256 && ci.naturalHeight < 256) {
							file = f.files[0];
							ufl = true;
							pfpimge.setAttribute("src",reader.result);
							return;
						}
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
						cdiag.inner.appendChild(cbtn);
					}
					
					
				};

				reader.readAsDataURL(f.files[0]); 
			}
		}
	});
	let currentchatid = 0;
	function loadchats() {
		chatslist.innerHTML = "";
		let rfb = document.createElement("button");
		rfb.addEventListener("click",function() {
			loadchats();
		})
		rfb.innerText = "Refresh"
		chatslist.appendChild(rfb)
		let lsci = null;
		fetch(currserver + "getchatslist", {body: JSON.stringify({'token': logininfo.token}),method: 'POST'}).then((res) => {
			if (res.ok) {
				res.text().then((text) => {
					chats = JSON.parse(text);
					for (let index = 0; index < chats.length; index++) {
						let item = chats[index];
						if (!item.hasOwnProperty("lastmessage") || item["lastmessage"] == null) {
							item["lastmessage"] = {
								time: new Date(),
								content: "No Messages. Send one to start conversation.",
								sender: 0
							}
						}
						let id = item["chatid"] + "";
						let itmcont = document.createElement("chatitem");
						addRipple(itmcont,"rgba(255,200,0,0.6)");
						chatitems[id] = itmcont;
						let pfpimg = document.createElement("img")
						pfpimg.loading = "lazy";
						itmcont.appendChild(pfpimg);
						let infocnt = document.createElement("infoarea");
						let namecont = document.createElement("titlecont");
						let nameh4 = document.createElement("h4");
						namecont.appendChild(nameh4)
						let lmt = document.createElement("time");
						let dt = new Date(item.lastmessage.time);
						let dtt = new Date(item.lastmessage.time);
						let nowdate = new Date();
						//try {
							if (dtt.setHours(0,0,0,0) == nowdate.setHours(0,0,0,0)) {
								lmt.innerText = dt.getHours().toString().padStart(2, '0') + ":" + dt.getMinutes().toString().padStart(2, '0');
							}else {
								lmt.innerText = dt.getDate() + "/" + (dt.getMonth() + 1) + "/" + dt.getFullYear() + " " + dt.getHours().toString().padStart(2, '0') + ":" + dt.getMinutes().toString().padStart(2, '0');
							}
						//}catch {}
						namecont.appendChild(lmt);
						infocnt.appendChild(namecont);
						let lastmsgcontent = document.createElement("label")
						getuserinfo(item.lastmessage.sender, function(sender) {
							lastmsgcontent.innerText = sender.name + ": " + item.lastmessage.content.split("\n")[0];
						});

						infocnt.appendChild(lastmsgcontent)
						itmcont.appendChild(infocnt);
						
						chatslist.appendChild(itmcont);
						let cinfo = {};
						itmcont.addEventListener("click",function() {
							if (lsci != null) {
								lsci.style.background = ""
								lsci.style.borderRadius = "";
								lsci.style.transform = "";
							}
							if (currentchatview) {
								currentchatview.kill();
								rightarea.removeChild(currentchatview.chat);
							}
							currentchatview = createchatarea(id, (item.type == "user" ? item.user : item.group));
							currentchatid = id;
							currentchatview.titlelabel.innerText = cinfo.name;
							currentchatview.pfp.src = cinfo.picture.replace(/%SERVER%/g,currserver);
							rightarea.appendChild(currentchatview.chat)
							if (document.body.clientWidth <= 800) {
								rightarea.style.display = "flex";
								currentchatview.backbutton.style.display = ""
								currentchatview.backbutton.onclick = function() {
									rightarea.style.left = "";
									leftarea.style.display = "";
									requestAnimationFrame(function() {leftarea.style.opacity = "1";})
									setTimeout(function() {
										rightarea.style.display = "none";
										leftarea.style.display = "";
										currentchatview.chat.innerHTML = "";
									},500)
								}
								requestAnimationFrame(function() {
									setTimeout(function() {
										rightarea.style.left = "0px";
										leftarea.style.opacity = "0";
										setTimeout(function() {
											leftarea.style.display = "none";
										},500)
									},100)
								})
							}else {
								currentchatview.backbutton.style.display = "none"
								rightarea.style.display = "";
								leftarea.style.display = "";
								itmcont.style.background = "orange"
								itmcont.style.borderRadius = "5px 0px 0px 5px";
								itmcont.style.transform = "translateX(4px)";
							}
							lsci = itmcont;
						})

						//callback for get*info
						function callback(info) {
							pfpimg.src = info.picture.replace(/%SERVER%/g,currserver);
							nameh4.innerText = info.name;
							cinfo = info;
						}
						//make the correct call
						if (item.type == "user") {
							getuserinfo(item.user, callback);
						}else if (item.type == "group") {
							getgroupinfo(item.group, callback);
						}
					}
					
					let clbtm = document.createElement("div");
					clbtm.style.height = "24px";
					chatslist.appendChild(clbtm);
					let fabhint = document.createElement("label");
					//fabhint.style.background = "var(--main-bg)";
					//fabhint.style.position = "sticky";
					//fabhint.style.bottom = "-4px";
					fabhint.style.display = "block";
					fabhint.innerText = "Click on the \"+\" button to add a new chat > > ";
					
					chatslist.appendChild(fabhint);
					
					
				})
			}else {
				openloginarea();
			}
		}).catch(() => {
			openloginarea();
		})
	}
	
	loadchats();
	titlebar.appendChild(profilebtn);
	leftarea.appendChild(titlebar);
	leftarea.appendChild(chatslist);
	maincont.appendChild(leftarea);
	let rightarea = document.createElement("rightarea");
	maincont.appendChild(rightarea);
	
	document.body.appendChild(maincont);


	function createchatarea(chatid,ugid) {
		let f = document.createElement('input');
		f.type='file';
		f.multiple = true;
		
		let fileslist = [];
		let isuserchat = chatid.includes("-");
		let ocp = {};
		let messageflexes = {};
		let mchat = document.createElement("mchat");
		let titlebar = document.createElement("titlebar");
		let backbtn = document.createElement("button");
		addRipple(backbtn,"rgba(255,200,0,0.6)");
		backbtn.classList.add("cb")
		backbtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 -960 960 960" width="20"><path d="M384-96 0-480l384-384 68 68-316 316 316 316-68 68Z"/></svg>';
		backbtn.style.display = "none";
		titlebar.appendChild(backbtn)
		let pfpimg = document.createElement("img");
		pfpimg.classList.add("circleimg")
		pfpimg.style.margin = "2px";
		titlebar.appendChild(pfpimg);
		let titletxt = document.createElement("h4");
		titletxt.style.paddingLeft = "4px";
		titlebar.appendChild(titletxt);
		let infotxt = document.createElement("label");
		infotxt.style.fontSize = "10px";
		infotxt.style.padding = "6px";
		titlebar.appendChild(infotxt);
		titlebar.appendChild(document.createElement("ma"));
		
		let infobtn = document.createElement("button");
		addRipple(infobtn,"rgba(255,200,0,0.6)");
		infobtn.classList.add("cb")
		infobtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 -960 960 960" width="20"><path d="M444-288h72v-240h-72v240Zm35.789-312Q495-600 505.5-610.289q10.5-10.29 10.5-25.5Q516-651 505.711-661.5q-10.29-10.5-25.5-10.5Q465-672 454.5-661.711q-10.5 10.29-10.5 25.5Q444-621 454.289-610.5q10.29 10.5 25.5 10.5Zm.487 504Q401-96 331-126q-70-30-122.5-82.5T126-330.958q-30-69.959-30-149.5Q96-560 126-629.5t82.5-122Q261-804 330.958-834q69.959-30 149.5-30Q560-864 629.5-834t122 82.5Q804-699 834-629.276q30 69.725 30 149Q864-401 834-331q-30 70-82.5 122.5T629.276-126q-69.725 30-149 30ZM480-168q130 0 221-91t91-221q0-130-91-221t-221-91q-130 0-221 91t-91 221q0 130 91 221t221 91Zm0-312Z"/></svg>';
		infobtn.addEventListener("click",function() {
			viewuginfo(ugid,isuserchat ? "user" : "group",crole)
		})
		
		titlebar.appendChild(infobtn);
		mchat.appendChild(titlebar);
		
		let messageslist = document.createElement("messageslist")
		mchat.appendChild(messageslist);
		
		let mgb = document.createElement("msgbar");
		let rc = document.createElement("replycont");
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
				rb.innerText = "x";
				let img = document.createElement("img");
				img.style.background = "white";
				img.classList.add("loading");
				let imgs = new Image();
				imgs.src = reader.result;
				if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
					// dark mode
					img.src = "file_dark.svg";
				}else {
					img.src = "file.svg";
				}
				img.classList.add("msgimg");
				imgs.onload = function() {
					img.src = imgs.src;
				}
				//img.src = reader.result;
				ui.appendChild(img)
				att.appendChild(ui);
				att.appendChild(rb);
				atc.appendChild(att);
				fetch(currserver + "upload", {headers: {'token': logininfo.token,"filename": encodeURI(file.name)},method: 'POST',body: file}).then(function(response) { response.json().then(function(data) {
					console.log(data);
					if (data.status == "success") {
						fileslist.push(data.url);
						sendbtn.disabled = false;
						img.classList.remove("loading");
						rb.addEventListener("click",function() {
							const index = fileslist.indexOf(data.url);
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
					}
				})}).catch(function(error) {console.error(error);});
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
		attachbtn.classList.add("cb")
		attachbtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24"><path d="M640-520v-200h80v200h-80ZM440-244q-35-10-57.5-39T360-350v-370h80v476Zm30 164q-104 0-177-73t-73-177v-370q0-75 52.5-127.5T400-880q75 0 127.5 52.5T580-700v300h-80v-300q-1-42-29.5-71T400-800q-42 0-71 29t-29 71v370q-1 71 49 120.5T470-160q25 0 47.5-6.5T560-186v89q-21 8-43.5 12.5T470-80Zm170-40v-120H520v-80h120v-120h80v120h120v80H720v120h-80Z"/></svg>';
		mgbd.appendChild(attachbtn)
		let msginput = document.createElement("textarea");
		
		mgbd.appendChild(msginput)
		
		let sendbtn = document.createElement("button");
		addRipple(sendbtn,"rgba(255,200,0,0.6)");
		sendbtn.classList.add("cb")
		sendbtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24"><path d="M120-160v-640l760 320-760 320Zm80-120 474-200-474-200v140l240 60-240 60v140Zm0 0v-400 400Z"/></svg>';
		mgbd.appendChild(sendbtn)
		
		mgb.appendChild(mgbd);
		
		mchat.appendChild(mgb)
		
		let lastmessagekey = "";
		let chatpage;
		let lastmsgsender;
		let lastmsgtime = new Date(0);
		let msgscont;
		let selectedMessages = [];
		let sendedmessages = [];
		let crole = {"AdminOrder":0,"AllowMessageDeleting":true,"AllowEditingSettings":true,"AllowKicking":true,"AllowBanning":true,"AllowSending":true,"AllowEditingUsers":true,"AllowSendingReactions":true};
		let replymsgid = undefined;
		
		if (!isuserchat) {
			fetch(currserver + "getgrouproles", {body: JSON.stringify({'token': logininfo.token, 'groupid': ugid}),method: 'POST'}).then((res) => {
				if (res.ok) {
					res.text().then((text) => {
						let roles = JSON.parse(text);
						fetch(currserver + "getgroupusers", {body: JSON.stringify({'token': logininfo.token, 'groupid': ugid}),method: 'POST'}).then((res) => {
							if (res.ok) {
								res.text().then((text) => {
									let users = JSON.parse(text);
									let ukeys = Object.keys(users);
									infotxt.innerText = ukeys.length + " Members";
									let cuser = users[logininfo.uid];
									crole = roles[cuser.role];
									if (crole.AllowSending == true) {
										
									}else {
										mgb.style.display = "none";
									}
								})
							}
						});
					})
				}
			});
		}
		
		function addmsg(msg,id) {
			let dt = new Date(msg.time);
			let dtt = new Date(msg.time);
			let nowdate = new Date();
			if (dtt.setHours(0,0,0,0) != lastmsgtime.setHours(0,0,0,0)) {
				lastmsgtime = new Date(msg.time);
				addmsg({
					sender:0,
					content: dt.getDate() + "/" + (dt.getMonth() + 1) + "/" + dt.getFullYear(),
					   time: dt
				})
				lastmsgsender = msg.sender;
			}
			if (msg.sender != lastmsgsender) {
				msgscont = document.createElement("msgscont");
				messageslist.appendChild(msgscont)
				lastmsgsender = msg.sender;
			}
			let senderuser = {};
			let msgc = document.createElement("msgcont");
			messageflexes[id] = msgc;
			function selectmessage() {
				if (selectedMessages.includes(id)) {
					selectedMessages.splice(selectedMessages.indexOf(id),1);
					msgc.style.background = "";
				}else {
					selectedMessages.push(id);
					msgc.style.background = "orange";
				}
			}
			msgc.addEventListener("click",function() {
				if (selectedMessages.length > 0) {
					selectmessage();
				}
			})
			
			msgc.addEventListener("contextmenu",function(event) {
				let tagname = event.target.tagName.toString();
				if (tagname.toLowerCase() == "video") return;
				if (tagname.toLowerCase() == "a") return;
				if (tagname.toLowerCase() == "img") return;
				if (msg.sender != 0) {
					let ctxdiv = document.createElement("div");
					ctxdiv.style.position = "absolute";
					ctxdiv.style.top = event.clientY + "px";
					ctxdiv.style.left = event.clientX + "px";
					ctxdiv.classList.add("customctx");
					ctxdiv.style.minWidth = "315px";
					ctxdiv.style.maxWidth = "315px";
					if (crole.AllowSendingReactions == true) {
						let reactionsdiv = document.createElement("div");
						reactionsdiv.style.maxWidth = "315px";
						reactionemojis.forEach((item) => {
							let itm = item.toString();
							let reactionbtn = document.createElement("button");
							reactionbtn.style.border = "none";
							reactionbtn.style.background = "none";
							reactionbtn.classList.add("orangebgonhover");
							reactionbtn.style.padding = "4px";
							reactionbtn.style.width = "35px";
							reactionbtn.style.height = "35px";
							reactionbtn.style.fontSize = "20px";
							reactionbtn.innerText = itm;
							reactionsdiv.appendChild(reactionbtn);
							reactionbtn.addEventListener("click",function() {
								fetch(currserver + "sendreaction", {body: JSON.stringify({'token': logininfo.token, 'chatid': chatid, 'msgid': id, reaction: itm}),method: 'POST'}).then((res) => {
									
								})
								clik();
							});
						});
						ctxdiv.appendChild(reactionsdiv);
					}
					let cnt = document.createElement("div");
					ctxdiv.appendChild(cnt);
					if (msg.issearch == true) { // Was used in v2 area, and yes this entire logic looks like it needs a refactor
						let gomsgbutton = document.createElement("button");
						addRipple(gomsgbutton,"rgba(255,200,0,0.6)",true);
						gomsgbutton.innerText = "Go To Message";
						gomsgbutton.addEventListener("click", function() {
							init();
							messagespage = Math.floor( (messages.indexOf(key) - 1) / messagespagesize );
							console.log(messagespage);
							loadmessages();
							setTimeout(function() {
								getid("messagesList").scrollTop = messageflexes[key].offsetTop - 80;
								messageflexes[key].style.background = "rgba(255,200,0,0.5)";
								setTimeout(function() {
									messageflexes[key].style.background = "";
								},200);
							},200)
							clik();
						})
						cnt.appendChild(gomsgbutton);
					}
					let replybutton = document.createElement("button");
					addRipple(replybutton,"rgba(255,200,0,0.6)",true);
					replybutton.innerText = "Reply";
					replybutton.disabled = !crole.AllowSending;
					replybutton.addEventListener("click", function() {
						replymsgid = id;
						rc.style.display = "";
						//requestAnimationFrame(function() {
						//	getid("repcont").style.maxHeight = "100%";
						//});
						if (msg.sender == 0) {
							replycnt.innerText = msg.content.replace(/JOINED_GROUP/g,"Joined This Group").replace(/LEAVED_GROUP/g,"Leaved This Group").replace(/EDITED_GROUP/g,"Edited This Group").replace(/CREATED_GROUP/g,"Created This Group").replace(/KICKED_FROM_GROUP_END/g,"").replace(/KICKED_FROM_GROUP/g,"Kicked From This Group By ");
						}else {
							replycnt.innerText = msg.content;
						}
						
						replysname.innerText = senderuser.name;
						clik();
					})
					cnt.appendChild(replybutton);
					let forwardbutton = document.createElement("button");
					addRipple(forwardbutton,"rgba(255,200,0,0.6)",true);
					forwardbutton.innerText = "Forward Message...";
					let chatinfs = {};
					forwardbutton.addEventListener("click", function() {
						let diag = opendialog();
						if (document.body.clientWidth <= 800) {
							diag.dialog.style.width = "40%";
						}
						let fcb = document.createElement("bbar");
						fcb.style.minHeight = "30px";
						let cst = document.createElement("label");
						cst.style.overflowWrap = "anywhere";
						cst.style.maxWidth = "calc(100%-30px)";
						cst.style.paddingRight = "30px";
						fcb.appendChild(cst);
						let sb = document.createElement("button");
						sb.classList.add("cb");
						sb.style.position = "absolute";
						sb.style.right = "0";
						sb.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24"><path d="M120-160v-640l760 320-760 320Zm80-120 474-200-474-200v140l240 60-240 60v140Zm0 0v-400 400Z"/></svg>';
						fcb.appendChild(sb);
						let fchatselectsid = [];
						let gous = [];
						function refreshlabel() {	
							let text = "";
							gous.forEach(function(i,id) {
								text += i + (id > gous.length-2 ? "" : ", ");
							})
							cst.innerText = text;
						}
						fetch(currserver + "getchatslist", {body: JSON.stringify({'token': logininfo.token}),method: 'POST'}).then((res) => {
							if (res.ok) {
								res.text().then((text) => {
									chats = JSON.parse(text);
									for (let index = 0; index < chats.length; index++) {
										let item = chats[index];
										if (!item.hasOwnProperty("lastmessage") || item["lastmessage"] == null) {
											item["lastmessage"] = {
												time: new Date(),
												content: "No Messages. Send one to start conversation."
											}
										}
										let itmcont = document.createElement("chatitem");
										addRipple(itmcont,"rgba(255,200,0,0.6)");
										let pfpimg = document.createElement("img")
										itmcont.appendChild(pfpimg);
										let infocnt = document.createElement("infoarea");
										let namecont = document.createElement("titlecont");
										let nameh4 = document.createElement("h4");
										namecont.appendChild(nameh4)
										let lmt = document.createElement("time");
										let dt = new Date(item.lastmessage.time);
										let dtt = new Date(item.lastmessage.time);
										let nowdate = new Date();
										//try {
											if (dtt.setHours(0,0,0,0) == nowdate.setHours(0,0,0,0)) {
												lmt.innerText = dt.getHours().toString().padStart(2, '0') + ":" + dt.getMinutes().toString().padStart(2, '0');
											}else {
												lmt.innerText = dt.getDate() + "/" + (dt.getMonth() + 1) + "/" + dt.getFullYear() + " " + dt.getHours().toString().padStart(2, '0') + ":" + dt.getMinutes().toString().padStart(2, '0');
											}
										//}catch {}
										namecont.appendChild(lmt);
										infocnt.appendChild(namecont);
										let lastmsgcontent = document.createElement("label")
										getuserinfo(item.lastmessage.sender, function(sender) {
											lastmsgcontent.innerText = sender.name + ": " + item.lastmessage.content.split("\n")[0];
										});
										infocnt.appendChild(lastmsgcontent)
										itmcont.appendChild(infocnt);
										let cinfo = {};
										diag.inner.appendChild(itmcont);
										let id = item["chatid"] + "";
										itmcont.addEventListener("click",function() {
											if (fchatselectsid.includes(id)) {
												gous.splice(fchatselectsid.indexOf(id),1);
												fchatselectsid.splice(fchatselectsid.indexOf(id),1);
												itmcont.style.background = "";
											}else {
												fchatselectsid.push(id);
												gous.push(cinfo.name);
												itmcont.style.background = "orange";
											}
											refreshlabel();
										})
										//callback for get*info
										function callback(info) {
											pfpimg.src = info.picture.replace(/%SERVER%/g,currserver);
											nameh4.innerText = info.name;
											cinfo = info;
										}
										//make the correct call
										if (item.type == "user") {
											getuserinfo(item.user, callback);
										}else if (item.type == "group") {
											getgroupinfo(item.group, callback);
										}
									}
									diag.inner.appendChild(fcb)
								})
							}else {
								openloginarea();
							}
						}).catch(() => {
							openloginarea();
						})
						
						sb.onclick = function() {
							let messages = selectedMessages;
							if (messages.length == 0) messages = [id];
							fetch(currserver + "forwardmessage", {body: JSON.stringify({'token': logininfo.token, 'chatid': chatid, 'msgs': messages, 'tochats': fchatselectsid}),method: 'POST'}).then((res) => {

							})
							diag.closebtn.click();
						}
						
						
						clik();
					})
					cnt.appendChild(forwardbutton);
					let selectbutton = document.createElement("button");
					selectbutton.innerText = "Multi-Select";
					addRipple(selectbutton,"rgba(255,200,0,0.6)",true);
					selectbutton.addEventListener("click", function() {
						selectmessage();
						clik();
					})
					cnt.appendChild(selectbutton);
					let savebtn = document.createElement("button");
					savebtn.innerText = "Save Message";
					addRipple(savebtn,"rgba(255,200,0,0.6)",true);
					savebtn.addEventListener("click", function() {
						let messages = selectedMessages;
						if (messages.length == 0) messages = [id];
						fetch(currserver + "savemessage", {body: JSON.stringify({'token': logininfo.token, 'chatid': chatid, 'msgs': messages}),method: 'POST'}).then((res) => {

						})
						clik();
					})
					cnt.appendChild(savebtn);
					let deletebutton = document.createElement("button");
					addRipple(deletebutton,"rgba(255,200,0,0.6)",true);
					deletebutton.innerText = "Delete Message";
					let copybutton = document.createElement("button");
					addRipple(copybutton,"rgba(255,200,0,0.6)",true);
					copybutton.innerText = "Copy selected text";
					copybutton.addEventListener("click", function() {
						document.execCommand('copy');
						clik();
					})
					cnt.appendChild(copybutton);
					let clik = function() {ctxdiv.style.opacity = "0";setTimeout(function() {document.body.removeChild(ctxdiv); document.body.removeEventListener("click", clik);document.body.removeEventListener("contextmenu", clik)},200)}
					deletebutton.addEventListener("click", () => {
						if (confirm("Do you really want to delete?")) {
							let messages = selectedMessages;
							if (messages.length == 0) messages = [id];
							fetch(currserver + "deletemessage", {body: JSON.stringify({'token': logininfo.token, 'chatid': chatid, 'msgs': messages}),method: 'POST'}).then((res) => {

							})
						}
						clik();
					})
					if (selectedMessages.length > 0) {
						deletebutton.disabled = false;
					}else {
						deletebutton.disabled = !(crole.AllowMessageDeleting || msg.sender == logininfo.uid);
					}
					cnt.appendChild(deletebutton);
					ctxdiv.style.opacity = "0";
					document.body.appendChild(ctxdiv);
					requestAnimationFrame(function() {
						ctxdiv.style.opacity = "";
					});
					document.body.addEventListener("click",clik)
					setTimeout(function() {
						document.body.addEventListener("contextmenu",clik)
					},100)
					if (event.clientX > document.body.clientWidth - ctxdiv.offsetWidth) {
						ctxdiv.style.left = (document.body.clientWidth - ctxdiv.offsetWidth) + "px";
					}
					if (event.clientY > document.body.clientHeight - ctxdiv.offsetHeight) {
						ctxdiv.style.top = (document.body.clientHeight - ctxdiv.offsetHeight) + "px";
					}
					event.preventDefault();
				}
			});
			let msgm = document.createElement("msgmain");
			let msgbuble = document.createElement("msgbuble");
			let msgcontent = document.createElement("msgcontent");
			let msgreactions = document.createElement("msgreacts");
			let msgtime = document.createElement("msgtime");
			let msgtimelbl = document.createElement("label");
			let msgsender = document.createElement("msgsender");
			let msgsendertxt = document.createElement("label");
			let msgpfp = document.createElement("img");
			msgcontent.style.overflowWrap = "break-word";
			msgcontent.innerHTML = linkify(msg.content);
			msgtimelbl.innerText = dt.getHours().toString().padStart(2, '0') + ":" + dt.getMinutes().toString().padStart(2, '0');
			
			if (msg.forwardedfrom != undefined) {
				let il = document.createElement("div");
				il.style.fontSize = "12px";
				il.innerText = "Forwarded From "
				let fu = document.createElement("b");
				fu.style.cursor = "pointer";
				fu.addEventListener("click",function() {
					viewuginfo(msg.forwardedfrom, "user")
				})
				getuserinfo(msg.forwardedfrom,function(user) {
					fu.innerText = user.name;
				})

				/*fetch(currserver + "getuser", {body: JSON.stringify({'uid': msg.forwardedfrom}),method: 'POST'}).then((res) => {
					if (res.ok) {
						res.text().then((text) => {
							let uii = JSON.parse(text);
							//serpfp.src = uii.picture.replace(/%SERVER%/g,currserver);
							fu.innerText = uii.name;
						})
					}
				});*/
				il.appendChild(fu);
				msgbuble.appendChild(il);
			}
			
			if (msg.replymsgcontent != undefined) {
				let rc = document.createElement("replycont");
				addRipple(rc,"rgba(255,200,0,0.6)");
				rc.addEventListener("click",function() {
					
				})
				let replysname = document.createElement("b");
				getuserinfo(msg.replymsgsender,function(user) {
					replysname.innerText = user.name;
				})

				rc.appendChild(replysname);
				let replycnt = document.createElement("label");
				replycnt.innerText = msg.replymsgcontent;
				rc.appendChild(replycnt);
				msgbuble.appendChild(rc);
			}
			
			
			
			if (msg.sender != 0) {
				msgm.appendChild(msgsender);
				getuserinfo(msg.sender,(user) => {
					msgsendertxt.innerText = user.name;
					msgpfp.src = user.picture.replace(/%SERVER%/g,currserver);
					msgpfp.title = user.name;
					senderuser = user;
				})

				msgpfp.style.cursor = "pointer";
				msgpfp.addEventListener("click",function() {
					viewuginfo(msg.sender,"user")
				})
			}
			msgm.appendChild(msgbuble);
			if (msg.files != undefined) {
				msg.gImages.forEach(function(i) {
					let a = document.createElement("a");
					a.href = i.url.replace(/%SERVER%/g,currserver);
					a.target = "_blank";
					let imgs = new Image();
					imgs.src = i.url.replace(/%SERVER%/g,currserver);
					let img = document.createElement("img");
					img.style.background = "white";
					if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
						// dark mode
						img.src = "file_dark.svg";
					}else {
						img.src = "file.svg";
					}
					img.classList.add("msgimg");
					img.onclick = function() {
						a.click();
					}
					imgs.onload = function() {
						img.src = imgs.src;
						img.onclick = function() {
							imageView(imgs.src);
						}
					}
					img.style.width = img.style.height = Math.max(240 / msg.gImages.length,64) + "px";
					let index = i.url.lastIndexOf("=") + 1; let filename = i.url.substr(index);
					img.title = filename;
					//a.appendChild(img)
					msgbuble.appendChild(img);
					
				})
				msg.gVideos.forEach(function(i) {
					
					let vid = document.createElement("video");
					vid.muted = true;
					vid.autoplay = true;
					vid.controls = true;
					vid.src = i.url.replace(/%SERVER%/g,currserver); 
					vid.style.aspectRatio = "16/9";
					vid.style.width = "100%";
					let index = i.url.lastIndexOf("=") + 1; let filename = i.url.substr(index);
					vid.title = filename;
					msgbuble.appendChild(vid);
					
				})
				if (msg.gImages.length > 0) msgbuble.appendChild(document.createElement("br"));
				msg.gFiles.forEach(function(i) {
					let a = document.createElement("a");
					a.style.position = "relative";
					a.download = i.name;
					a.href = i.url.replace(/%SERVER%/g,currserver);
					//a.target = "_blank";
					let fd = document.createElement("filed");
					addRipple(a,"rgba(255,255,255,0.6)");
					let img = document.createElement("img");
					if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
						// dark mode
						img.src = "file_dark.svg";
					}else {
						img.src = "file.svg";
					}
					let filename = i.name;
					a.title = filename;
					fd.appendChild(img)
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
					a.appendChild(fd)
					msgbuble.appendChild(a);
				})
				
			}
			
			msgbuble.appendChild(msgcontent);
			msgbuble.appendChild(msgreactions);
			
			if (msg.sender != 0) {
				msgm.appendChild(msgtime);
			}
			
			let msgstatus = null;
			
			
			
			if (msg.sender == logininfo.uid) {
				msgm.classList.add("sender");
				msgc.appendChild(document.createElement("ma"));
				msgsender.appendChild(document.createElement("ma"));
				msgsender.appendChild(msgsendertxt)
				msgtime.appendChild(document.createElement("ma"));
				msgtime.appendChild(msgtimelbl);
				msgstatus = document.createElement("div");
				msgstatus.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 -960 960 960" width="20"><path d="M395-285 226-455l50-50 119 118 289-288 50 51-339 339Z"/></svg>';
				msgtime.appendChild(msgstatus);
				msgc.appendChild(msgm);
				msgc.appendChild(msgpfp);
			}else {
				if (msg.sender == 0) {
					msgc.appendChild(document.createElement("ma"));
					msgc.appendChild(msgm);
					msgc.appendChild(document.createElement("ma"));
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
			msgscont.appendChild(msgc);
			return {message: msgc, status:msgstatus,msgreactions: msgreactions,reactions: {}};
		}
		
		let sendingmessage = false;
		let msgcdatas = {};
		sendbtn.disabled = true;
		msginput.addEventListener("input",function() {
			if (msginput.value.trim().length == 0 && fileslist.length < 1) {
				sendbtn.disabled = true;
			}else {
				sendbtn.disabled = false;
			}
		})
		
		sendbtn.addEventListener("click",function() {
			sendingmessage = true;
			sendbtn.disabled = true;
			let msg = addmsg({
				sender:logininfo.uid,
				content: msginput.value,
				time: new Date()
			},0);
			
			msg.status.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 -960 960 960" width="20"><path d="m614-310 51-51-149-149v-210h-72v240l170 170ZM480-96q-79.376 0-149.188-30Q261-156 208.5-208.5T126-330.958q-30-69.959-30-149.5Q96-560 126-630t82.5-122q52.5-52 122.458-82 69.959-30 149.5-30 79.542 0 149.548 30.24 70.007 30.24 121.792 82.08 51.786 51.84 81.994 121.92T864-480q0 79.376-30 149.188Q804-261 752-208.5T629.869-126Q559.738-96 480-96Zm0-384Zm.477 312q129.477 0 220.5-91.5T792-480.477q0-129.477-91.023-220.5T480.477-792Q351-792 259.5-700.977t-91.5 220.5Q168-351 259.5-259.5T480.477-168Z"/></svg>';
			fetch(currserver + "sendmessage", {body: JSON.stringify({'token': logininfo.token, 'chatid': chatid, 'content': msginput.value.trim(),replymsg: replymsgid,files: (fileslist.length > 0 ? fileslist : null)}),method: 'POST'}).then((res) => {
				if (res.ok) {
					res.text().then((text) => {
						res = JSON.parse(text);
						if (res.result == "error") {
							
						}else {
							msg.status.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 -960 960 960" width="20"><path d="M395-285 226-455l50-50 119 118 289-288 50 51-339 339Z"/></svg>';
						}
						
						sendedmessages.push(msg.message);
						updatechat();
					})
				}else {
					msgscont.removeChild(msg.message);
				}
				sendingmessage = false;
			}).catch(() => {
				msgscont.removeChild(msg.message);
				sendingmessage = false;
			})
			fileslist = [];
			atc.innerHTML = "";
			msginput.value = "";
			rc.style.display = "none";
			replymsgid = undefined;
		});
		
		msginput.addEventListener("keydown",function(e) {
			if (e.key == "Enter" && !e.shiftKey) {
				sendbtn.click();
				e.preventDefault();
			}
		})
		
		let isready = true;
		fetch(currserver + "getchatpage", {body: JSON.stringify({'token': logininfo.token, 'chatid': chatid, 'page': 0}),method: 'POST'}).then((res) => {
				if (res.ok) {
					res.text().then((text) => {
						isready = true;
						chatpage = JSON.parse(text);
						let mkeys = Object.keys(chatpage);
						
						mkeys.forEach(i => {
							let msg = chatpage[i];
							msgcdatas[i] = addmsg(msg,i);
							lastmessagekey = i;
						})

						
						mkeys.forEach(function(i) {
							let msgd = msgcdatas[i];
							
							let reactions = chatpage[i].reactions;
							if (reactions) {
								Object.keys(reactions).forEach(function(ir) {
									let react = reactions[ir];
									let reacc = document.createElement("div");
									reacc.style.cursor = "pointer";
									reacc.addEventListener("click",function() {
										fetch(currserver + "sendreaction", {body: JSON.stringify({'token': logininfo.token, 'chatid': chatid, 'msgid': i, reaction: ir}),method: 'POST'}).then((res) => {
											
										})
									})
									let reace = document.createElement("label");
									reace.innerText = ir;
									let cnter = document.createElement("label");
									cnter.innerText = "0";
									reacc.appendChild(reace);
									reacc.appendChild(cnter);
									msgd.msgreactions.appendChild(reacc);
									
									msgd.reactions[ir] = {reaction: ir, container: reacc, counter:cnter}

									let rkk = Object.keys(react);
									let doescontaincurr = false;
									Object.keys(react).forEach(function(aa) {
										let a = react[aa];
										if (a.sender == logininfo.uid) {
											doescontaincurr = true;
										}
									})

									if (doescontaincurr) {
										msgd.reactions[ir].container.classList.add("rcted")
									}

									msgd.reactions[ir].counter.innerText = rkk.length;
								});
								
							}	
								
							
						});
						
						messageslist.scrollTop = messageslist.scrollHeight;
						ocp = chatpage;
					})
				}else {
					openloginarea();
				}
			})
		function updatechat() {
			console.log("isready", isready)
			if (!isready) return;
			isready = false;
			if (isuserchat) {
				fetch(currserver + "getonline", {body: JSON.stringify({'token': logininfo.token, 'uid': ugid}),method: 'POST'}).then((res) => {
					if (res.ok) {
						res.text().then((text) => {
							if (text == "Online") {
								infotxt.innerText = "Online";
							}else {
								let dt = new Date(text);
								infotxt.innerText = "Last Online: " + dt.getDate() + "/" + (dt.getMonth() + 1) + "/" + dt.getFullYear() + ", " + dt.getHours().toString().padStart(2, '0') + ":" + dt.getMinutes().toString().padStart(2, '0');
							}
						})
					}
				});
			}
			
			
			
			
			if (sendingmessage == false) {
				fetch(currserver + "getupdates", {body: JSON.stringify({'token': logininfo.token, 'id': chatid}),method: 'POST'}).then((res) => {
					if (res.ok) {
						res.json().then((json) => {
							isready = true;
							let kys = Object.keys(json);
							kys.forEach((i) => {
								let val = json[i];
								if (val.event == "NEWMESSAGE") {
									
									if (chatpage[i] == undefined) {
										chatpage[i] = val;
										//mkeys[x] = i;
										let msg = val;
										msgcdatas[i] = addmsg(msg,i);
										lastmessagekey = i;
										messageslist.scrollTop = messageslist.scrollHeight;
									}
								}
								if (val.event == "DELETED") {
									messageflexes[i].remove();
									let index = selectedMessages.indexOf(i);
									if (index >= 0) {
										selectedMessages.splice(index,1);
									}
								}
								if (val.event == "REACTIONS") {
									let msgd = msgcdatas[i];
									let reactions = val.rect;
									let rkeys = Object.keys(reactions);
									let news = Object.keys(reactions).filter(x => !Object.keys(msgd.reactions).includes(x));
									news.forEach(function(ir) {
										let react = reactions[ir];
										let reacc = document.createElement("div");
										reacc.addEventListener("click",function() {
											fetch(currserver + "sendreaction", {body: JSON.stringify({'token': logininfo.token, 'chatid': chatid, 'msgid': i, reaction: ir}),method: 'POST'}).then((res) => {
												
											})
										})
										let reace = document.createElement("label");
										reace.innerText = ir;
										let cnter = document.createElement("label");
										cnter.innerText = "0";
										reacc.appendChild(reace);
										reacc.appendChild(cnter);
										msgd.msgreactions.appendChild(reacc);
										
										msgd.reactions[ir] = {reaction: ir, container: reacc, counter:cnter}
									});
									
									let nurl = [];
									Object.keys(msgd.reactions).forEach((i) => {
										let v = msgd.reactions[i];
										nurl.push(v.container);
									})
									
									rkeys.forEach(function(i) {
										let rk = reactions[i];
										let rkk = Object.keys(rk);
										let doescontaincurr = false;
										rkk.forEach(function(aa) {
											let a = rk[aa];
											if (a.sender == logininfo.uid) {
												doescontaincurr = true;
											}
										})
										nurl.splice(nurl.indexOf(msgd.reactions[i].container),1)
										if (doescontaincurr == true) {
											msgd.reactions[i].container.classList.add("rcted")
										}else {
											msgd.reactions[i].container.classList.remove("rcted")
										}
										
										msgd.reactions[i].counter.innerText = rkk.length;
									})
									nurl.forEach((i) => {
										try {i.remove();delete msgd.reactions[i];}catch {}
									})
									Object.keys(msgd.reactions).forEach((i) => {
										let v = msgd.reactions[i];
										if (nurl.indexOf(v.container) > -1) {
											delete v;
										}
									})
								}
							})
							sendedmessages.forEach(function(i) {
								i.remove();
							})
							sendedmessages = [];
						})
					}else {
						//openloginarea();
						isready = true;
					}
				})
			}else {
				isready = true;
			}
		}
		
		//updatechat();
		
		let chatupdatetimer = setInterval(updatechat,500)
		return {
			chat: mchat,
			titlebar: titlebar,
			pfp: pfpimg,
			titlelabel: titletxt,
			infolabel: infotxt,
			addmsg: addmsg,
			backbutton:backbtn,
			kill: function() {
				clearInterval(chatupdatetimer);
			}
		};
	}
}

if (currserver == "") {
	if (localStorage.getItem("server") == null) {
		openconnectarea();
	}else {
		currserver = localStorage.getItem("server");
		fetch(currserver + "ping").then(function() {
			if (localStorage.getItem("logininfo") == null) {
				openloginarea();
			}else {
				logininfo = JSON.parse(localStorage.getItem("logininfo"));
				loadmainarea();
			}
			
		}).catch(function() {
			openconnectarea(true);
		})
	}
}else {
	fetch(currserver + "ping").then(function() {
		openloginarea();
	}).catch(function() {
		openconnectarea(true);
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

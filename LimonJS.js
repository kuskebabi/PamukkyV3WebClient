//By usn:HAKANKOKCU
//CHARSET=UTF-8
setTimeout(function() {
    var stlobj = document.createElement("style");
    stlobj.innerHTML = ".budgiebutton {outline:1px white;border-radius:10px;border:none;padding:5px}";
    document.body.appendChild(stlobj)
},100)
console.log("LimonJS imported")
function asyncfor(start,end,step,importedvar,func,speed) {
    var stp = start;
    var asyncforr = setInterval(function() {
        func(stp,importedvar);
        if (stp > end) {
            clearInterval(asyncforr);
        }
        if (stp === end) {
            clearInterval(asyncforr);
        }
        stp += step;
    },speed);
}
function messag(msg,title,okbutton,nobutton,cncbutton,callback,top) {
    var msgboxbc = document.createElement("div");
    msgboxbc.style.backgroundColor = "rgba(0,0,0,0.3)";
    msgboxbc.style.position = "fixed";
    msgboxbc.style.top = "0";
    msgboxbc.style.left = "0";
    msgboxbc.style.width = "100%";
    msgboxbc.style.height = "100%";
	msgboxbc.style.transition = "opacity 0.3s";
	msgboxbc.classList.add("limonjs-msgbox-bc")
    var msgbox = document.createElement("div");
    msgbox.style.borderRadius = "10px";
    msgbox.style.backgroundColor = "Black";
    msgbox.style.color = "gold";
    msgbox.style.position = "absolute";
    msgbox.style.top = "-100";
    msgbox.style.opacity = "0";
    msgbox.style.transition = "top 0.5s, opacity 0.3s";
    msgbox.style.left = "25%";
    msgbox.style.minWidth = "50%";
    msgbox.style.maxWidth = "calc(100% - 20px)";
	if (top) {
		msgbox.style.maxHeight = "calc(100% - " + top + ")"
	}else {
		msgbox.style.maxHeight = "calc(100% - 10)"
	}
    msgbox.style.padding = "10px";
	msgboxbc.style.overflow = "auto";
	msgbox.classList.add("limonjs-msgbox-content")
  if (window.innerWidth < 1238) {
    msgbox.style.left = "0"
    msgbox.style.width = "calc(100% - 20px)"
  }
    var nobuttonn = "inline-block";
    if (!nobutton) {nobuttonn = "none"}
    msgbox.innerHTML = "<h2>" + title + "</h2><p><center>" + msg + "</center></p><button class='cncbuttonlimonjs budgiebutton' style='display:" + nobuttonn + "'>" + cncbutton + "</button><button class='okbuttonlimonjs budgiebutton' autofocus>" + okbutton + "</button>";
    msgbox.getElementsByClassName("okbuttonlimonjs")[0].focus();
    msgbox.getElementsByClassName("okbuttonlimonjs")[0].addEventListener("click",function() {
		try {
        callback(true);
		}catch {console.log("No Callback, Closing normally.")}
        setTimeout(function() {
            document.body.removeChild(msgboxbc)
        },500)
        msgbox.style.opacity = "0";
		msgboxbc.style.opacity = "0"
        msgbox.style.top = "-100";
    })
    msgbox.getElementsByClassName("cncbuttonlimonjs")[0].addEventListener("click",function() {
        try {
		callback(false);
		}catch {console.log("No Callback, Closing normally.")}
        setTimeout(function() {
            document.body.removeChild(msgboxbc)
        },500)
        msgbox.style.opacity = "0";
		msgboxbc.style.opacity = "0"
        msgbox.style.top = "-100";
    })
    msgboxbc.appendChild(msgbox);
    document.body.appendChild(msgboxbc);
    setTimeout(function() {
		if (top) {
			msgbox.style.top = top;
		}else {
			msgbox.style.top = "10px";
		}
        msgbox.style.opacity = "1";
    },10)
    return msgbox;
}
function setattrs(elems,attrname,val,add) {
    asyncfor(0,elems.length - 1,1,elems,function (s,elm) {
        if (add) {
            elm[s].setAttribute(attrname,elm[s].getAttribute(attrname) + val)
        }else {
        elm[s].setAttribute(attrname,val)
        }
    },1);
}
function makecolorful(elem,colors) {
    elem.opacity = "0";
    var charelements = elem.querySelectorAll("c");
    var i;
    var a = 0;
    for (i = 0; i < charelements.length; i++) {
    var colorrandom = "";
      colorrandom = colors[a];
      a++;
      if (a === colors.length - 1) {
       a = 0;
      }
      charelements[i].style.color = colorrandom;
    }
    elem.style.opacity = "";
}
function imageView(url) {
	let w = 0;
	let h = 0;
	let sd = 1;
	
	
	var bg = document.createElement("div");
	bg.style.zIndex = "2";
	bg.style.backgroundColor = "rgba(0,0,0,0.3)";
    bg.style.position = "fixed";
    bg.style.top = "0";
    bg.style.left = "0";
    bg.style.width = "100%";
	bg.style.height = "100%";
	bg.style.transition = "opacity 0.3s";
	bg.style.display = "flex";
	bg.style.alignItems = "center";
	
	bg.classList.add("limonjs-imgview-bc");
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
	var img = document.createElement("img")
	img.src = url;
	img.onload = function() {
		w = img.width;
		h = img.height;
		zoom();
	};
	img.classList.add("limonjs-imageview-img")
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
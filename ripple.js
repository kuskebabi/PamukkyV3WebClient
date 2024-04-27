function addRipple(element,color,isinfixedcont) {
	element.addEventListener("mousedown", rippleStart);
	element.addEventListener("touchstart", rippleStart,{passive: true});
	//var elementlist = [];
	//Array.prototype.forEach.call(element.children, (item) => {
	//	elementlist.push(item);
	//	element.removeChild(item);
	//});
	//var elemcont = document.createElement("div");
	//elemcont.style.display = "inline-block";
	//elemcont.style.position = "relative";
	//elemcont.style.overflow = "hidden";
	//element.style.display = "inline-block";
	element.style.position = "relative";
	element.style.overflow = "hidden";
	//elementlist.forEach((item) => {
	//	elemcont.appendChild(item);
	//});
	//element.appendChild(elemcont);
	function rippleStart(event) {
		const diameter = Math.max(element.clientWidth, element.clientHeight);
		const radius = diameter / 2;
		var ripple = document.createElement("div");
		ripple.style.position = "absolute";
		var ax = 0;
		var ay = 0;
		if (isinfixedcont) {
			ay = element.parentElement.offsetTop;
			ax = element.parentElement.offsetLeft;
		}
		if (event.clientX) {
			ripple.style.top = (event.clientY - (element.offsetTop + ay + radius) + element.parentElement.scrollTop) + "px";
			ripple.style.left = (event.clientX - (element.offsetLeft + ax + radius) + element.parentElement.scrollLeft) + "px";
		}else {
			ripple.style.top = (event.touches[0].clientY - (element.offsetTop + ay + radius) + element.parentElement.scrollTop) + "px";
			ripple.style.left = (event.touches[0].clientX - (element.offsetLeft + ax + radius) + element.parentElement.scrollLeft) + "px";
		}
		ripple.style.transform = "scale(0)";
		ripple.style.width = "1px";
		ripple.style.height = "1px";
		ripple.style.opacity = "0.1";
		ripple.style.transition = "transform 50s,opacity 0.7s";
		requestAnimationFrame(_ => {
			ripple.style.opacity = "1";
			//setTimeout(() => {
			//	ripple.style.transition = "transform 4s,opacity 1s";
			//	ripple.style.transform = "scale(" + radius + ")";
			//}, 300);
			ripple.style.transform = "scale(" + radius + 1 + ")";
		});
		ripple.style.borderRadius = "50%";
		if (color == "") {
			ripple.style.background = "rgba(0,0,0,0.7)";
		}else {
			ripple.style.background = color;
		}
		ripple.style.width = diameter + "px";
		ripple.style.height = diameter + "px";
		ripple.style.pointerEvents = "none";
		element.appendChild(ripple);
		var rp = true;
		element.addEventListener("mouseup",endr);
		element.addEventListener("mouseleave",endr);
		element.addEventListener("touchend",endr);
		element.addEventListener("touchleave",endr);
		function endr() {
			if (rp) {
				setTimeout(function() {
					ripple.style.transition = "transform 4s,opacity 1s";
					requestAnimationFrame(_ => {
						ripple.style.transform = "scale(" + radius + ")";
						ripple.style.opacity = "0";
						setTimeout(function() {
							element.removeChild(ripple);
						},1000)
					})
				},200)
				rp = false;
			}
		}
	}
}
Array.prototype.forEach.call(document.querySelectorAll("[ripple]"),function(item) {
	addRipple(item, item.getAttribute("ripple"))
})
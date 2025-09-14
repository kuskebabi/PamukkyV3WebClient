function addRipple(element, color = "var(--ripple-color)") {
	element.addEventListener("pointerdown", rippleStart);
	element.style.position = "relative";
	element.style.overflow = "hidden";
	function rippleStart(event) {
		if (element.disabled) return;
		const diameter = Math.max(element.clientWidth, element.clientHeight);
		const radius = diameter / 2;
		var ripple = document.createElement("div");
		ripple.style.position = "absolute";
		let boundingclient = element.getBoundingClientRect();
		if (event.clientX) {
			ripple.style.top = (event.clientY - (boundingclient.top + radius)) + "px";
			ripple.style.left = (event.clientX - (boundingclient.left + radius)) + "px";
		}
		ripple.style.transform = "scale(0)";
		ripple.style.width = "1px";
		ripple.style.height = "1px";
		ripple.style.opacity = "0.1";
		ripple.style.pointerEvents = "none";
		ripple.style.transition = "transform " + (diameter / 8) + "s,opacity 0.7s";
		requestAnimationFrame(_ => {
			ripple.style.opacity = "0.6";
			ripple.style.transform = "scale(" + radius + ")";
		});
		ripple.style.borderRadius = "50%";
		ripple.style.background = color;
		ripple.style.width = diameter + "px";
		ripple.style.height = diameter + "px";
		ripple.style.pointerEvents = "none";
		element.appendChild(ripple);
		var rp = true;
		element.addEventListener("pointerup",endr);
		element.addEventListener("pointerleave",endr);
		function endr() {
			if (rp) {
				setTimeout(function() {
					ripple.style.opacity = "0";
					setTimeout(function() {
						element.removeChild(ripple);
					},1000)
				}, 200)
				rp = false;
				element.removeEventListener("pointerup",endr);
				element.removeEventListener("pointerleave",endr);
			}
		}
	}
}
Array.prototype.forEach.call(document.querySelectorAll("[ripple]"),function(item) {
	addRipple(item, item.getAttribute("ripple"))
})

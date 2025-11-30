function addRipple(element, color = "var(--ripple-color)", clickelement) {
	
	element.classList.add("ripple-element");
	if (clickelement) {
		clickelement.classList.add("ripple-element");
	}else {
		clickelement = element;
	}

	clickelement.addEventListener("pointerdown", rippleStart);

	element.style.position = "relative";
	element.style.overflow = "hidden";
	function rippleStart(event) {
		if (element.disabled) return;
		const diameter = Math.max(element.clientWidth, element.clientHeight);
		const radius = diameter / 2;
		var ripple = document.createElement("div");

		let boundingclient = element.getBoundingClientRect();
		
		ripple.style.position = "absolute";
		ripple.style.top = ripple.style.left = "0";
		ripple.style.transform = "scale(0) translateX(" + ((event.clientX - radius) - (boundingclient.left)) + "px) translateY(" + ((event.clientY - radius) - (boundingclient.top)) + "px)";
		ripple.style.opacity = "0.1";
		ripple.style.transition = "transform 0.5s,opacity 0.7s";
		ripple.style.borderRadius = "50%";
		ripple.style.background = color;
		ripple.style.width = diameter + "px";
		ripple.style.height = diameter + "px";
		ripple.style.pointerEvents = "none";
		
		element.appendChild(ripple);

		requestAnimationFrame(_ => {
			const offsetY = (diameter - Math.min(element.clientWidth, element.clientHeight)) / 2;
			ripple.style.opacity = "0.6";
			ripple.style.transform = "scale(1.1) translateY(-" + offsetY + "px)";
		});

		var rp = true;
		clickelement.addEventListener("pointerup",endr);
		clickelement.addEventListener("pointerleave",endr);
		function endr() {
			if (rp) {
				setTimeout(function() {
					ripple.style.opacity = "0";
					setTimeout(function() {
						element.removeChild(ripple);
					},1000)
				}, 200)
				rp = false;
				clickelement.removeEventListener("pointerup",endr);
				clickelement.removeEventListener("pointerleave",endr);
			}
		}
	}
}
/*Array.prototype.forEach.call(document.querySelectorAll("[ripple]"),function(item) {
	addRipple(item, item.getAttribute("ripple"))
})*/

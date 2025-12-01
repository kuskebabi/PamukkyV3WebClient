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
		const boundingclient = element.getBoundingClientRect();

		var ripple = document.createElement("div");

		const locationX = event.clientX - boundingclient.left;
		const locationY = event.clientY - boundingclient.top;

		const offsetY = -((diameter - element.clientHeight) / 2);
		const offsetX = -((diameter - element.clientWidth) / 2);
		
		const translateX = offsetX + (locationX - (element.clientWidth / 2));
		const translateY = offsetY + (locationY - (element.clientHeight / 2));

		ripple.style.position = "absolute";
		ripple.style.zIndex = "1";
		ripple.style.top = ripple.style.left = "0";
		ripple.style.transform = "translateX(" + translateX + "px) translateY(" + translateY + "px) scale(0)";
		ripple.style.opacity = "0.1";
		ripple.style.transition = "transform 0.4s,opacity 0.6s";
		ripple.style.borderRadius = "50%";
		ripple.style.background = color;
		ripple.style.width = diameter + "px";
		ripple.style.height = diameter + "px";
		ripple.style.pointerEvents = "none";
		
		element.appendChild(ripple);

		requestAnimationFrame(_ => {
			ripple.style.opacity = "1";
			ripple.style.transform = "translateY(" + offsetY + "px) translateX(" + offsetX + "px) scale(1.1)";
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

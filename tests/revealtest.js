

(function() {
	const outer = document.querySelector(".reveal-content");
	const inner = document.querySelector(".red-square");


	const easing = 0.007;
	const outScale = 0.01;
	const inScale = 1.5;
	let currOpacity = 0;
	let targetOpacity = 0;
	let targetScale = outScale;
	let elementScale = targetScale;
	let innerScale = 1 / elementScale;

	document.addEventListener("click", () => {
		targetScale = inScale;
		targetOpacity = 1;
	});
	
	//outer.addEventListener("pointerout", () => {
		//targetScale = outScale;
	//});

	const update = () => {

		//elementScale += windowW * easing;
		elementScale += (targetScale - elementScale) * easing;
		innerScale = (1 / elementScale);

		if(targetScale - elementScale < 0.1) {
			elementScale = targetScale;
			innerScale = (1 / elementScale);

			currOpacity = targetOpacity;
		}

		if(currOpacity < targetOpacity) {currOpacity += 0.0025};

		outer.style.opacity = currOpacity;
		outer.style.transform = `scale(${elementScale})`;
		inner.style.transform = `scale(${innerScale})`;

		requestAnimationFrame(update);
	};

	requestAnimationFrame(update);
})();

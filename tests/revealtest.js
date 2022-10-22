

(function() {
	const outer = document.querySelector(".reveal-content");
	const inner = document.querySelector(".red-square");


	const easing = 0.01;
	const outScale = 0.01;
	const inScale = 1.5;
	let targetScale = outScale;
	let elementScale = targetScale;
	let innerScale = 1 / elementScale;

	outer.addEventListener("pointerover", () => {
		targetScale = inScale;
	});
	
	//outer.addEventListener("pointerout", () => {
		//targetScale = outScale;
	//});

	const update = () => {

		elementScale += (targetScale - elementScale) * easing;
		innerScale = 1 / elementScale;

		outer.style.transform = `scale(${elementScale})`;
		inner.style.transform = `scale(${innerScale})`;

		requestAnimationFrame(update);
	};

	requestAnimationFrame(update);
})();

const outer = document.querySelector(".reveal-content");
const inner = document.querySelector(".red-square");
const initLogo = document.querySelector(".center-logo");
var newFrame = 1;

const easing = 0.006;
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



function update() {

	elementScale += (targetScale - elementScale) * easing;
	innerScale = 1 / elementScale;

	if(targetScale - elementScale < 0.1) {
		elementScale = targetScale;
		innerScale = 1 / elementScale;

		currOpacity = targetOpacity;
	}

	if(currOpacity < targetOpacity) {currOpacity += 0.0025};

	outer.style.opacity = currOpacity;
	initLogo.style.opacity = 1 - currOpacity;
	outer.style.transform = `scale(${elementScale})`;
	inner.style.transform = `scale(${innerScale})`;

	if(currOpacity < 1 && newFrame) {requestAnimationFrame(update)};
};

requestAnimationFrame(update);


const app = new PIXI.Application({width: window.innerWidth, height: window.innerHeight});

document.body.appendChild(app.view);

const bg = PIXI.Sprite.from('images/testbg.jpg');
bg.width = app.screen.width;
bg.height = app.screen.height;
bg.zIndex = 2;
bg.interactive = true;
document.addEventListener('click', startAnim);

document.addEventListener('resize', changeSpriteSize);

function changeSpriteSize() {
	app.width = window.innerWidth;
	app.height = window.innerHeight;
	bg.width = window.innerWidth;
	bg.height = window.innerHeight;
}

app.stage.addChild(bg);

const options1 = {
	amplitude: 100, //300
	wavelength: 40, //160
	speed: 550, //500
	radius: Math.max(window.innerWidth, window.innerHeight),
};

const options2 = {
	amplitude: 75,
	wavelength: 35,
	speed: 500,
	radius: Math.max(window.innerWidth * 0.8, window.innerHeight * 0.8),
};

const options3 = {
	amplitude: 50,
	wavelength: 25,
	speed: 460,
	radius: Math.max(window.innerWidth * 0.6, window.innerHeight * 0.6),
}



const rippleFilter = new PIXI.filters.ShockwaveFilter([app.screen.width / 2, app.screen.height / 2], options1, -0.1);

const rippleFilter2 = new PIXI.filters.ShockwaveFilter([app.screen.width / 2, app.screen.height / 2], options2, -.75);

const rippleFilter3 = new PIXI.filters.ShockwaveFilter([app.screen.width / 2, app.screen.height / 2], options3, -1.5)

bg.filters = [rippleFilter, rippleFilter2, rippleFilter3];





async function startAnim() {
	app.ticker.add(() => {
		rippleFilter.time += 0.01;
		rippleFilter2.time += 0.01;
		rippleFilter3.time += 0.01;
	});
	const revealImage = document.querySelector(".reveal-content");
	initLogo.style.zIndex = 4;
	revealImage.style.zIndex = 3;
	setTimeout(function() {removeCoverImage()}, 4200);
}

function removeCoverImage() {
	newFrame = 0;
	app.ticker.destroy();
	document.querySelector("canvas").remove();

	let bodyContent = document.querySelector('body');
	outer.zIndex = "-1";

	let leftContent = document.createElement('div');
	bodyContent.insertBefore(leftContent, bodyContent.firstChild);
	leftContent.outerHTML = `
	<div class="leftside">
		<div class="texttitle">
			<a href="https://jgreene.dev">
				<img src="images/logoblack.png">
			</a>
		</div>
		<div class="inlinks">
			<a href="./home.html" class="sitelinks">Home</a>
			<a href="./projects.html" class="sitelinks">Projects</a>
			<a href="./contact.html" class="sitelinks">Contact</a>
			<a href="./bloghome.html" class="sitelinks">Blog</a>
		</div>
		<div class="myinfo">
			<img class="headpic" src="images/headphoto.png">
			<div class="myinfotext">
				<p>Joseph Greene</p>
				<p>Web Dev & UX</p>
			</div>
		</div>
		<div class="outlinks">
			<button class="linkedin-button outlink-button" onclick="location.href='https://www.linkedin.com/in/joseph-greene-253712215/'" type="button"></button>
			<button class="twitter-button outlink-button" onclick="location.href='https://twitter.com/JosephG29455714'" type="button"></button>
			<button class="github-button outlink-button" onclick="location.href='https://github.com/JoMGreene?tab=repositories'" type="button"></button>
		</div>
	</div>`;
}


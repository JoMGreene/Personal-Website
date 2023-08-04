//arrays of colors for the opaque graph lines and translucent backgrounds.
const colorarray = ["#E71818", "#1857E7", "#e678f5", "#18E7BB", "#E0E718", "#8918E7", "#E718A5"];
const colorBgArray = ["rgba(231, 24, 24, 0.3)","rgba(24, 87, 231, 0.3)","rgba(230, 39, 245, 0.3)","rgba(24, 231, 187, 0.3)","rgba(224, 231, 24, 0.3)","rgba(137, 24, 231, 0.3)","rgba(231, 24, 165, 0.3)"];

//tracking the number of graphs present during the last graph creation. needed to splice old graphs out if the number of graphs is lower during the next createGraph call.
let previousgraphs = 1;
//tracks the current number of graphs so we know how many times to create a chart
let numgraphs = 1;

let graphtype = document.getElementById("graph-type").value;

//initial creation of the graph axes and settings
let ctx = document.getElementById('myChart').getContext('2d');
let myChart = new Chart(ctx, {
    type: 'line',
    data: {
		datasets: [
			{
				data: [],
				label: 'Graph 1',
				fill: 'start',
				backgroundColor: 'rgba(170, 23, 23, 0.3)',
				borderColor: 'red',
				cubicInterpolationMode: 'default',
				tension: 0.4
			}
		],
	},
	options: {
		plugins: {
			tooltip: {
				mode: 'x',
				intersect: 'false'
				},
			hover: {
				mode: 'x',
				intersect: 'false'
			}

		},
		scales: {
			x: {
				type: 'linear',
				min: 0,
				max: 30,
				ticks: {
					stepSize: 5
				}
			},
			y: {
				type: 'linear',
				min: 0
			}
		}
	}
});
Chart.defaults.font.size = 14;

//function to create the graph for the successes-based dice roll option. Takes the number of dice, sides on a die, optional target number to beat, the threshold value for a single die to count as a success, and threshold for a die to count as two successes(not yet implemented)
function successesProbabilityDistribution(dice, sides, targetnums, successTH, doublesTH) {
	let templateDist = [];
	let targetprob = 0;
	let meanTracker = 0;

	//catches input conditions that would cause the graph calculation to fail, returning 0s 
	if (dice == 0 || sides == 0 || isNaN(successTH)) {
		return[[0], 0, 0, 0];
	}
	//if the successes threshold is set higher than the number of sides, make it equal to the number of sides. having an impossible success threshold doesn't make much sense, so we set it to the max value on the die
	if (successTH > sides) {
		successTH = sides;
	}
	//set up the initial array that we're going to use to emulate each die rolled. if doubles are enabled, there are 3 outcomes per die: failure, success, or double success. if doubles are disabled, the only outcomes on a die are success or failure.
	if (doublesTH != 0) {
		templateDist = [(successTH - 1) / sides, (doublesTH - successTH) / sides, (sides - doublesTH) / sides];
	}else {
		templateDist = [(successTH - 1) / sides, (sides - successTH + 1) / sides];
	}

	let probDist = templateDist.slice(0);

	//this generates the final probability distribution. we start with a copy of the template distribution, which has the probabilities of each outcome for one die. We then take the dot product of the current array with the tempalate array a number of times equal to the number of dice that are being rolled, to find the probabilities of each number of successes.
	for (let d = 1; d < dice; d++) {
		const probDistTemp = [];
		probDistTemp.length = (templateDist.length + probDist.length) - 1;
		probDistTemp.fill(0);
		for (let i = 0; i < templateDist.length; i++) {
			for (let k = 0; k < probDist.length; k++) {
				let currentvalue = templateDist[i] * probDist[k];
				probDistTemp[i + k] += currentvalue;
			}
		}
		probDist = probDistTemp.slice(0);
	}

	//turning our raw data output into a format that is more useable for formatting in d3.js, also making use of the fact that we iterate though each item in the original array to calculate the mean result.
	let formatprobDist = [];
	for (let z = 0; z < probDist.length; z++) {
		formatprobDist.push({x: z, y: probDist[z]});
		meanTracker += (z * probDist[z]);
		if (z > targetnums - 1) {
			targetprob += probDist[z];
		}
	}

	//have to go back through to calculate the standard deviation, because we didn't know the mean until now.
	let workingStdDev = 0;
	for (let y = 0; y < formatprobDist.length; y++) {
		workingStdDev += formatprobDist[y].y * ((formatprobDist[y].x - meanTracker)**2);
	}
	//if rounding issues cause the total probability of getting a result to be greater than one, we set it to approimately 1 because we know the real probability is extremely close to 1
	if (targetprob > 1) {
		targetprob = "≈1";
	}
	return [formatprobDist, targetprob, meanTracker, workingStdDev];

}

//mostly the same as the previous function, but this time for a dice total roll 
function probabilityDistributionFormatted(dice,sides,target) {
	const probDist = [];	
	let targetprob = 0;
	let meanTracker = 0;
	//our initial array this time is an array of 1's, because each result on a single die has the same probability, and it's better to use integers now and convert the final array to decimals so we don't have a bunch of rounding errors while calculating.
	let baseArray = Array(sides).fill(1);
	//we use combinatorics to generate the arrays for each additional die
	for (let i = 0; i < dice-1; i++) {
		let resArray = [];
		let j = 0;
		while (j < sides - 1) {
			resArray[j] = 0;
			for (let k = 0; k < j+1; k++) {
				resArray[j] += baseArray[k];
			}
			j++;
		}
		while (j > sides - 2 && j < baseArray.length) {
			resArray[j] = 0;
			for (let k = 0; k < sides; k++) {
				resArray[j] += baseArray[j-k];
			}
			j++
		}
		while (j > baseArray.length - 1 && j < baseArray.length + sides - 1) {
			resArray[j] = 0;
			for (let k = baseArray.length + sides - j - 1; k > 0; k--) {
				resArray[j] += baseArray[baseArray.length -k];
			}
			j++
		}
		baseArray.length = resArray.length;
		baseArray = resArray.slice(0);
	}

	//formatting and caluclate mean again
	let formattedArray = [];
	for (let z = 0; z < baseArray.length; z++) {
		let pointProb = baseArray[z] / sides**dice;
		formattedArray.push({x: dice+z, y: pointProb});
		meanTracker += (dice+z) * pointProb;
		if (dice+z > target - 1) {
			targetprob += baseArray[z];
		}		
	}
	//calcuate standard deviation. 
	let workingStdDev = 0;
	for (let y = 0; y < formattedArray.length; y++) {
		workingStdDev += formattedArray[y].y * ((formattedArray[y].x - meanTracker)**2);
	}
	workingStdDev = Math.sqrt(workingStdDev);

	//dont have to worry about rounding this time, as we're still dealing with integers until this division, so the numerator cannot be larger than the denominator due to rounding.
	targetprob /= sides**dice;
	return [formattedArray, targetprob, meanTracker, workingStdDev];
	
}

//function to determine whether a specified x-axis value is less than the target number for that graph, used for coloring line segments on the graph
const succeed = (ctx, value, target) => ctx.p0.parsed.x > (target - 1) ? value : undefined;

//main function, calls other functions to create arrays of data, then adds them to the graph as datasets.
function creategraph(dice, sides, targetnums) {
	let highestX = 0;
	let targetResult = 0;
	let meanRes = 0;
	let stdDevRes = 0;
	let probDistResult = [];
	for (k = 0; k < dice.length; k++) {
		[probDistResult, targetResult, meanRes, stdDevRes]  = probabilityDistributionFormatted(dice[k], sides[k], targetnums[k]);
		const targetnumcurrent = targetnums[k];
		const loopval = k;
		if (k < myChart.data.datasets.length) {
			if (probDistResult.length == 0) {
				probDistResult = [0];
			}
			myChart.data.datasets[k].data = probDistResult;	
			myChart.data.datasets[k].segment = {
				borderColor: ctx => succeed(ctx, "rgb(74, 231, 24)", targetnumcurrent),
				backgroundColor: ctx => succeed(ctx, "rgba(74, 231, 24, 0.3)", targetnumcurrent),
			};
			myChart.data.datasets[k].pointBackgroundColor = function(context) {
				var index = context.dataIndex;
				var value = context.dataset.data[index].x;
				return value < targetnumcurrent ? colorBgArray[loopval % 7] : "rgb(74, 231, 24)";
			};
			myChart.data.datasets[k].pointBorderColor = function(context) {
				var index = context.dataIndex;
				var value = context.dataset.data[index].x;
				return value < targetnumcurrent ? colorBgArray[loopval % 7] : "rgb(74, 231, 24)";
			};
		} else {	
			myChart.data.datasets.push({
				data: probDistResult,
				fill: 'start',
				label: 'Graph ' + (k + 1),
				pointBackgroundColor: function(context) {
					var index = context.dataIndex;
					var value = context.dataset.data[index].x;
					return value < targetnumcurrent ? colorBgArray[loopval % 7] : "rgb(74, 231, 24)";
				},
				pointBorderColor: function(context) {
					var index = context.dataIndex;
					var value = context.dataset.data[index].x;
					return value < targetnumcurrent ? colorBgArray[loopval % 7] : "rgb(74, 231, 24)";
				},
				backgroundColor: colorBgArray[k % 7],
				borderColor: colorarray[k % 7],
				cubicInterpolationMode: 'default',
				tension: 0.4,
				segment: {
					borderColor: ctx => succeed(ctx, "rgb(74, 231, 24)", targetnumcurrent),
					backgroundColor: ctx => succeed(ctx, "rgba(74, 231, 24, 0.3)", targetnumcurrent),
				}
			})
		}
		if (probDistResult.length > 1) {
			document.getElementById('data-analyze-' + (k+1)).style.display = "block";
			if (targetnumcurrent == Infinity) {
				document.getElementById('data-analyze-' + (k+1)).innerHTML = "Graph " + (k+1) + " has a mean of " + parseFloat(meanRes.toFixed(4)) + " and a standard deviation of " + stdDevRes.toFixed(4) + ".";
			} else {
			document.getElementById('data-analyze-' + (k+1)).innerHTML = "Graph " + (k+1) + " has a mean of " + parseFloat(meanRes.toFixed(4)) + " and a standard deviation of " + stdDevRes.toFixed(4) + ".<br> The probability of getting a total value of at least " + targetnums[k] + " is " + parseFloat(targetResult.toFixed(4));
			}
		} else {
			document.getElementById('data-analyze-' + (k+1)).style.display = "none";
		}

		if (dice[k] * sides[k] > highestX) {
			highestX = dice[k] * sides[k];
		}
	}
	myChart.options.scales.x.min = Math.min(...dice);
	myChart.options.scales.x.max = highestX;
	myChart.options.scales.x.ticks.stepSize = Math.floor((highestX - myChart.options.scales.x.min) / 10);

	if (previousgraphs > numgraphs) {
		myChart.data.datasets.splice(dice.length, previousgraphs - dice.length);	
	}
	myChart.update();
	previousgraphs = dice.length;
}


function creategraphsuccesses(dice, sides, successTHs, targetnums) {
	let targetResult = 0
	let probDistResult = [];
	let meanRes = 0;
	let stdDevRes = 0;
	for (k = 0; k < dice.length; k++) {

		[probDistResult, targetResult, meanRes, stdDevRes]  = successesProbabilityDistribution(dice[k], sides[k], targetnums[k], successTHs[k], 0);
		const targetnumcurrent = targetnums[k];
		const loopval = k;
		if (k < myChart.data.datasets.length) {
			myChart.data.datasets[k].data = probDistResult;
			myChart.data.datasets[k].segment = {
				borderColor: ctx => succeed(ctx, "rgb(74, 231, 24)", targetnumcurrent),
				backgroundColor: ctx => succeed(ctx, "rgba(74, 231, 24, 0.5)", targetnumcurrent),
			};
			myChart.data.datasets[k].pointBackgroundColor = function(context) {
				var index = context.dataIndex;
				var value = context.dataset.data[index].x;
				return value < targetnumcurrent ? colorBgArray[loopval % 7] : "rgb(74, 231, 24)";
			};
			myChart.data.datasets[k].pointBorderColor = function(context) {
				var index = context.dataIndex;
				var value = context.dataset.data[index].x;
				return value < targetnumcurrent ? colorBgArray[loopval % 7] : "rgb(74, 231, 24)";
			};
			
		} else {	
			myChart.data.datasets.push({
				data: probDistResult,
				fill: 'start',
				label: 'Graph ' + (k + 1),
				backgroundColor: colorBgArray[k % 7],
				borderColor: colorarray[k % 7],
				cubicInterpolationMode: 'default',
				tension: 0.4,
				pointBackgroundColor: function(context) {
					var index = context.dataIndex;
					var value = context.dataset.data[index].x;
					return value < targetnumcurrent ? colorBgArray[loopval % 7] : "rgb(74, 231, 24)";
				},
				pointBorderColor: function(context) {
					var index = context.dataIndex;
					var value = context.dataset.data[index].x;
					return value < targetnumcurrent ? colorBgArray[loopval % 7] : "rgb(74, 231, 24)";
				},
				segment: {
					borderColor: ctx => succeed(ctx, "rgb(74, 231, 24)", targetnumcurrent),
					backgroundColor: ctx => succeed(ctx, "rgba(74, 231, 24, 0.5)", targetnumcurrent),
				}
			})
		}
		if (probDistResult.length > 1) {
			document.getElementById('data-analyze-' + (k+1)).style.display = "block";
			if (targetnumcurrent == Infinity) {
				document.getElementById('data-analyze-' + (k+1)).innerHTML = "Graph " + (k+1) + " has a mean of " + parseFloat(meanRes.toFixed(4)) + " and a standard deviation of " + stdDevRes.toFixed(4) + ".";
			} else {
			document.getElementById('data-analyze-' + (k+1)).innerHTML = "Graph " + (k+1) + " has a mean of " + parseFloat(meanRes.toFixed(4)) + " and a standard deviation of " + stdDevRes.toFixed(4) + ".<br> The probability of getting at least " + targetnums[k] + " successes is " + parseFloat(targetResult.toFixed(4));
			}
		} else {
			document.getElementById('data-analyze-' + (k+1)).style.display = "none";
		}
	}
	myChart.options.scales.x.min = 0;
	myChart.options.scales.x.max = Math.max(...dice) + 1;
	myChart.options.scales.x.ticks.stepSize = 1;

	if (previousgraphs > numgraphs) {
		myChart.data.datasets.splice(dice.length, previousgraphs - dice.length);	
	}

	myChart.update();
	previousgraphs = dice.length;
}


//obtains dice and sides from all inputs and calls creategraph function
document.getElementById("graph-data").onclick = function(){
	let diceNumArray = [];
	let sidesArray = [];
	let successTHArray = [];
	let targetnumArray = [];

	if (numgraphs > 0) {
		document.getElementById("data-analyze").style.display = 'block';
	}

	

	let graphInputs = document.getElementById('data-inputs').children;
	for(let j = 1; j < numgraphs + 1; j++) {
		if (graphInputs[j-1].children[0].children[1].value == '' || graphInputs[j-1].children[1].children[1].value == '' ) {
			diceNumArray[j-1] = 0;
			sidesArray[j-1] = 0;
			successTHArray[j-1] = 0;
			targetnumArray[j-1] = 0;
		} else {
			diceNumArray[j-1] = parseInt(graphInputs[j-1].children[0].children[1].value);
			sidesArray[j-1] = parseInt(graphInputs[j-1].children[1].children[1].value);
			targetnumArray[j-1] = parseInt(graphInputs[j-1].children[3].children[1].value);
			successTHArray[j-1] = parseInt(graphInputs[j-1].children[2].children[1].value);
		}
		if (graphInputs[j-1].children[3].children[1].value == '') {
			targetnumArray[j-1] = Infinity;
		}
	}
	
	if (graphtype == "total") {
		creategraph(diceNumArray, sidesArray, targetnumArray);
	}
	else if (graphtype == "successes") {
		creategraphsuccesses(diceNumArray, sidesArray, successTHArray, targetnumArray);
	}
}


//when type of graph gets changed, we make sure to show or hide the relevant inputs, and change the graphtype variable so the graph function knows what type of graphs to generate
document.getElementById("graph-type").addEventListener('change', (event) => {
	if (event.target.value == 'successes' ) {
		for (let i = 0; i < numgraphs ; i++) {
			document.getElementById('data-inputs').children[i].children[2].style.display = "flex";
		}
		graphtype = "successes";
	}
	else if (event.target.value == 'total') {
		for (let i = 0; i < numgraphs; i++) {
			document.getElementById('data-inputs').children[i].children[2].style.display = "none";
		}
		graphtype = "total";
	}
});


//function to create a set of graph inputs. creates and appends the child node, and adds the drag and drop event linsteners to it
document.getElementById("add-graph").onclick = function(){
	numgraphs += 1;
	let newgraph = document.createElement('div');

	newgraph.id = "dataset-" + numgraphs;
	newgraph.classList.add("datarow");
	newgraph.setAttribute('data-index', numgraphs)
	newgraph.innerHTML = `
		<div class="namedatapair">
			<label for="num-dice-${numgraphs}" class="numtext">Number of dice:</label>
			<input type="number" class="number" id="num-dice-${numgraphs}" name="num-dice-${numgraphs}">
		</div>
		<div class="namedatapair">
			<label for="sides-dice-${numgraphs}" class="numtext">How many sides:</label>
			<input type="number" class="number" id="sides-dice-${numgraphs}" name="sides-dice-${numgraphs}">
		</div>
		<div class="namedatapair toggle-data" id="success-section-${numgraphs}" style="${graphtype == 'successes' ? "display: flex" : "display: none"}">
			<label for="success-dice-${numgraphs}" class="numtext">Success Threshold:</label>
			<input type="number" class="number" id="success-dice-${numgraphs}" name="success-dice-${numgraphs}">
		</div>
		<div class="namedatapair">
			<label for="target-dice-${numgraphs}" class="numtext">Target Number:</label>
			<input type="number" class="number" id="target-dice-${numgraphs}" name="target-dice-${numgraphs}">
		</div>
		<div class="drag-handle namedatapair" id="drag-dle-${numgraphs}" draggable="true"><span></span></div>
	`


	let newAnalytics = document.createElement('p');

	newAnalytics.classList.add('analysis-toggle');
	newAnalytics.id = "data-analyze-" + numgraphs; 

	let anaDiv = document.getElementById("data-analyze");
	anaDiv.appendChild(newAnalytics);
	let datadiv = document.getElementById("data-inputs");
	datadiv.appendChild(newgraph);

	let drag = document.getElementById('drag-dle-' + numgraphs);
	addDragListeners(drag);
	drag.addEventListener('dragstart', dragStart);
	drag.addEventListener('dragover', dragOver);
	drag.addEventListener('drop', dragDrop);
	drag.addEventListener('dragEnter', dragEnter);
	drag.addEventListener('dragleave', dragLeave);

}

function addDragListeners(dragEl) {
	dragEl.addEventListener('dragstart', dragStart);
	dragEl.addEventListener('dragover', dragOver);
	dragEl.addEventListener('drop', dragDrop);
	dragEl.addEventListener('dragEnter', dragEnter);
	dragEl.addEventListener('dragleave', dragLeave);

}

const firstDrag = document.getElementById('drag-dle-1');
addDragListeners(firstDrag);

let dragStartNode, dragStartCopy, dragStartNum, dragStartData;

function dragStart(ev) {
	dragStartNode = this.parentNode;
	for (let i = 0; i < 4; i++) {
		dragStartNode.children[i].children[1].setAttribute("value", dragStartNode.children[i].children[1].value);
	}
	dragStartCopy = this.parentNode.outerHTML;
	dragStartNum = this.parentNode.getAttribute('data-index');	
	ev.dataTransfer.setData("text/html", this.parentNode.outerHTML);
	ev.dataTransfer.setDragImage(this.parentNode, this.parentNode.clientWidth * .95, this.parentNode.clientHeight/2);
}

function dragOver(ev) {
	ev.preventDefault();
}

function dragDrop() {
	let dragEndNum = this.parentNode.getAttribute('data-index');
	if(dragEndNum == dragStartNum) {
		return;
	}
	let dragEndNode = this.parentNode;
	for (let i = 0; i < 4; i++) {
		dragEndNode.children[i].children[1].setAttribute("value", dragEndNode.children[i].children[1].value);
	}
	let dragEndCopy = this.parentNode.outerHTML;
	

	dragStartNode.outerHTML = dragEndCopy;
	dragEndNode.outerHTML = dragStartCopy;

	addDragListeners(document.getElementById('drag-dle-' + dragStartNum));
	addDragListeners(document.getElementById('drag-dle-' + dragEndNum));

}

function dragEnter() {

}

function dragLeave() {

}

function swapNodes(nodeOne, nodeTwo) {
	
}

document.getElementById("remove-graph").onclick = function() {
	let lastGraph = document.getElementById("data-inputs").children;
	lastGraph[lastGraph.length - 1].remove();
	document.getElementById("data-analyze-" + numgraphs).remove()
	numgraphs -= 1;
}
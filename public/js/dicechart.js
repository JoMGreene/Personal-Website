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

//simple factorial calculator function
function factorial(num) {
	if (num == 0 || num == 1) {
		return 1;
	}
	if (num < 0) {
		return 0;
	}
	let result = num;

	while(num > 1) {
		num--;
		result *= num;
	}
	return result;
}

//function to return the probability of a number 'total' being  the result on a dice roll of (dice)d(sides), assuming the distribution is normal.
function stdprob(dice, sides, total) {
	let mean = dice * (sides + 1) / 2;
	let standdev = Math.sqrt(dice * ((sides**2) - 1) / 12);
	let res = (1/(standdev * Math.sqrt(2 * Math.PI))) * (Math.E**((-1/2)*(((total - mean) / standdev)**2)));
	return res;
}

//function to calculate the exact probability that 'total' is the result on a dice roll of (dice)d(sides). Will not work with high 'total' due to the factorials becoming too large.
function pointProbability(dice,sides,total) {
	let res = 0
	for (let k = 0; k < parseInt(((total-dice)/sides) + 1); k++) {
		let first_term = factorial(dice) / (factorial(k)*factorial(dice-k));
		let second_term = 	factorial(total - sides*k - 1) / (factorial(total - sides*k - dice) * factorial(dice - 1));
		let misc_term = ((-1)**k) * ((1 / sides)**dice);
		res += (first_term * second_term * misc_term);
	}
	return res;
}

function probabilityDistribution(dice,sides) {
	const probDist = [];

	let numsteps = Math.sqrt(dice*sides);
	//checklist: if dice > 20 do stdprob for whole thing, if total - sides*k - dice > 100 do stdprob for that value, if dice * sides > 100 do fewer step evaluations
	if (dice*sides > 150) {
		for (let i = 0; i < numsteps; i++) {
			probDist[i] = stdprob(dice,sides,Math.floor(i*numsteps));
		}
		probDist[numsteps] = stdprob(dice,sides,dice*sides);
		return probDist;
	}
	for (let i = dice; i < dice*sides + 1; i++) {
		probDist[i] = pointProbability(dice,sides,i);
		if (probDist[i] == undefined) {
			probDist[i] = null;
		}
	}

	return probDist;
}

function successesProbabilityDistribution(dice, sides, targetnums, successTH, doublesTH) {
	let templateDist = [];
	let targetprob = 0;
	let meanTracker = 0;
	if (dice == 0 || sides == 0 || isNaN(successTH)) {
		return[[0], 0, 0, 0];
	}
	if (successTH > sides) {
		successTH = sides;
	}
	if (doublesTH != 0) {
		templateDist = [(successTH - 1) / sides, (doublesTH - successTH) / sides, (sides - doublesTH) / sides];
	}else {
		templateDist = [(successTH - 1) / sides, (sides - successTH + 1) / sides];
	}

	let probDist = templateDist.slice(0);

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

	let formatprobDist = [];
	for (let z = 0; z < probDist.length; z++) {
		formatprobDist.push({x: z, y: probDist[z]});
		meanTracker += (z * probDist[z]);
		if (z > targetnums - 1) {
			targetprob += probDist[z];
		}
	}
	let workingStdDev = 0;
	for (let y = 0; y < formatprobDist.length; y++) {
		workingStdDev += formatprobDist[y].y * ((formatprobDist[y].x - meanTracker)**2);
	}

	if (targetprob > 1) {
		targetprob = "≈1";
	}
	return [formatprobDist, targetprob, meanTracker, workingStdDev];

}


function probabilityDistributionFormatted(dice,sides,target) {
	const probDist = [];	
	let targetprob = 0;
	let meanTracker = 0;
	let baseArray = Array(sides).fill(1);
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
	let formattedArray = [];
	for (let z = 0; z < baseArray.length; z++) {
		let pointProb = baseArray[z] / sides**dice;
		formattedArray.push({x: dice+z, y: pointProb});
		meanTracker += (dice+z) * pointProb;
		if (dice+z > target - 1) {
			targetprob += baseArray[z];
		}		
	}
	let workingStdDev = 0;
	for (let y = 0; y < formattedArray.length; y++) {
		workingStdDev += formattedArray[y].y * ((formattedArray[y].x - meanTracker)**2);
	}
	workingStdDev = Math.sqrt(workingStdDev);
	targetprob /= sides**dice;
	return [formattedArray, targetprob, meanTracker, workingStdDev];
	
}

/*function probabilityDistributionFormattedTarget(dice,sides,targetnums) {	
	const probDist = [];
	let targetprob = 0;
	//check if standard probability needs to be used in place of the more accurate equation, and build the dataset accordingly
	if (dice*sides > 150 || dice > 20) {
		for (let i = dice; i < dice*sides + 1; i++) {
			if (i - 1 > 170) {
				let pointnum = stdprob(dice, sides, i)
				probDist.push({x: i, y: pointnum}); 
				if (i > targetnums - 1) {
					targetprob += pointnum;
				}
			}
			else {
				let pointnum = pointProbability(dice, sides, i)
				probDist.push({x: i, y: pointnum});
				if (i > targetnums - 1) {
					targetprob += pointnum;
				}
			}

		}
		return [probDist, targetprob];
	}

	for (let k = dice; k < dice*sides + 1; k++) {
		let pointnum = pointProbability(dice,sides,k);
		probDist.push({x: k, y: pointnum})
		if (k > targetnums - 1) {
			targetprob += pointnum;
		}
	}
	if (targetprob > 1) {
		targetprob = "≈1";
	}
	return [probDist, targetprob];
}*/

const succeed = (ctx, value, target) => ctx.p0.parsed.x > (target - 1) ? value : undefined;

//main function, calls other functions to create arrays of data, then adds them to the graph as datasets.
function creategraph(dice, sides, targetnums) {
	let plottedGraphs = 0;
	let highestX = 0;
	let targetResult = 0;
	let meanRes = 0;
	let stdDevRes = 0;
	let probDistResult = [];
	for (k = 0; k < dice.length; k++) {
		/*if (dice[k] == 0 || sides[k] == 0 || targetnums[k] == 0) {
			continue;
		}*/
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
			//document.getElementById('data-anaylze-' + (k+1)).innerHTML = "";
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
			//document.getElementById('data-anaylze-' + (k+1)).innerHTML = "";
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

	for(j = 1; j < numgraphs + 1; j++) {
		if (document.getElementById("num-dice-"+j).value == '' || document.getElementById("sides-dice-"+j).value == '') {
			diceNumArray[j-1] = 0;
			sidesArray[j-1] = 0;
			successTHArray[j-1] = 0;
			targetnumArray[j-1] = 0;
		} else {
		diceNumArray[j-1] = parseInt(document.getElementById("num-dice-"+j).value);
		sidesArray[j-1] = parseInt(document.getElementById("sides-dice-"+j).value);
		targetnumArray[j-1] = parseInt(document.getElementById("target-dice-"+j).value);
		successTHArray[j-1] = parseInt(document.getElementById("success-dice-"+j).value);
		}
		if (document.getElementById("target-dice-"+j).value == '') {
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

document.getElementById("graph-type").addEventListener('change', (event) => {
	if (event.target.value == 'successes' ) {
		for (let i = 1; i < numgraphs + 1; i++) {
			document.getElementById('success-section-' + i).style.display = "flex";
		}
		graphtype = "successes";
	}
	else if (event.target.value == 'total') {
		for (let i = 1; i < numgraphs + 1; i++) {
			document.getElementById('success-section-' + i).style.display = "none";
		}
		graphtype = "total";
	}
});

document.getElementById("add-graph").onclick = function(){
	numgraphs += 1;
	let newgraph = document.createElement('div');
	let datadiv = document.getElementById("data-inputs");
	let looparrayitems = ["num", "sides", "success", "target"];
	let loopinnerHTML = ["Number of dice:", "How Many Sides:", "Success Threshold:", "Target Number:"];

	//middiv.classList.add("namedatapair");

	newgraph.id = "dataset-" + numgraphs;
	newgraph.classList.add("datarow");

	for (let i = 0; i < 4; i++) {
		let middiv = document.createElement('div');
		middiv.classList.add("namedatapair");
		if (i == 2) {
			middiv.classList.add("toggle-data");
			middiv.id = "success-section-" + numgraphs;
			if (graphtype == "successes") {
				middiv.style.display = "flex";
			} 
		}

		let numinput = document.createElement('input');
		numinput.type = "number";
		numinput.classList.add("number");
		numinput.id = looparrayitems[i] + "-dice-" + numgraphs;
		numinput.name = looparrayitems[i] + "-dice-" + numgraphs;

		let subdivlabel = document.createElement('label');
		subdivlabel.setAttribute("for", numinput.id);
		subdivlabel.classList.add("numtext");
		subdivlabel.innerHTML = loopinnerHTML[i];

		middiv.appendChild(subdivlabel);
		middiv.appendChild(numinput);

		newgraph.appendChild(middiv);
	}

	let newAnalytics = document.createElement('p');
	newAnalytics.classList.add('analysis-toggle');
	newAnalytics.id = "data-analyze-" + numgraphs; 

	let anaDiv = document.getElementById("data-analyze");
	anaDiv.appendChild(newAnalytics);
	/*numinput.type = "number";
	numinput.classList.add("number");
	numinput.id = "num-dice-" + numgraphs;
	numinput.name = "num-dice-" + numgraphs;

	subdivlabel.setAttribute("for", numinput.id);
	subdivlabel.classList.add("numtext");
	subdivlabel.innerHTML = "Number of dice:";

	middiv.appendChild(subdivlabel);
	middiv.appendChild(subdiv);

	newgraph.appendChild(middiv);

	middiv = document.createElement('div');
	numinput = document.createElement('input');
	subdivlabel = document.createElement('label');

	middiv.classList.add("namedatapair");

	numinput.type = "number";
	numinput.classList.add("number");
	numinput.id = "sides-dice-" + numgraphs;
	numinput.name = "sides-dice-" + numgraphs;

	subdivlabel.setAttribute("for", subdiv.id);
	subdivlabel.classList.add("numtext");
	subdivlabel.innerHTML = "How many sides:";

	middiv.appendChild(subdivlabel);
	middiv.appendChild(subdiv);

	newgraph.appendChild(middiv);

	---middiv = document.createElement('div');
	subdiv = document.createElement('input');
	subdivlabel = document.createElement('label');

	middiv.classList.add("namedatapair");

	subdiv.type = "number";
	subdiv.classList.add("number");
	subdiv.id = "total-dice-" + numgraphs;
	subdiv.name = "total-dice-" + numgraphs;

	subdivlabel.setAttribute("for", subdiv.id);
	subdivlabel.classList.add("numtext");
	subdivlabel.innerHTML = "Target number:";---

	middiv.appendChild(subdivlabel);
	middiv.appendChild(subdiv);

	newgraph.appendChild(middiv);*/

	datadiv.appendChild(newgraph);

}

document.getElementById("remove-graph").onclick = function() {
	document.getElementById("dataset-" + numgraphs).remove();
	document.getElementById("data-analyze-" + numgraphs).remove()
	numgraphs -= 1;
}
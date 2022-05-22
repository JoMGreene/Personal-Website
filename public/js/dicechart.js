const colorarray = ["#E71818", "#1857E7", "#4AE718", "#18E7BB", "#E0E718", "#8918E7", "#E718A5"];
const colorBgArray = ["rgba(231, 24, 24, 0.5)","rgba(24, 87, 231, 0.5)","rgba(74, 231, 24, 0.5)","rgba(24, 231, 187, 0.5)","rgba(224, 231, 24, 0.5)","rgba(137, 24, 231, 0.5)","rgba(231, 24, 165, 0.5)"];


Chart.defaults.font.size = 8;
let ctx = document.getElementById('myChart').getContext('2d');
let myChart = new Chart(ctx, {
    type: 'line',
    data: {
		datasets: [
			{
				data: [],
				label: 'Graph 1',
				fill: 'start',
				backgroundColor: 'rgba(170, 23, 23, 0.473)',
				borderColor: 'red',
				cubicInterpolationMode: 'default',
				tension: 0.4
			}
			/*{
				data: formattedLineData2,
				fill: 'start',
				backgroundColor: 'rgba(23, 23, 170, 0.473)',
				borderColor: 'blue',
				cubicInterpolationMode: 'default',
				tension: 0.4,
				pointHitRadius: 12
			}*/
		],
		//labels: xAxisTicks,
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
Chart.defaults.font.size = 16;


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

function stdprob(dice, sides, total) {
	let mean = dice * (sides + 1) / 2;
	let standdev = Math.sqrt(dice * ((sides**2) - 1) / 12);
	let res = (1/(standdev * Math.sqrt(2 * Math.PI))) * (Math.E**((-1/2)*(((total - mean) / standdev)**2)));
	return res;
}

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

function probabilityDistributionFormatted(dice,sides, points) {
	const probDist = [];

	let numsteps = Math.sqrt(dice*sides);
	//checklist: if dice > 20 do stdprob for whole thing, if total - sides*k - dice > 100 do stdprob for that value, if dice * sides > 100 do fewer step evaluations
	/*if (dice*sides > 150) {
		for (let i = 0; i < points.length; i++) {
			probDist[i] = {x: points[i], y: stdprob(dice,sides,Math.floor(points[i]))};
		}
		probDist[numsteps] = {x: i, y: stdprob(dice,sides,dice*sides)};
		return probDist;
	}
	for (let i = dice; i < dice*sides + 1; i++) {
		probDist[i] = {x: i, y: pointProbability(dice,sides,i)};
	}*/
	if (dice*sides > 150) {
		for (let i = 0; i < 31; i++) {
			probDist.push({x: Math.round((i*((dice*sides - dice) / 30) + dice)), y: stdprob(dice,sides, Math.round((i*((dice*sides - dice) / 30) + dice)))}); 
		}
		probDist.push({x: dice*sides, y: stdprob(dice,sides,dice*sides)});
		return probDist;
	}

	for (let k = dice; k < dice*sides + 1; k++) {
		probDist.push({x: k, y: pointProbability(dice,sides,k)})
	}
	/*for (let i of points) {
		if (i < dice*sides + 1 && i > dice - 1) {
			if (dice*sides > 150) {
				probDist.push({x: i, y: stdprob(dice,sides,i)}) 
			} else {
				probDist.push({x: i, y: pointProbability(dice,sides,i)}) 
			}
		}
	}*/
	console.log(probDist);

	return probDist;
}



function creategraph(dice, sides, points) {
	for (k = 0; k < dice.length; k++) {
		if (k < myChart.data.datasets.length) {
			myChart.data.datasets[k].data = probabilityDistributionFormatted(dice[k], sides[k], points);
			console.log(myChart.data.datasets[k].data);
			
		} else {	
			myChart.data.datasets.push({
				data: probabilityDistributionFormatted(dice[k], sides[k], points),
				fill: 'start',
				label: 'Graph ' + (k + 1),
				backgroundColor: colorBgArray[k % 7],
				borderColor: colorarray[k % 7],
				cubicInterpolationMode: 'default',
				tension: 0.4
			})
		}
		myChart.options.scales.x.min = points[0] - 1;
		myChart.options.scales.x.max = points[points.length - 1] + 1;
		myChart.options.scales.x.ticks.stepSize = Math.floor(points[points.length - 1] / 10);
	}
	myChart.update();
	console.log(myChart.data.datasets.length);
}

let numgraphs = 1;

document.getElementById("graph-data").onclick = function(){
	let diceNumArray = [];
	let sidesArray = [];
	let renderpoints = new Map()
	let renderpointarray = [];
	for(j = 1; j < numgraphs + 1; j++) {
		diceNumArray[j-1] = parseInt(document.getElementById("num-dice-"+j).value);
		sidesArray[j-1] = parseInt(document.getElementById("sides-dice-"+j).value);
	}
	for (k = 0; k < diceNumArray.length; k++) {
		if (diceNumArray[k] * sidesArray[k] < 150) {
			for (i = diceNumArray[k]; i < diceNumArray[k] * sidesArray[k] + 1; i++) {
				if (!(renderpoints.has(i))) {
					renderpoints.set(i, 1);
				}
			}
		} else {
			let numsteps = Math.sqrt(diceNumArray[k]*sidesArray[k]);
			for (let z = 0; z < Math.floor(numsteps); z++) {
				if (!(renderpoints.has(Math.floor(z*numsteps + diceNumArray[k])))) {
					renderpoints.set(Math.floor(z*numsteps + diceNumArray[k]), 1);
				}
			}
			renderpoints.set(diceNumArray[k]*sidesArray[k], 1)
		}
	}
	for (const renderkey of renderpoints.keys()) {
		renderpointarray.push(renderkey);
	}
	console.log(renderpointarray);
	renderpointarray.sort(function(a, b){return a - b});
	creategraph(diceNumArray, sidesArray, renderpointarray);
	console.log(myChart.data.datasets);
}


document.getElementById("add-graph").onclick = function(){
	numgraphs += 1;
	let middiv = document.createElement('div');
	let subdiv = document.createElement('input');
	let newgraph = document.createElement('div');
	let subdivlabel = document.createElement('label');
	let datadiv = document.getElementById("data-inputs");

	middiv.classList.add("namedatapair");

	newgraph.id = "dataset-" + numgraphs;
	newgraph.classList.add("datarow");

	subdiv.type = "number";
	subdiv.classList.add("number");
	subdiv.id = "num-dice-" + numgraphs;
	subdiv.name = "num-dice-" + numgraphs;

	subdivlabel.setAttribute("for", subdiv.id);
	subdivlabel.classList.add("numtext");
	subdivlabel.innerHTML = "Number of dice:";

	middiv.appendChild(subdivlabel);
	middiv.appendChild(subdiv);

	newgraph.appendChild(middiv);

	middiv = document.createElement('div');
	subdiv = document.createElement('input');
	subdivlabel = document.createElement('label');

	middiv.classList.add("namedatapair");

	subdiv.type = "number";
	subdiv.classList.add("number");
	subdiv.id = "sides-dice-" + numgraphs;
	subdiv.name = "sides-dice-" + numgraphs;

	subdivlabel.setAttribute("for", subdiv.id);
	subdivlabel.classList.add("numtext");
	subdivlabel.innerHTML = "How many sides:";

	middiv.appendChild(subdivlabel);
	middiv.appendChild(subdiv);

	newgraph.appendChild(middiv);

	/*middiv = document.createElement('div');
	subdiv = document.createElement('input');
	subdivlabel = document.createElement('label');

	middiv.classList.add("namedatapair");

	subdiv.type = "number";
	subdiv.classList.add("number");
	subdiv.id = "total-dice-" + numgraphs;
	subdiv.name = "total-dice-" + numgraphs;

	subdivlabel.setAttribute("for", subdiv.id);
	subdivlabel.classList.add("numtext");
	subdivlabel.innerHTML = "Target number:";*/

	middiv.appendChild(subdivlabel);
	middiv.appendChild(subdiv);

	newgraph.appendChild(middiv);

	datadiv.appendChild(newgraph);
}

document.getElementById("remove-graph").onclick = function() {
	document.getElementById("dataset-" + numgraphs).remove();
	numgraph -= 1;
}



console.log(myChart.data.datasets[0]);



//creating x - axis
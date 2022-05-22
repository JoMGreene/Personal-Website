//functions for calculating probabilities of dice roll outcomes.
//Had issues calculating values using the more accurate pointProbability when the number of dice and sides were high 
//current solution is to use a normal distribution with proper mean and standard deviation, as at high numbers of dice the probabilities are mostly accurate.


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
	}

	return probDist;
}

const margin = {top: 100, right: 50, bottom: 50, left: 50},
	width = 800 - margin.left - margin.right,
	height = 500 - margin.top - margin.bottom;

const colorarray = ["#E71818", "#1857E7", "#4AE718", "#18E7BB", "#E0E718", "#8918E7", "#E718A5"];

let svg = d3.select("#my_dataviz")
	.append("svg")
	//.attr("width", width + margin.left + margin.right)
	//.attr("height", height + margin.top + margin.bottom)
	.attr("preserveAspectRatio", "xMinYMin meet")
	.attr("viewBox", "0 0 800 500")
	.append("g")
	.attr("transform", `translate(${margin.left},${margin.top})`);

let div = d3.select("body").append("div")	
	.attr("class", "tooltip")				
	.style("opacity", 0);


function creategraph(dice,sides) {

	svg = d3.select("#my_dataviz > *")
			.append("g")
			.attr("transform", `translate(${margin.left},${margin.top})`);
	

	let axesdomain = 0;
	let axesindex = 0;
	let axesrange = 0;
	for (m = 0; m < sides.length;m++) {
		if (dice[m]*sides[m] > axesdomain) {
			axesdomain = dice[m]*sides[m];
			axesindex = m;
		}
	}

	let dataarray = [];
	for (k=0;k<dice.length;k++) {
		dataarray[k] = probabilityDistribution(dice[k],sides[k]);
		let tempmax = Math.max(dataarray[k]);
		if (tempmax > axesrange) {
			axesrange = tempmax;
		}
	}

	console.log(dataarray);

	let ymax = dataarray[axesrange].reduce(function(a, b) {
		return Math.max(a, b);
	}, -Infinity);

	


	let x = d3.scaleLinear()
				.domain([0, axesdomain + dice[axesindex]])
				.range([0, width]);				
	svg.append("g")
		.attr("transform", `translate(0, ${height})`)
		.call(d3.axisBottom(x));

	let y = d3.scaleLinear()
				.range([height, 0])
				.domain([0, ymax**(2/3)]);
	svg.append("g")
		.call(d3.axisLeft(y));

	for (n = 0;n < dataarray.length;n++) {	
		let data = [];
		if (dice[n]*sides[n] > 150) {
			let numsteps = Math.sqrt(dice[n]*sides[n]);
			for (let i = 0; i < numsteps; i++) {
				data.push({step: Math.floor(parseInt(dice[n]) + i*numsteps), value: dataarray[n][i]});
			}
			data.push({step: dice[n]*sides[n], value: dataarray[n][numsteps]});
		}
		else {
			for (let i = dice[n]; i < dice[n]*sides[n] + 1; i++) {
				data.push({step: i, value: dataarray[n][i]});
			}
		}


		svg.append("path")
			.attr("class", "mypath")
			.datum(data)
			.attr("fill", "none")
			.attr("opacity", ".8")
			.attr("stroke", colorarray[n % 7])
			.attr("stroke-width", 1)
			.attr("stroke-linejoin", "round")
			.attr("d",  d3.line()
					.curve(d3.curveBasis)
						.x(d => x(d.step))
						.y(d => y(d.value))
			)
			.on("mouseover", function(event, datum) {
				const[x, y] = d3.pointer(event);
				div.style("opacity", .9);
				div.html("Dice Result:" + datum.step + "<br/>" + "Probability:" + datum.value)
				  .style("left", ((x) + height) + "px")
				  .style("top", ((y) + width) + "px");
			  })				
			.on("mouseout", function(d) {		
				div.transition()		
					.duration(500)		
					.style("opacity", 0);	
			});
		let area = d3.area()
					.curve(d3.curveBasis)
					.x(d => x(d.step))
					.y0(height)
					.y1(d => y(d.value));
		
		svg.append("path")
			.attr("class", "area")
			.datum(data)
			.attr("opacity", ".3")
			.attr("fill", colorarray[n % 7])
			.attr("d", area);
	}

}

creategraph([3],[4]);
let testpoint = pointProbability(2,100,100);
console.log(testpoint);
console.log(factorial(100));

let numgraphs = 1;

document.getElementById("graph-data").onclick = function(){
	d3.selectAll("svg > *").remove();
	let currnum = [];
	let currsides = [];
	for(j = 1; j < numgraphs + 1; j++) {
		currnum[j-1] = parseInt(document.getElementById("num-dice-"+j).value);
		currsides[j-1] = parseInt(document.getElementById("sides-dice-"+j).value);
	}
	
	console.log(currnum);
	console.log(currsides);
	creategraph(currnum, currsides);
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

	middiv = document.createElement('div');
	subdiv = document.createElement('input');
	subdivlabel = document.createElement('label');

	middiv.classList.add("namedatapair");

	subdiv.type = "number";
	subdiv.classList.add("number");
	subdiv.id = "total-dice-" + numgraphs;
	subdiv.name = "total-dice-" + numgraphs;

	subdivlabel.setAttribute("for", subdiv.id);
	subdivlabel.classList.add("numtext");
	subdivlabel.innerHTML = "Target number:";

	middiv.appendChild(subdivlabel);
	middiv.appendChild(subdiv);

	newgraph.appendChild(middiv);

	datadiv.appendChild(newgraph);
}

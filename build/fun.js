const ctx = document.getElementById('myChart').getContext('2d');
const myChart = new Chart(ctx, {
	type: 'line',
	data: {
		datasets: [{
    		data: [{x: 10, y: 20}, {x: 15, y: null}, {x: 20, y: 10}]
		}]
	}
});
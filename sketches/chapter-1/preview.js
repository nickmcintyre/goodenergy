let wind;
let plot;

function preload() {
  let url = 'https://data.goodenergy.cc/wind/2008.csv';
  wind = loadTable(url, 'csv', 'header');
}

function setup() {
  createCanvas(400, 400);

  wind.parseDates('Time');
  wind.inferTypes();
  plot = createPlot(wind);
  plot.configure({ majorTicks: 2 });

  describe('A noisy line plot of wind speed versus time with a hurricane rotating near a spike in wind speed.');
}

function draw() {
  plot.title('2008 Galveston offshore wind speed at 100m');
  plot.xlabel('Time');
  plot.ylabel('Wind speed (m/s)');
  plot.line({ x: 'Time', y: 'Speed' });
  plot.render();

  hurricane();
}

function hurricane() {
  translate(275, 75);
  stroke('red');
  strokeWeight(5);
  fill('white');
  let r = 10;
  circle(0, 0, 2 * r);
  let angle = -frameCount / 10;
  rotate(angle);
  line(0, -r, 1.5 * r, -r);
  line(0, r, -1.5 * r, r);
}

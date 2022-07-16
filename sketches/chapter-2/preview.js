let plot;
const battery = {
  ah: 100,
  v: 12,
  maxdod: 0.8,
  cRate: 20,
};
battery.capacity = battery.ah * battery.v;
let fanAngle = 0;
const button = {
  x: 320,
  y: 152,
  r: 10,
};
let circuit;

function setup() {
  createCanvas(400, 400);

  circuit = createTable(['Time', 'Solar', 'Battery', 'Fan']);
  const timeStep = circuit.addRow();
  timeStep.set('Time', 0);
  timeStep.set('Solar', 0);
  timeStep.set('Battery', battery.capacity / 2);
  timeStep.set('Fan', 0);

  plot = createPlot(circuit);
  plot.size(width, height / 2);
  const props = {
    isDynamic: true,
    yRange: {
      min: 0,
      max: battery.capacity,
    },
  };
  plot.configure(props);
  plot.position(0, height / 2);

  frameRate(12);

  describe('A solar panel charging a battery that powers a fan.');
}

function draw() {
  drawSky();
  drawGround();

  drawPanel();
  drawBattery();
  drawFan();
  drawCircuit();

  plot.title('Battery energy storage');
  plot.xlabel('Time');
  plot.ylabel('Energy (Wh)');
  plot.line({ x: 'Time', y: 'Battery' });
  plot.render();

  update();
}

function update() {
  const timeStep = circuit.addRow();
  const last = circuit.getRowCount() - 1;
  timeStep.set('Time', last);
  // supply
  timeStep.set('Solar', random(100, 300));
  // demand
  const { x, y, r } = button;
  if (mouseIsPressed && dist(x, y, mouseX, mouseY) < r) {
    timeStep.set('Fan', 200);
  } else {
    timeStep.set('Fan', 0);
  }
  // physics
  runCircuit();
}

function drawSky() {
  // sky
  background('dodgerblue');
  // sun
  fill('gold');
  noStroke();
  circle(80, 30, 50);
  // cloud
  const last = circuit.getRowCount() - 1;
  const solarEnergy = circuit.get(last, 'Solar');
  const a = 70 - map(solarEnergy, 100, 300, 0, 20);
  fill(255, a);
  ellipse(80, 45, 100, 30);
}

function drawGround() {
  stroke('burlywood');
  fill('burlywood');
  rect(0, 150, width, 50);
}

function drawPanel() {
  push();
  translate(80, 85);
  stroke('gainsboro');
  strokeWeight(2);
  fill('midnightblue');
  quad(-30, 0, 30, 0, 40, 80, -40, 80);
  pop();
}

function drawBattery() {
  push();
  translate(width / 2, 160);
  fill('gray');
  stroke('gray');
  strokeWeight(1);
  let w = 80;
  const h = 30;
  translate(-w / 2, 0);
  rect(0, 0, w, h);
  fill('limegreen');
  const last = circuit.getRowCount() - 1;
  const charge = circuit.get(last, 'Battery');
  w = map(charge, 0, battery.capacity, 0, w);
  rect(0, 0, w, h);
  pop();
}

function drawFan() {
  push();
  const last = circuit.getRowCount() - 1;
  const fanEnergy = circuit.get(last, 'Fan');
  const angleSpeed = fanEnergy * 0.1;
  fanAngle += angleSpeed;
  translate(320, 90);
  // frame
  fill('black');
  stroke('black');
  strokeWeight(1);
  rectMode(CENTER);
  rect(0, 50, 50, 51);
  fill('dodgerblue');
  stroke('black');
  strokeWeight(2);
  circle(0, 0, 100);
  const supply = circuit.get(last, 'Battery');
  const minCharge = (1 - battery.maxdod) * battery.capacity;
  if (supply > minCharge) {
    rotate(fanAngle);
  }
  // blades
  noStroke();
  fill('lightblue');
  ellipse(0, 0, 95, 50);
  rotate(HALF_PI);
  ellipse(0, 0, 95, 50);
  noFill();
  stroke('black');
  circle(0, 0, 30);
  pop();
  // button
  push();
  const { x, y, r } = button;
  translate(x, y);
  if (dist(x, y, mouseX, mouseY) < r && mouseIsPressed) {
    fill('red');
  } else {
    fill('gray');
  }
  noStroke();
  circle(0, 0, 2 * r);
  stroke('white');
  strokeWeight(3);
  scale(0.5);
  line(0, -r / 2, 0, r / 4);
  noFill();
  arc(0, 0, 2 * r, 2 * r, -QUARTER_PI, 5 * QUARTER_PI);
  pop();
}

function drawCircuit() {
  push();

  // left
  // positive
  push();
  translate(80, 88);
  stroke('red');
  strokeWeight(2);
  line(20, 79, 20, 85);
  line(20, 85, 79, 85);
  pop();
  // negative
  push();
  translate(40, 88);
  stroke('black');
  strokeWeight(2);
  line(20, 79, 20, 90);
  line(20, 90, 119, 90);
  pop();

  // right
  // positive
  push();
  translate(295, 88);
  stroke('red');
  strokeWeight(2);
  line(20, 79, 20, 85);
  line(20, 85, -54, 85);
  pop();
  // negative
  push();
  translate(305, 88);
  stroke('black');
  strokeWeight(2);
  line(20, 79, 20, 90);
  line(20, 90, -64, 90);
  pop();

  pop();
}

function runCircuit() {
  const last = circuit.getRowCount() - 1;
  const solarEnergy = circuit.get(last, 'Solar');
  const prevCharge = circuit.get(last - 1, 'Battery');
  const fanEnergy = circuit.get(last, 'Fan');
  const maxCharge = battery.capacity / battery.cRate;
  // compute supply and demand
  if (solarEnergy > fanEnergy) {
    // charging
    let demand = battery.capacity - prevCharge;
    let supply = solarEnergy - fanEnergy;
    demand = min(demand, maxCharge);
    supply = min(supply, demand);
    circuit.set(last, 'Battery', prevCharge + supply);
  } else {
    // discharging
    let demand = fanEnergy - solarEnergy;
    let supply = prevCharge - (1 - battery.maxdod) * battery.capacity;
    supply = constrain(supply, 0, maxCharge);
    demand = min(supply, demand);
    circuit.set(last, 'Battery', prevCharge - demand);
  }
}
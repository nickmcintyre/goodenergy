let url = 'https://data.goodenergy.cc/wind/2008.csv'
let wind
let plot

function preload() {
  wind = loadTable(url, 'csv', 'header')
}

function setup() {
  createCanvas(400, 400)

  wind.parseDates('Time')
  wind.inferTypes()

  plot = createPlot(wind)

  noLoop()

  describe('A histogram of wind speed values')
}
  
function draw() {
  plot.title('Distribution of Galveston\'s offshore wind speeds in 2008')
  plot.xlabel('Wind speed (m/s)')
  plot.ylabel('Number of hours')
  plot.bar({ x: 'Speed' })
  plot.render()
}

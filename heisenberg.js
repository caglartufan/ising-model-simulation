// Canvas related constants
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const latticeLength = 500;
const latticeOffsetX = 2;
const latticeOffsetY = 2;
const latticeLineWidth = 1;
const graphWidth = 500;
const graphHeight = 250;
const graphOffsetX = latticeOffsetX+(2*latticeLineWidth)+latticeLength+20;
const graphOffsetY = latticeOffsetY;
const graphBorderWidth = 1;
const graphPaddingX = 30;
const graphPaddingY = 30;
var fps = 60;
var frameInterval = 1000/fps;
var startTime, now, then, elapsed;

// Canvas related functions
function renderLattice() {
    // Render borders of lattice
    ctx.beginPath();
    ctx.lineWidth = latticeLineWidth;
    ctx.strokeStyle = 'black';
    ctx.moveTo(latticeOffsetX, latticeOffsetY-latticeLineWidth);
    ctx.lineTo(latticeLength+latticeOffsetX, latticeOffsetY-latticeLineWidth);
    ctx.moveTo(latticeLength+latticeOffsetX+latticeLineWidth, latticeOffsetY-(2*latticeLineWidth));
    ctx.lineTo(latticeLength+latticeOffsetX+latticeLineWidth, latticeLength+latticeOffsetY);
    ctx.moveTo(latticeLength+latticeOffsetX+(2*latticeLineWidth), latticeLength+latticeOffsetY+latticeLineWidth);
    ctx.lineTo(latticeOffsetX, latticeLength+latticeOffsetY+latticeLineWidth);
    ctx.moveTo(latticeOffsetX-latticeLineWidth, latticeLength+latticeOffsetY+(2*latticeLineWidth));
    ctx.lineTo(latticeOffsetX-latticeLineWidth, latticeOffsetY-(2*latticeLineWidth));
    ctx.stroke();
    ctx.closePath();

    // Render each spin as red (up) and black (down) squares
    let sideLength = latticeLength/L;
    for(let i = 0; i < L; i++) {
        for(let j = 0; j < L; j++) {
            if(system[i][j] == 1) {
                ctx.fillStyle = 'blue';
            } else {
                ctx.fillStyle = 'black';
            }

            ctx.fillRect(latticeOffsetX+(j*sideLength), latticeOffsetY+(i*sideLength), sideLength, sideLength);
        }
    }
};

function renderGraph() {
    // Render borders of graph
    ctx.beginPath();
    ctx.lineWidth = graphBorderWidth;
    ctx.strokeStyle = 'black';
    ctx.moveTo(graphOffsetX, graphOffsetY-graphBorderWidth);
    ctx.lineTo(graphWidth+graphOffsetX, graphOffsetY-graphBorderWidth);
    ctx.moveTo(graphWidth+graphOffsetX+graphBorderWidth, graphOffsetY-(2*graphBorderWidth));
    ctx.lineTo(graphWidth+graphOffsetX+graphBorderWidth, graphHeight+graphOffsetY);
    ctx.moveTo(graphWidth+graphOffsetX+(2*graphBorderWidth), graphHeight+graphOffsetY+graphBorderWidth);
    ctx.lineTo(graphOffsetX, graphHeight+graphOffsetY+graphBorderWidth);
    ctx.moveTo(graphOffsetX-graphBorderWidth, graphHeight+graphOffsetY+(2*graphBorderWidth));
    ctx.lineTo(graphOffsetX-graphBorderWidth, graphOffsetY-(2*graphBorderWidth));
    ctx.stroke();
    ctx.closePath();

    // Render graph axes
    ctx.beginPath();
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'red';
    ctx.moveTo(graphOffsetX+graphBorderWidth+graphPaddingX-4, graphOffsetY+graphPaddingY+10);
    ctx.lineTo(graphOffsetX+graphBorderWidth+graphPaddingX, graphOffsetY+graphPaddingY);
    ctx.lineTo(graphOffsetX+graphBorderWidth+graphPaddingX+4, graphOffsetY+graphPaddingY+10);
    ctx.moveTo(graphOffsetX+graphBorderWidth+graphPaddingX, graphOffsetY+graphPaddingY);
    ctx.lineTo(graphOffsetX+graphBorderWidth+graphPaddingX, graphOffsetY+graphHeight-graphPaddingY);
    ctx.moveTo(graphOffsetX+graphPaddingX, graphOffsetY+graphHeight-graphPaddingY+graphBorderWidth);
    ctx.lineTo(graphOffsetX+graphWidth-graphPaddingX, graphOffsetY+graphHeight-graphPaddingY+graphBorderWidth);
    ctx.moveTo(graphOffsetX+graphWidth-graphPaddingX-10, graphOffsetY+graphHeight-graphPaddingY+graphBorderWidth-4);
    ctx.lineTo(graphOffsetX+graphWidth-graphPaddingX, graphOffsetY+graphHeight-graphPaddingY+graphBorderWidth);
    ctx.lineTo(graphOffsetX+graphWidth-graphPaddingX-10, graphOffsetY+graphHeight-graphPaddingY+graphBorderWidth+4);
    ctx.stroke();
    ctx.closePath();
};

function startAnimation() {
    frameInterval = 1000/fps;
    then = Date.now();
    startTime = then;
    update();
}

function update() {
    if(!isFinished) {
        window.requestAnimationFrame(update);
    }

    now = Date.now();
    elapsed = now - then;

    if(elapsed > frameInterval) {
        then = now-(elapsed%frameInterval);

        if(stepsCounter < maxSteps) {
            for(let i = 0; i < N*10; i++) {
                if(stepsCounter < maxSteps) {
                    monteCarloStep();
                }
            }
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            renderLattice();
            renderGraph();
            updateUIElements();
        } else {
            let avgEnergy = energyValues.reduce((sum, value) => sum + value, 0)/maxSteps;
            let avgMagnetization = magnetizationValues
                .reduce((sum, value) => addVectors(sum, value), [0, 0, 0])
                .map(component => component/maxSteps);

            console.log(`Temperature: ${T}`);
            console.log(`Average Energy: ${avgEnergy}`);
            console.log(`Average Magnetization: ${avgMagnetization}`);

            if(T <= 5) {
                T += 0.25;
                stepsCounter = 0;
                energyValues = new Array();
                magnetizationValues = new Array();
                initializeSystem();
            } else {
                isFinished = true;
            }
        }
    }
}

// UI related constants
const spanNumberOfSpins = document.getElementById('number-of-spins');
const spanExchangeConstant = document.getElementById('exchange-constant');
const spanTemperature = document.getElementById('temperature');
const spanEnergy = document.getElementById('energy');
const spanMagnetization = document.getElementById('magnetization');
const spanSteps = document.getElementById('steps');

// UI related functions
function updateUIElements() {
    // Update span texts
    spanNumberOfSpins.innerText = N;
    spanExchangeConstant.innerText = J;
    spanTemperature.innerText = T;
    spanEnergy.innerText = energyValues[stepsCounter];
    spanMagnetization.innerText = magnetizationValues[stepsCounter];
    spanSteps.innerText = stepsCounter;
};

var L = 32;
var N = L*L;
var J = 1;
var T = 0;
const k_B = 1;

var system = Array.from(new Array(L), () => new Array(L));
var energyValues = new Array();
var magnetizationValues = new Array();

var maxSteps = 1000*N;
var stepsCounter = 0;
var isFinished = false;

// Vector operations
function dotProduct(vectorA, vectorB) {
    return (vectorA[0]*vectorB[0])+(vectorA[1]*vectorB[1])+(vectorA[2]*vectorB[2]);
};

function addVectors(...vectors) {
    return vectors.reduce(
        (resultVector, vectorToAdd) => [
            resultVector[0]+vectorToAdd[0],
            resultVector[1]+vectorToAdd[1],
            resultVector[2]+vectorToAdd[2]
        ],
        [0, 0, 0]
    );
};

function flipVector(vector) {
    return vector.map(
        component => -component
    );
};

function absVector(vector) {
    return vector.map(
        component => Math.abs(component)
    );
};

function magnitude(vector) {
    return Math.sqrt(
        Math.pow(vector[0], 2)
        +Math.pow(vector[1], 2)
        +Math.pow(vector[2], 2)
    );
};

// Initialize 2D lattice with random spins with magnitude of 1 unit
function initializeSystem() {
    for(let i = 0; i < L; i++) {
        for(let j = 0; j < L; j++) {
            let theta = Math.random()*(2*Math.PI);
            let phi = Math.acos(2*Math.random()-1);

            system[i][j] = [
                Math.sin(theta)*Math.cos(phi),
                Math.sin(theta)*Math.sin(phi),
                Math.cos(theta)
            ];
        }
    }

    // Calculate initial energy and magnetization
    let { energy, magnetization } = calculateEnergyAndMagnetization();

    energyValues.push(energy);
    magnetizationValues.push(magnetization);
};

function calculateEnergyAndMagnetization() {
    let energy = 0;
    let magnetization = [0, 0, 0];

    for(let i = 0; i < L; i++) {
        for(let j = 0; j < L; j++) {
            energy += -J*dotProduct(system[i][j], addVectors(system[(i-1+L)%L][j], system[i][(j+1)%L]));
            magnetization = addVectors(magnetization, system[i][j]);
        }
    }

    return {
        energy,
        magnetization
    };
};

function monteCarloStep() {
    let i = parseInt(L*Math.random());
    let j = parseInt(L*Math.random());

    let neighboringSpins = addVectors(
        system[(i-1+L)%L][j],
        system[i][(j+1)%L],
        system[(i+1)%L][j],
        system[i][(j-1+L)%L]
    );
    let dE = 2*J*dotProduct(system[i][j], neighboringSpins);
    let dM = flipVector(system[i][j]).map(component => 2*component);

    if(dE <= 0) {
        system[i][j] = flipVector(system[i][j]);
        energyValues.push(energyValues[stepsCounter]+dE);
        magnetizationValues.push(addVectors(magnetizationValues[stepsCounter], dM));
    } else {
        if(Math.random() < Math.exp(-(2*J*dotProduct(absVector(system[i][j]), neighboringSpins))/(k_B*T))) {
            system[i][j] = flipVector(system[i][j]);
            energyValues.push(energyValues[stepsCounter]+dE);
            magnetizationValues.push(addVectors(magnetizationValues[stepsCounter], dM));
        } else {
            energyValues.push(energyValues[stepsCounter]);
            magnetizationValues.push(magnetizationValues[stepsCounter]);
        }
    }
    stepsCounter++;
};

// for(let t = 0; t < 21; t++) {
//     T = t/4;
//     stepsCounter = 0;
//     energyValues = new Array();
//     magnetizationValues = new Array();
//     initializeSystem();

//     while(stepsCounter < maxSteps) {
//         monteCarloStep();
//     }
    
//     let avgEnergy = energyValues.reduce((sum, value) => sum + value, 0)/maxSteps;
//     let avgMagnetization = magnetizationValues
//         .reduce((sum, value) => addVectors(sum, value), [0, 0, 0])
//         .map(component => component/maxSteps);
    
//     console.log(`Temperature: ${T}`);
//     console.log(`Average Energy: ${avgEnergy}`);
//     console.log(`Average Magnetization: ${magnitude(avgMagnetization)}`);
// };

initializeSystem();
startAnimation();
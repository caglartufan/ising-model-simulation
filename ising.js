// Canvas related constants
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const latticeLength = 500;
const latticeOffsetX = 2;
const latticeOffsetY = 2;
const latticeLineWidth = 1;

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
    spanEnergy.innerText = energyValues[stepsCouter];
    spanMagnetization.innerText = magnetizationValues[stepsCouter];
    spanSteps.innerText = stepsCouter;
};

// Ising model related variables
const L = 4;
const N = L*L;
const T = 1;
const J = 1;
const STEPS = 10000;

var system = Array.from(new Array(L), () => new Array(L));
var energyValues = new Array();
var magnetizationValues = new Array();
var stepsCouter = 0;

// Ising model related functions
function initializeSystem() {
    // Initialize lattice with random spins
    for(let i = 0; i < L; i++) {
        for(let j = 0; j < L; j++) {
            if(Math.random() < 0.5) {
                system[i][j] = -1;
            } else {
                system[i][j] = 1;
            }
        }
    }

    system = [[1, -1, 1, 1],
              [-1, -1, 1, -1],
              [-1, -1, -1, 1],
              [-1, -1, -1, 1]];

    // Calculate initial energy and magnetization
    let { energy, magnetization } = calculateEnergyAndMagnetization();

    energyValues.push(energy);
    magnetizationValues.push(magnetization);

    updateUIElements();
    renderLattice();
};

function calculateEnergyAndMagnetization() {
    let energy = 0;
    let magnetization = 0;

    for(let i = 0; i < L; i++) {
        for(let j = 0; j < L; j++) {
            energy += -J*system[i][j]*(system[(i-1+L)%L][j]+system[i][(j+1)%L]);
            magnetization += system[i][j];
        }
    }

    return {
        energy,
        magnetization
    };
};

function monteCarloStep() {
    let randomI = parseInt(Math.random()*L);
    let randomJ = parseInt(Math.random()*L);
    let randomSpin = system[randomI][randomJ];

    let dE = 2*(-randomSpin)*(system[(randomI-1+L)%L][randomJ]+system[randomI][(randomJ+1)%L]+system[(randomI+1)%L][randomJ]+system[randomI][(randomJ-1+L)%L]);
    let dM = 2*(-randomSpin);

    if(dE <= 0) {
        system[randomI][randomJ] = -randomSpin;
        energyValues.push(energyValues[stepsCouter]-dE);
        magnetizationValues.push(magnetizationValues[stepsCouter]+dM);
    } else {

    }

    console.log(`Choosen spin: system[${randomI}][${randomJ}]=${randomSpin}`);
    console.log(`Energy before step: ${energyValues[stepsCouter]}`);
    console.log(`dE: ${dE}`);
    console.log(`Magnetization before step: ${magnetizationValues[stepsCouter]}`);
    console.log(`dM: ${dM}`);
    system[randomI][randomJ] = -randomSpin;
    energyValues.push(energyValues[stepsCouter]-dE);
    magnetizationValues.push(magnetizationValues[stepsCouter]+dM);
    stepsCouter++;
    let { energy, magnetization } = calculateEnergyAndMagnetization();
    console.log(`Energy calculated: ${energy}`);
    console.log(`Energy updated: ${energyValues[stepsCouter]}`);
    console.log(`Magnetization calculated: ${magnetization}`);
    console.log(`Magnetization updated: ${magnetizationValues[stepsCouter]}`);
    renderLattice();
};

initializeSystem();
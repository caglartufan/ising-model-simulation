// Canvas related constants
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const latticeLength = 600;
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
    let sideLength = latticeLength/L;

    // Render grids
    let gridPosX = latticeOffsetX;
    let gridPosY = latticeOffsetY;
    ctx.beginPath();
    ctx.lineWidth = latticeLineWidth;
    ctx.strokeStyle = 'black';
    while(
        (gridPosX < (latticeLength+latticeOffsetX+latticeLineWidth))
        && (gridPosY < (latticeLength+latticeOffsetY+latticeLineWidth))
    ) {
        if(gridPosY < (latticeLength+latticeOffsetY+latticeLineWidth)) {
            ctx.moveTo(latticeOffsetX, gridPosY);
            ctx.lineTo(latticeOffsetX+latticeLength, gridPosY);
            
            gridPosY += sideLength;
        }
        if(gridPosX < (latticeLength+latticeOffsetX+latticeLineWidth)) {
            ctx.moveTo(gridPosX, latticeOffsetY);
            ctx.lineTo(gridPosX, latticeOffsetY+latticeLength);
            
            gridPosX += sideLength;
        }
    }
    ctx.stroke();
    ctx.closePath();

    // Render each spin as a vector with projection on x-y plane with anti-red and red color range indicating z-axis
    for(let i = 0; i < L; i++) {
        for(let j = 0; j < L; j++) {
            let xMapped = system[i][j][0]*(sideLength/2);
            let yMapped = system[i][j][1]*(-sideLength/2);
            let magXY = magnitude(system[i][j].map((component, index) => index == 2 ? 0 : component));
            let zCoordinate = system[i][j][2];
            let centerX = latticeOffsetX+((j+0.5)*sideLength);
            let centerY = latticeOffsetY+((i+0.5)*sideLength);
            let angleBetweenX = Math.acos(system[i][j][0])*(180/Math.PI);
            let angleBetweenY = Math.acos(system[i][j][1])*(180/Math.PI);
            ctx.beginPath();
            ctx.lineWidth = 1;
            ctx.strokeStyle = `rgb(${zCoordinate > 0 ? zCoordinate*255 : 0}, ${zCoordinate < 0 ? -zCoordinate*255 : 0}, 0)`;
            ctx.moveTo(centerX, centerY);
            ctx.lineTo(centerX+xMapped, centerY+yMapped);
            ctx.stroke();
            ctx.closePath();
        }
    }
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
            updateUIElements();
        } else {
            continueButton.removeAttribute('disabled');
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
const continueButton = document.getElementById('continue');

continueButton.addEventListener('click', function(event) {
    this.setAttribute('disabled', true);
    T += 0.25;
    stepsCounter = 0;
    energyValues = new Array();
    magnetizationValues = new Array();
    initializeSystem();
});

// UI related functions
function updateUIElements() {
    // Update span texts
    spanNumberOfSpins.innerText = N;
    spanExchangeConstant.innerText = J;
    spanTemperature.innerText = T;
    spanEnergy.innerText = (energyValues.reduce((total, value) => total+value,0)/stepsCounter).toFixed(2);
    spanMagnetization.innerText = magnitude(
        magnetizationValues
            .reduce((total, value) => addVectors(total, value), [0, 0, 0])
            .map(component => component/stepsCounter)
    ).toFixed(2);
    spanSteps.innerText = stepsCounter;
};

var L = 20;
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
            let theta = Math.random()*(2*Math.PI);  // 0-2pi radian
            let phi = Math.acos(2*Math.random()-1); // 0-pi radian

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
        // if(Math.random() < Math.exp(-(2*J*dotProduct(system[i][j], neighboringSpins))/(k_B*T))) {
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

initializeSystem();
startAnimation();
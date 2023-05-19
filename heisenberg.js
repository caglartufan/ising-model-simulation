var L = 2;
var N = L*L;
var J = 1;
var T = 0;
const k_B = 1;

var system = Array.from(new Array(L), () => new Array(L));
var energyValues = new Array();
var magnetizationValues = new Array();

var maxSteps = 1000*N;
var isFinished = false;
var stepsCounter = 0;

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

function magnitude(vector) {
    return Math.sqrt(
        Math.pow(vector[0], 2)
        +Math.pow(vector[1], 2)
        +Math.pow(vector[2], 2)
    );
};

// Transition probability calcualtion
function transitionProbability(t, neighboringSpins) {
    t=(t+1)/4;
    let e4 = Math.exp(-4/t);
    let e8 = Math.pow(e4, 2);
    let c = 0;

    if(neighboringSpins == 0) {
        c = 0;
    }
    if(neighboringSpins == 2) {
        c = e4;
    }
    if(neighboringSpins == 4) {
        c = e8;
    }
    if(neighboringSpins == -2) {
        c = 1/e4;
    }
    if(neighboringSpins == -4) {
        c = 1/e8;
    }

    return c;
}

function initializeSystem() {
    // Initialize lattice with random unit vector spins
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
    let magnetization = 0;

    for(let i = 0; i < L; i++) {
        for(let j = 0; j < L; j++) {
            energy += -J*dotProduct(system[i][j], addVectors(system[(i-1+L)%L][j], system[i][(j+1)%L]));
            // magnetization += system[i][j];
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

    let neighboringSpins = system[(i-1+L)%L][j]
                 + system[i][(j+1)%L]
                 + system[(i+1)%L][j]
                 + system[i][(j-1+L)%L];
    let dE = system[i][j]*neighboringSpins;
    let dM = 2*(-system[i][j]);

    if(dE <= 0) {
        system[i][j] = -system[i][j];
        energyValues.push(energyValues[stepsCouter]+dE);
        magnetizationValues.push(magnetizationValues[stepsCouter]+dM);
    } else {
        if(Math.random() < transitionProbability(T, neighboringSpins)) {
            system[i][j] = -system[i][j];
            energyValues.push(energyValues[stepsCouter]+dE);
            magnetizationValues.push(magnetizationValues[stepsCouter]+dM);
        } else {
            energyValues.push(energyValues[stepsCouter]);
            magnetizationValues.push(magnetizationValues[stepsCouter]);
        }
    }
    stepsCouter++;
};

initializeSystem();
console.log(system.map(
    row => row.map(spin => [...spin, magnitude(spin)])
));
console.log(energyValues);
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

for(let t = 0; t < 21; t++) {
    T = t/4;
    stepsCounter = 0;
    energyValues = new Array();
    magnetizationValues = new Array();
    initializeSystem();

    while(stepsCounter < maxSteps) {
        monteCarloStep();
    }
    
    let avgEnergy = energyValues.reduce((sum, value) => sum + value, 0)/maxSteps;
    let avgMagnetization = magnetizationValues
        .reduce((sum, value) => addVectors(sum, value), [0, 0, 0])
        .map(component => component/maxSteps);
    
    console.log(`Temperature: ${T}`);
    console.log(`Average Energy: ${avgEnergy}`);
    console.log(`Average Magnetization: ${magnitude(avgMagnetization)}`);
}
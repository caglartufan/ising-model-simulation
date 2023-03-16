// Canvas related constants
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// Canvas related functions
function renderLattice() {
    ctx.fillStyle = 'red';
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'black';
    ctx.rect(0, 0, 50, 50);
    ctx.fill();
    ctx.stroke();
};

// Ising model related variables
const L = 4;
const N = L*L;
const T = 1;
const J = 1;
const STEPS = 10000;

var system = Array.from(new Array(L), () => new Array(L));
var energy = 0;
var magnetization = 0;

// Ising model related functions
function calculateEnergyAndMagnetization() {
    let energy = 0;
    let magnetization = 0;

    for(let i = 0; i < L; i++) {
        let iTop = i-1;
        if(i == 0) {
            iTop = L-1;
        }

        for(let j = 0; j < L; j++) {
            let jRight = j+1;
            if(j == L-1) {
                jRight = 0;
            }

            energy += -J*system[i][j]*(system[iTop][j]+system[i][jRight]);
            magnetization += system[i][j];
        }
    }

    return {
        energy,
        magnetization
    };
};

// Initialize Ising model
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

console.log(system);
console.log(calculateEnergyAndMagnetization());
renderLattice();
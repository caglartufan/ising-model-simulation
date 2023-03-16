import numpy as np
import matplotlib.pyplot as plt
from matplotlib.animation import FuncAnimation

# Define the parameters
N = 250 # Size of the spin system
T = 2.0 # Temperature
J = 1.0 # Interaction strength
num_steps = 10 # Number of Monte Carlo steps
interval = 1000/60 # Animation interval in milliseconds

# Initialize the spin system randomly
system = np.random.choice([-1, 1], size=(N, N))

# Define the energy function
def energy(system, J):
    """
    Calculates the energy of the given spin system with periodic boundary conditions.
    """
    e = 0
    rows, cols = system.shape
    for i in range(rows):
        for j in range(cols):
            e += -J * system[i,j] * (system[(i+1)%N, j] + system[i,(j+1)%N] + system[(i-1)%N, j] + system[i,(j-1)%N])
    return e

# Define the magnetization function
def magnetization(system):
    """
    Calculates the magnetization of the given spin system.
    """
    return np.sum(system)

# Define the Monte Carlo step function
def monte_carlo_step(system, T, J):
    """
    Performs one Monte Carlo step on the given spin system at the given temperature with the Metropolis algorithm.
    """
    rows, cols = system.shape
    for k in range(rows*cols):
        i = np.random.randint(rows)
        j = np.random.randint(cols)
        # Calculate the energy change if we flip the spin at (i,j)
        delta_e = 2 * J * system[i,j] * (system[(i+1)%N, j] + system[i,(j+1)%N] + system[(i-1)%N, j] + system[i,(j-1)%N])
        # Flip the spin with probability according to the Boltzmann distribution
        if delta_e <= 0 or np.random.rand() < np.exp(-delta_e/T):
            system[i,j] *= -1

# Create a figure to display the spin system
fig = plt.figure(figsize=(6,6))
ax = fig.add_subplot(111)
ax.set_axis_off()
im = ax.imshow(system, cmap='gray', vmin=-1, vmax=1)

# Define the animation function
def update(frame):
    for step in range(num_steps):
        monte_carlo_step(system, T, J)
    im.set_data(system)
    return im,

# Create the animation
ani = FuncAnimation(fig, update, interval=interval, blit=True)

# Show the plot
plt.show()
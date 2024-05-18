import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
import json

# import json file
with open('results-9.json', 'r') as f:
    data = json.load(f)
    # print first 5 elements
    print(data[:5])

# Sample data
accuracies = [0.8, 0.85, 0.9, 0.75, 0.95]
times_taken = [10, 15, 20, 25, 30]
labels = ['algCotZeroshot', 'B', 'C', 'D', 'E']

# Font size
font_size = 12

# Set the font to be LaTeX
plt.rc('text', usetex=True)
plt.rc('font', family='serif', size=font_size)

# Create a scatter plot
plt.figure(figsize=(10, 6))
plt.scatter(times_taken, accuracies, marker='x')

# Add labels to each point
for i, label in enumerate(labels):
    plt.text(times_taken[i] + 0.2, accuracies[i], label, fontsize=12, ha='left')

# Add title and labels to the axes
plt.title('Accuracy vs Time Taken')
plt.xlabel('Time Taken (s)')
plt.ylabel('Accuracy')

# Show the plot
plt.grid(True)
plt.savefig('plot.pdf', dpi=300, bbox_inches='tight')

if False:
  plt.xlim(0, 10)
  plt.ylim(0, 10)

  # use latex font
  plt.rc('text', usetex=True)
  plt.rc('font', family='serif')

  plt.plot(self.start_state[0], self.start_state[1], 'go', label='Start')
  plt.plot(self.goal_state[0], self.goal_state[1], 'ro', label='Goal')

  # Count the number of states added to the tree
  num_states = len(self.rrt_start_tree) + len(self.rrt_goal_tree)

  # Create a custom legend entry
  num_states_patch = mpatches.Patch(color='none', label=f'Number of states: {num_states}')
  num_collision_checks = mpatches.Patch(color='none', label=f'Number of collision checks: {self.collision_checks}')

  # Add the custom legend entry to the existing legend entries
  plt.legend(handles=[mpatches.Patch(color='green', label='Start'), 
                      mpatches.Patch(color='red', label='Goal'), 
                      num_states_patch,
                      num_collision_checks], loc='upper left', fontsize='x-large')

  plt.grid(True)
  # limit the plot to the workspace
  plt.axis('equal')
  plt.savefig('rrt_connect.pdf', dpi=300, bbox_inches='tight')
  plt.show()
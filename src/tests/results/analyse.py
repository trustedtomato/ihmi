import sys
import json
from collections import defaultdict
from typing import Any, Dict, Set
import matplotlib.pyplot as plt
import matplotlib.lines as mlines
from adjustText import adjust_text
import numpy as np

# utilities
def try_catch(func):
    try:
        return func(), None
    except Exception as e:
        return None, e

def strip_indent(text: str) -> str:
    return '\n'.join(line.strip() for line in text.strip().split('\n'))

# load results
results_files = [f"results-{i}.json" for i in range(1,13)]#sys.argv[1::] if len(sys.argv) > 1 else ['./results.json']

def get_acc_scores(results_file):
    print(f'Processing {results_file}...')

    with open(results_file, 'r') as f:
        results = json.load(f)

    scores = defaultdict(lambda: defaultdict(lambda: defaultdict(lambda: defaultdict(lambda: {
        'correctResponses': set(),
        'correctVotes': 0,
        'voting': {},
        'time': 0
    }))))

    # process results
    for item in results:
        dataset = item['dataset']
        algorithm = item['algorithm']
        model = item['model']
        test = item['test']
        score = item['score']
        result = item['result']
        time = item['time']

        test_entry = scores[algorithm][model][dataset][test]
        test_entry['time'] += time

        parsed_result, error = try_catch(lambda: json.loads(result))
        if error:
            # print(strip_indent(f"""
            #     CAN'T PARSE RESULT
            #     Dataset: {dataset}
            #     Algorithm: {algorithm}
            #     Model: {model}
            #     Test: {test}
            #     Result: {result}
            #     Time: {time}
            # """) + '\n')
            continue

        parsed_result = json.dumps(sorted(r['trackingId'] for r in parsed_result))
        test_entry['voting'][parsed_result] = test_entry['voting'].get(parsed_result, 0) + 1

        if score == 1:
            test_entry['correctResponses'].add(parsed_result)
            test_entry['correctVotes'] += 1

    # aggregate scores (also for self-consistency scores)
    scores_acc = {}

    for algorithm, models in scores.items():
        for model, datasets in models.items():
            for dataset, tests in datasets.items():
                for test, details in tests.items():
                    correct_responses = details['correctResponses']
                    voting = details['voting']
                    
                    most_voted = max(voting.items(), key=lambda x: x[1], default=(None, 0))
                    most_voted_result = most_voted[0]
                    is_vote_correct = most_voted_result in correct_responses

                    if algorithm not in scores_acc:
                        scores_acc[algorithm] = {}
                    if model not in scores_acc[algorithm]:
                        scores_acc[algorithm][model] = {
                            'correct': 0,
                            'total': 0,
                            'individualCorrect': 0,
                            'individualTotal': 0,
                            'timeTotal': 0
                        }

                    model_entry = scores_acc[algorithm][model]
                    model_entry['timeTotal'] += details['time'] / 1000 / 420
                    model_entry['total'] += 1
                    model_entry['individualTotal'] += sum(voting.values())

                    if is_vote_correct:
                        model_entry['correct'] += 1
                    else:
                        if (algorithm == 'algSplitCotFewshotAlt' or algorithm == 'algCotFewshotAlt' or algorithm == 'algCotZeroshot') and model == 'llama3':
                            pass
                            # print(strip_indent(f"""
                            #     Dataset: {dataset}
                            #     Algorithm: {algorithm}
                            #     Model: {model}
                            #     Test: {test}
                            #     Votes: {json.dumps(voting)}
                            # """) + '\n')

                    model_entry['individualCorrect'] += details['correctVotes']
    
    return scores_acc

results = list(map(get_acc_scores, results_files))


first_scores_acc = results[0]
times_taken = []
labels = []
for algorithm, _models in first_scores_acc.items():
    _model, details = list(_models.items())[0]
    times_taken.append(details['timeTotal'])
    labels.append(f'{algorithm}')

# Sort the data according to the x position (time taken)
first_sorted_data = sorted(zip(times_taken, labels))
label_order = [label for _, label in first_sorted_data]

results_by_algorithm = {}

# Collect the results by algorithm
for result in results:
    for algorithm, _models in result.items():
        if algorithm not in results_by_algorithm:
            results_by_algorithm[algorithm] = {'llama3': {'correct': [], 'total': [], 'individualCorrect': [], 'individualTotal': [], 'timeTotal': []}, 'phi3': {'correct': [], 'total': [], 'individualCorrect': [], 'individualTotal': [], 'timeTotal': []}}
        phi3_data, llama3_data = list(_models.items())
        phi3_data = phi3_data[1]
        llama3_data = llama3_data[1]
        current_algorithm_data = results_by_algorithm[algorithm]
        for key, value in phi3_data.items():
            current_algorithm_data['phi3'][key].append(value)
        for key, value in llama3_data.items():
            current_algorithm_data['llama3'][key].append(value)

# Make plots comparing all algorithms for each model

models = ['llama3', 'phi3']
model_names = ['Llama 3', 'Phi-3']
plot_types = ['spread', 'mean']

# Plot the results
for (model, model_name) in zip(models, model_names):
    for plot_type in plot_types:
        # Font size
        font_size = 12

        # colors = plt.cm.tab10.colors

        # Set the font to be LaTeX
        plt.rc('text', usetex=True)
        plt.rc('font', family='serif', size=font_size)

        # Create a scatter plot
        plt.figure(figsize=(10, 6))

        plt.ylim(0.2, 1)
        plt.xlim(0, 2)

        colors = ['red', 'blue', 'cyan', 'green', 'yellow', '#6f6', 'orange', 'pink', 'black', 'gray']
        alpha=0.3
        handles = []
        # Plot the data in the order of fastest to slowest
        for algorithm_name in label_order:
            algorithm_data = results_by_algorithm[algorithm_name]
            model_data = algorithm_data[model]
            accuracies = [model_data['correct'][i] / model_data['total'][i] for i in range(len(model_data['correct']))]
            accuracies_individual = [model_data['individualCorrect'][i] / model_data['individualTotal'][i] for i in range(len(model_data['individualCorrect']))]
            times_taken = [model_data['timeTotal'][i] for i in range(len(model_data['timeTotal']))]
            color_index = colors.pop(0)
            if plot_type == 'spread':
                plt.scatter(times_taken, accuracies, marker='$\circ$', color=color_index, alpha=alpha)
                plt.scatter(times_taken, accuracies_individual, color=color_index, marker='x', alpha=alpha)
            elif plot_type == 'mean':
                plt.scatter(np.mean(times_taken), np.mean(accuracies), marker='$\circ$', color=color_index)
                plt.scatter(np.mean(times_taken), np.mean(accuracies_individual), color=color_index, marker='x')
            
            # Hack for legend entries
            handles.append(mlines.Line2D([], [], color=color_index, marker='o', linestyle='None', markersize=8, label=algorithm_name))

        # Add title and labels to the axes
        plt.title('Accuracy vs Average Run Time (' + model_name + ')')
        plt.xlabel('Average Run Time (s)')
        plt.ylabel('Accuracy')

        # Add a legend
        plt.legend(title='Labels', handles=handles, fontsize=font_size-2, title_fontsize=font_size-2, loc='lower right')

        # Show the plot
        plt.grid(True)
        plt.savefig('plot-' + model + '-' + plot_type + '.pdf', dpi=300, bbox_inches='tight')



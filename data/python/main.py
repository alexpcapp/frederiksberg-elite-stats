# Main script for updating when new data has been added to google sheets


import convert_data_player_offense  # Replace 'your_script' with the actual name of your script file (without the .py extension)
import convert_data_top_scorer

if __name__ == "__main__":
    convert_data_player_offense.fetch_and_process_data()


if __name__ == "__main__":
    convert_data_top_scorer.fetch_and_process_data()


print("Running main.py")
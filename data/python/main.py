# main.py

from convert_data_player_offense import load_offense_data
from convert_data_player_defense import load_defense_data
from convert_data_top_scorer import load_top_scorer_data


def main():
    load_offense_data()

    load_defense_data()

    load_top_scorer_data()


if __name__ == "__main__":
    main()

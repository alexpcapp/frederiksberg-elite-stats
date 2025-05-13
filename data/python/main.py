# main.py

from data.python.convert_data_player_offense import load_sheet

def main():
    df = load_sheet()
    print(df)

if __name__ == "__main__":
    main()

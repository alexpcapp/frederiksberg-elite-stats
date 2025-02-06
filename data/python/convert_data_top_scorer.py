import gspread
from oauth2client.service_account import ServiceAccountCredentials
import pandas as pd
import json

def fetch_and_process_data():
    # Set up the scope for the APIs
    scope = ["https://www.googleapis.com/auth/spreadsheets.readonly", 
             "https://www.googleapis.com/auth/drive.readonly"]

    # Provide the path to the credentials JSON file you downloaded
    creds = ServiceAccountCredentials.from_json_keyfile_name('/Users/alexandercappelen/Documents/keys/frb-elite-88e4dcc7ec5c.json', scope)

    # Authorize and create the client
    client = gspread.authorize(creds)

    # Open the sheet by name
    player_earned = client.open("frb-volley-game-stats").worksheet("player-earned")

    # Fetch all records (rows) from the sheet
    player_earned_data = player_earned.get_all_records()

    # Convert the data into a DataFrame
    df = pd.DataFrame(player_earned_data)

    points_per_set = df.groupby(['player', 'match', 'set'])['total-earned'].sum().reset_index()
    points_per_game = df.groupby(['player', 'match'])['total-earned'].sum().reset_index()
    total_points = df.groupby('player')['total-earned'].sum().reset_index()

    df_final = points_per_set.merge(points_per_game, on=['player', 'match'], suffixes=('_per_set', '_per_game'))
    df_final = df_final.merge(total_points, on='player', suffixes=('', '_total'))

    df_final.drop(columns='match', inplace=True)

    total_points['points'] = total_points['total-earned']
    points_per_game['points'] = points_per_game['total-earned']
    points_per_game['max-earned'] = points_per_game.groupby('player')['points'].transform('sum')

    # Convert DataFrame to JSON and save as files
    data = total_points.to_dict(orient="records")  # Convert DataFrame rows to list of dictionaries
    with open("../top-scorer.json", "w") as f:
        json.dump(data, f, indent=4)

    data = points_per_game.to_dict(orient="records")  # Convert DataFrame rows to list of dictionaries
    with open("../top-scorer-per-game.json", "w") as f:
        json.dump(data, f, indent=4)

# Entry point to run the function when the script is executed directly
if __name__ == "__main__":
    fetch_and_process_data()


import gspread
import pandas as pd
from oauth2client.service_account import ServiceAccountCredentials
import json

def load_top_scorer_data(creds_path="/Users/alexandercappelen/Documents/keys/frb-elite-88e4dcc7ec5c.json"):

    print("Loading top-scorer data...")



    scope = [
        "https://www.googleapis.com/auth/spreadsheets.readonly", 
        "https://www.googleapis.com/auth/drive.readonly"
    ]
    
    creds = ServiceAccountCredentials.from_json_keyfile_name(creds_path, scope)
    client = gspread.authorize(creds)

    player_earned = client.open("frb-volley-game-stats").worksheet("player-earned")

    # Fetch all records (rows) from the sheet
    player_earned_data = player_earned.get_all_records()

    # Print the data or convert it into a DataFrame
    import pandas as pd
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


    data = total_points.to_dict(orient="records")  # Convert DataFrame rows to list of dictionaries
    with open("data/top-scorer.json", "w") as f:
        json.dump(data, f, indent=4)


    data = points_per_game.to_dict(orient="records")  # Convert DataFrame rows to list of dictionaries
    with open("data/top-scorer-per-game.json", "w") as f:
        json.dump(data, f, indent=4)


    print("Top-scorer data loaded and saved to top-scorer.json.")
    print("Top-scorer per game loaded and saved to top-scorer-per-game.json.")


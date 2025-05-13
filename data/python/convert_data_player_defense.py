
import gspread
import pandas as pd
from oauth2client.service_account import ServiceAccountCredentials
import json

def load_defense_data(creds_path="/Users/alexandercappelen/Documents/keys/frb-elite-88e4dcc7ec5c.json"):
    
    print("Loading defense data...")
    
    scope = [
        "https://www.googleapis.com/auth/spreadsheets.readonly", 
        "https://www.googleapis.com/auth/drive.readonly"
    ]
    
    creds = ServiceAccountCredentials.from_json_keyfile_name(creds_path, scope)
    client = gspread.authorize(creds)
    
    # Open worksheets
    sheet = client.open("frb-volley-game-stats")
    defense_ws = sheet.worksheet("player-defense")
    reception_ws = sheet.worksheet("player-reception")
    positions_ws = sheet.worksheet("player-positions")
    
    # Fetch data
    player_defense_data = defense_ws.get_all_records()
    player_reception_data = reception_ws.get_all_records()
    player_positions = positions_ws.get_all_records()
    
    # Convert to DataFrames
    df_defense = pd.DataFrame(player_defense_data)
    df_reception = pd.DataFrame(player_reception_data)
    df_positions = pd.DataFrame(player_positions)
    
    player_positions_df = pd.DataFrame(player_positions)
    df = pd.DataFrame(player_defense_data)
    df['pass-rating'] = pd.to_numeric(df['pass-rating'], errors='coerce')
    df['pass-attempt'] = pd.to_numeric(df['pass-attempt'])
    df['pass-attempt'] = df['pass-attempt'].fillna(0).astype(int)

    df['pass-error'] = pd.to_numeric(df['pass-error'])
    df['pass-error'] = df['pass-error'].fillna(0).astype(int)

    df['digs'] = pd.to_numeric(df['digs'])
    df['digs'] = df['digs'].fillna(0).astype(int)

    df['dig-error'] = pd.to_numeric(df['dig-error'])
    df['dig-error'] = df['dig-error'].fillna(0).astype(int)

    df['blocks'] = pd.to_numeric(df['blocks'])
    df['blocks'] = df['blocks'].fillna(0).astype(int)

    df['block-error'] = pd.to_numeric(df['block-error'])
    df['block-error'] = df['block-error'].fillna(0).astype(int)

    player_stats = df.groupby('player').agg(
        avg_pass_rating=('pass-rating', 'mean'),
        number_pass_attempts=('pass-attempt', 'sum')
    ).reset_index()


    passer_stats = pd.merge(player_stats, player_positions_df, on="player")
    passer_stats = passer_stats[passer_stats["passer"] == 1]

    df_player_reception = pd.DataFrame(player_reception_data)


    player_reception_stats = df_player_reception.groupby('player').agg(
        avg_pass_rating=('pass-rating', 'mean'),
        number_pass_attempts=('pass-attempt', 'sum'),
        positive_pct=('pass-2', 'mean')
    ).reset_index()


    rating_summary = df_player_reception.groupby('player').agg(
        average_pass_rating=('pass-rating', 'mean')
    ).reset_index()


    # Group by player and sum all relevant columns
    summary = df_player_reception.groupby('player').sum().reset_index()

    # Calculate positive and perfect pass counts
    summary['positive_passes'] = summary['pass-2'] + summary['pass-3']
    summary['perfect_passes'] = summary['pass-3']

    # Calculate percentages
    summary['positive_percentage'] = (summary['positive_passes'] / summary['pass-attempt']) * 100
    summary['perfect_percentage'] = (summary['perfect_passes'] / summary['pass-attempt']) * 100
    summary['error_percentage'] = (summary['pass-error'] / summary['pass-attempt']) * 100

    # Show final summary
    summary = summary[['player', 'pass-attempt', 'positive_percentage', 'perfect_percentage', "error_percentage"]]

    final_summary = pd.merge(
        summary[['player', 'pass-attempt', 'positive_percentage', 'perfect_percentage', 'error_percentage']],
        rating_summary,
        on='player'
    )

    summary = pd.merge(final_summary, player_positions_df, on="player")
    summary = summary[summary["passer"] == 1]
    summary = summary[["player", 'pass-attempt',"error_percentage", "positive_percentage", "perfect_percentage", "average_pass_rating"]]
    reception_summary = summary[summary['positive_percentage'].notna()]



    # Convert DataFrame to JSON
    data = reception_summary.to_dict(orient="records")  # Convert DataFrame rows to list of dictionaries
    with open("data/player-passing-summary.json", "w") as f:
        json.dump(data, f, indent=4)

    print("Defense data loaded and saved to player-passing-summary.json.")

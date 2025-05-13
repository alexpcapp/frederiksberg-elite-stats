
import gspread
import pandas as pd
from oauth2client.service_account import ServiceAccountCredentials
import json

def load_defense_data(creds_path="/Users/alexandercappelen/Documents/keys/frb-elite-88e4dcc7ec5c.json"):
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
    reception_data = reception_ws.get_all_records()
    player_positions = positions_ws.get_all_records()
    
    # Convert to DataFrames
    df_defense = pd.DataFrame(player_defense_data)
    df_reception = pd.DataFrame(reception_data)
    df_positions = pd.DataFrame(player_positions)
    
    player_positions_df = pd.DataFrame(player_positions.get_all_records())
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
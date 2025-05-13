# load_google_sheet.py

import gspread
import pandas as pd
from oauth2client.service_account import ServiceAccountCredentials
import json


def load_sheet(sheet_name="frb-volley-game-stats", worksheet_name="player-offense", creds_path="/Users/alexandercappelen/Documents/keys/frb-elite-88e4dcc7ec5c.json"):
    scope = [
        "https://www.googleapis.com/auth/spreadsheets.readonly", 
        "https://www.googleapis.com/auth/drive.readonly"
    ]
    creds = ServiceAccountCredentials.from_json_keyfile_name(creds_path, scope)
    client = gspread.authorize(creds)
    sheet = client.open(sheet_name).worksheet(worksheet_name)
    data = sheet.get_all_records()
    df = pd.DataFrame(data)


    df["error-pct"] = df["attack-errors"] / df["attack"]

    summary = df.groupby(['match', 'player']).agg(
        attack_attempts=('attack', 'sum'),
        total_kills=('kills', 'sum'),
        attack_errors=('attack-errors', 'sum')
    ).reset_index()

    summary["kill_pct"] = ((summary["total_kills"]) / summary["attack_attempts"] * 100).round(0)
    summary["error_pct"] = ((summary["attack_errors"]) / summary["attack_attempts"] * 100).round(0)
    summary["kill_effic"] = ((summary["total_kills"] - summary["attack_errors"]) / summary["attack_attempts"])#.round(3)
    summary = summary.dropna()
    summary["kill_pct"] = summary["kill_pct"].astype(int)
    summary["error_pct"] = summary["error_pct"].astype(int)
    summary["kill_effic"] = summary["kill_effic"].round(3)


    total_summary = df.groupby('player').agg(
        attack_attempts=('attack', 'sum'),
        total_kills=('kills', 'sum'),
        attack_errors=('attack-errors', 'sum')
    ).reset_index()

    total_summary["kill_pct"] = ((total_summary["total_kills"]) / total_summary["attack_attempts"] * 100).round(0)
    total_summary["error_pct"] = ((total_summary["attack_errors"]) / total_summary["attack_attempts"] * 100).round(0)
    total_summary["kill_effic"] = ((total_summary["total_kills"] - total_summary["attack_errors"]) / total_summary["attack_attempts"])#.round(3)
    total_summary = total_summary.dropna()
    total_summary["kill_pct"] = total_summary["kill_pct"].astype(int)
    total_summary["error_pct"] = total_summary["error_pct"].astype(int)
    total_summary["kill_effic"] = total_summary["kill_effic"].round(3)
    total_summary['match'] = "all-matches"



    summary = pd.concat([summary, total_summary], ignore_index=True)

    # Convert DataFrame to JSON
    data = summary.to_dict(orient="records")  # Convert DataFrame rows to list of dictionaries
    with open("data/test-player-offense-per-game.json", "w") as f:
        json.dump(data, f, indent=4)






    
    




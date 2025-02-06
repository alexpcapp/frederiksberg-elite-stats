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
    player_earned = client.open("frb-volley-game-stats").worksheet("player-offense")

    # Fetch all records (rows) from the sheet
    player_earned_data = player_earned.get_all_records()

    # Convert the data into a DataFrame
    df = pd.DataFrame(player_earned_data)

    df["error-pct"] = df["attack-errors"] / df["attack"]

    summary = df.groupby('player').agg(
        attack_attempts=('attack', 'sum'),
        total_kills=('kills', 'sum'),
        attack_errors=('attack-errors', 'sum')
    ).reset_index()

    summary["kill_pct"] = ((summary["total_kills"]) / summary["attack_attempts"] * 100).round(0)
    summary["error_pct"] = ((summary["attack_errors"]) / summary["attack_attempts"] * 100).round(0)
    summary["kill_effic"] = ((summary["total_kills"] - summary["attack_errors"]) / summary["attack_attempts"]).round(3)
    summary = summary.dropna()
    summary["kill_pct"] = summary["kill_pct"].astype(int)
    summary["error_pct"] = summary["error_pct"].astype(int)
    summary["kill_effic"] = summary["kill_effic"].round(3)

    # Convert DataFrame to JSON
    data = summary.to_dict(orient="records")  # Convert DataFrame rows to list of dictionaries
    with open("../player-offense-summary.json", "w") as f:
        json.dump(data, f, indent=4)

# Entry point to run the function when the script is executed directly
if __name__ == "__main__":
    fetch_and_process_data()

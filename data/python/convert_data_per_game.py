
import gspread
import pandas as pd
from oauth2client.service_account import ServiceAccountCredentials
import json

def load_data_per_game(creds_path="/Users/alexandercappelen/Documents/keys/frb-elite-88e4dcc7ec5c.json"):

    print("Loading per game data...")

    scope = [
        "https://www.googleapis.com/auth/spreadsheets.readonly", 
        "https://www.googleapis.com/auth/drive.readonly"
    ]

    creds = ServiceAccountCredentials.from_json_keyfile_name(creds_path, scope)
    client = gspread.authorize(creds)

    player_data = client.open("frb-volley-game-stats").worksheet("player-offense")

    player_data = player_data.get_all_records()

    df = pd.DataFrame(player_data)


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
    total_summary

    total_summary["kill_pct"] = ((total_summary["total_kills"]) / total_summary["attack_attempts"] * 100).round(0)
    total_summary["error_pct"] = ((total_summary["attack_errors"]) / total_summary["attack_attempts"] * 100).round(0)
    total_summary["kill_effic"] = ((total_summary["total_kills"] - total_summary["attack_errors"]) / total_summary["attack_attempts"])#.round(3)
    total_summary = total_summary.dropna()
    total_summary["kill_pct"] = total_summary["kill_pct"].astype(int)
    total_summary["error_pct"] = total_summary["error_pct"].astype(int)
    total_summary["kill_effic"] = total_summary["kill_effic"].round(3)
    total_summary['match'] = "all-matches"


    # Convert DataFrame to JSON
    data = summary.to_dict(orient="records")  # Convert DataFrame rows to list of dictionaries
    with open("data/test-player-offense-per-game.json", "w") as f:
        json.dump(data, f, indent=4)
    print("Player offense data loaded and saved to player-offense-per-game.json.")




    # Open the sheet by name
    player_defense = client.open("frb-volley-game-stats").worksheet("player-defense")
    player_positions = client.open("frb-volley-game-stats").worksheet("player-positions")
    player_reception = client.open("frb-volley-game-stats").worksheet("player-reception")


    player_defense_data = player_defense.get_all_records()
    player_reception_data = player_reception.get_all_records()


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


    df_player_reception = pd.DataFrame(player_reception_data)

    # Group by player to get player-level stats
    player_reception_stats_total = df_player_reception.groupby('player').agg(
        avg_pass_rating=('pass-rating', 'mean'),
        number_pass_attempts=('pass-attempt', 'sum'),
        positive_pct=('pass-2', 'mean')
    ).reset_index()

    player_reception_stats_total["match"] = "all-matches"


    player_reception_stats = df_player_reception.groupby(['match','player']).agg(
        avg_pass_rating=('pass-rating', 'mean'),
        number_pass_attempts=('pass-attempt', 'sum'),
        positive_pct=('pass-2', 'mean')
    ).reset_index()




    rating_summary = df_player_reception[df_player_reception["pass-attempt"] > 0]  #[["player", "pass-rating"]]


    rating_summary = rating_summary.groupby(["match", "player"]).agg(
        average_pass_rating=('pass-rating', 'mean')
    ).reset_index()
    rating_summary

    summary = df_player_reception.groupby(["match", "player"]).sum().reset_index()



    # Calculate positive and perfect pass counts
    summary['positive_passes'] = summary['pass-2'] + summary['pass-3']
    summary['perfect_passes'] = summary['pass-3']

    # Calculate percentages
    summary['positive_percentage'] = (summary['positive_passes'] / summary['pass-attempt']) * 100
    summary['perfect_percentage'] = (summary['perfect_passes'] / summary['pass-attempt']) * 100
    summary['error_percentage'] = (summary['pass-error'] / summary['pass-attempt']) * 100
    summary = summary[["match", 'player', 'pass-attempt', 'positive_percentage', 'perfect_percentage', "error_percentage"]]


    final_summary_per_game = pd.merge(
        summary[["match",'player', 'pass-attempt', 'positive_percentage', 'perfect_percentage', 'error_percentage']],
        rating_summary[["match","player","average_pass_rating"]],
        on=["match", "player"],
        how="inner"
    )



    rating_summary = df_player_reception[df_player_reception["pass-attempt"] > 0]  #[["player", "pass-rating"]]
    rating_summary = rating_summary[["player", "pass-rating"]]

    rating_summary = rating_summary.groupby(["player"]).agg(
        average_pass_rating=('pass-rating', 'mean')
    ).reset_index()

    # df der summerer modtagningstallene for den enkelte spiller for hver kampe
    summary = df_player_reception[df_player_reception["pass-attempt"] > 0]
    summary = summary[["player","pass-attempt", "pass-error", "pass-1", "pass-2", "pass-3", "overpass-in-play"]].groupby(["player"]).sum().reset_index()


    # Calculate positive and perfect pass counts
    summary['positive_passes'] = summary['pass-2'] + summary['pass-3']
    summary['perfect_passes'] = summary['pass-3']

    # Calculate percentages
    summary['positive_percentage'] = (summary['positive_passes'] / summary['pass-attempt']) * 100
    summary['perfect_percentage'] = (summary['perfect_passes'] / summary['pass-attempt']) * 100
    summary['error_percentage'] = (summary['pass-error'] / summary['pass-attempt']) * 100
    summary = summary[['player', 'pass-attempt', 'positive_percentage', 'perfect_percentage', "error_percentage"]]

    final_summary = pd.merge(
        summary[['player', 'pass-attempt', 'positive_percentage', 'perfect_percentage', 'error_percentage']],
        rating_summary[["player","average_pass_rating"]],
        on="player"
    )

    final_summary["match"] = "all-matches"
    final_summary = final_summary[["match", "player", "pass-attempt", "positive_percentage", "perfect_percentage", "error_percentage", "average_pass_rating"]]
    final_summary

    combined_pass_summary = pd.concat([final_summary, final_summary_per_game], ignore_index=True)

    combined_pass_summary = combined_pass_summary[combined_pass_summary['positive_percentage'].notna()]


    data = combined_pass_summary.to_dict(orient="records")  # Convert DataFrame rows to list of dictionaries
  
    with open("data/test-player-passing-per-game.json", "w") as f:
        json.dump(data, f, indent=4)

    print("Player reception data loaded and saved to player-reception-per-game.json.")
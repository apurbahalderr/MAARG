import pandas as pd
import numpy as np
import xgboost as xgb
from sklearn.metrics import mean_absolute_error, mean_squared_error
import joblib
import os
import json

os.makedirs('ml/data/samples', exist_ok=True)
os.makedirs('ml/models', exist_ok=True)

def generate_dataset():
    print("Generating synthetic ETA dataset...")
    np.random.seed(42)
    
    routes = [f"R{i}" for i in range(1, 4)]
    segments_per_route = 10
    
    # Time range: 3 months, 15-min intervals
    timestamps = pd.date_range("2024-01-01", "2024-03-31 23:45:00", freq="15min")
    
    segment_ids = [f"{r}_s{s}" for r in routes for s in range(segments_per_route)]
    
    # Fast multi-index creation
    df = pd.DataFrame(index=pd.MultiIndex.from_product([segment_ids, timestamps], names=['segment_id', 'timestamp'])).reset_index()
    
    df['route_id'] = df['segment_id'].apply(lambda x: x.split('_')[0])
    
    N = len(df)
    
    # Base segment distances and speeds
    seg_meta = {s: {'dist': np.random.uniform(0.5, 2.5), 'speed': np.random.uniform(30, 60), 'slope_m': np.random.uniform(0, 25), 'slope_x': np.random.uniform(0, 35)} for s in segment_ids}
    
    df['segment_distance_km'] = df['segment_id'].map(lambda x: seg_meta[x]['dist'])
    df['mappls_baseline_speed_kmph'] = df['segment_id'].map(lambda x: seg_meta[x]['speed'])
    df['mappls_baseline_eta_minutes'] = (df['segment_distance_km'] / df['mappls_baseline_speed_kmph']) * 60
    df['slope_mean'] = df['segment_id'].map(lambda x: seg_meta[x]['slope_m'])
    df['slope_max'] = df['segment_id'].map(lambda x: seg_meta[x]['slope_x'])
    
    df['hour_of_day'] = df['timestamp'].dt.hour
    df['day_of_week'] = df['timestamp'].dt.dayofweek
    df['month'] = df['timestamp'].dt.month
    
    # Weather
    df['rain_1h'] = np.clip(np.random.gamma(1, 5, N), 0, 50)
    df['rain_6h'] = df['rain_1h'] * 4 + np.random.normal(0, 2, N)
    df['rain_24h'] = df['rain_6h'] * 3 + np.random.normal(0, 5, N)
    
    df['soil_moisture_surface'] = np.clip(np.random.normal(0.3, 0.1, N) + (df['rain_24h'] / 500), 0, 1)
    df['soil_moisture_delta_24h'] = np.random.normal(0, 0.05, N)
    
    df['active_incident_count_1km'] = np.random.poisson(0.1, N)
    df['active_incident_severity_score'] = df['active_incident_count_1km'] * np.random.uniform(0.1, 1.0, N)
    
    df['disruption_risk'] = np.clip(
        0.01 * df['rain_24h'] + 0.1 * df['active_incident_severity_score'] + 0.005 * df['slope_mean'], 0, 1
    )
    
    base_delay = (
        0.5 * df['rain_1h'] + 
        0.1 * df['rain_24h'] + 
        5.0 * df['active_incident_severity_score'] + 
        10.0 * df['disruption_risk'] * (df['slope_mean'] / 10)
    )
    
    rush_hour = df['hour_of_day'].isin([8, 9, 17, 18])
    base_delay += rush_hour * 3.0
    
    df['actual_segment_travel_time_minutes'] = df['mappls_baseline_eta_minutes'] + base_delay + np.random.normal(0, 0.5, N)
    df['actual_segment_travel_time_minutes'] = np.maximum(df['actual_segment_travel_time_minutes'], df['mappls_baseline_eta_minutes'] * 0.5)
    
    df['actual_delay_minutes'] = df['actual_segment_travel_time_minutes'] - df['mappls_baseline_eta_minutes']
    
    df = df.sort_values(by=['segment_id', 'timestamp'])
    
    print("Calculating historical and recent rolling features...")
    # Fast grouped rolling operations
    gb = df.groupby('segment_id')['actual_segment_travel_time_minutes']
    
    shifted = gb.shift(1)
    df['historical_mean_travel_time_minutes'] = shifted.expanding().mean().values
    df['historical_median_travel_time_minutes'] = shifted.expanding().median().values
    
    df['recent_travel_time_15m'] = shifted
    df['recent_travel_time_30m'] = shifted.rolling(2, min_periods=1).mean().values
    df['recent_travel_time_60m'] = shifted.rolling(4, min_periods=1).mean().values
    
    # Fill NAs
    for col in ['historical_mean_travel_time_minutes', 'historical_median_travel_time_minutes', 'recent_travel_time_15m', 'recent_travel_time_30m', 'recent_travel_time_60m']:
        df[col] = df[col].fillna(df['mappls_baseline_eta_minutes'])
    
    df.to_csv('ml/data/samples/model2_eta_training.csv', index=False)
    print(f"Dataset generated with {len(df)} rows.")
    return df

def train_and_evaluate(df):
    features = [
        'segment_distance_km', 'mappls_baseline_eta_minutes', 'mappls_baseline_speed_kmph',
        'disruption_risk', 'active_incident_count_1km', 'active_incident_severity_score',
        'rain_1h', 'rain_6h', 'rain_24h', 'soil_moisture_surface', 'soil_moisture_delta_24h',
        'slope_mean', 'slope_max', 'hour_of_day', 'day_of_week', 'month',
        'historical_mean_travel_time_minutes', 'historical_median_travel_time_minutes',
        'recent_travel_time_15m', 'recent_travel_time_30m', 'recent_travel_time_60m'
    ]
    
    target = 'actual_delay_minutes'
    
    # Chronological Split
    df = df.sort_values('timestamp')
    n = len(df)
    train_end = int(n * 0.70)
    val_end = int(n * 0.85)
    
    train = df.iloc[:train_end]
    val = df.iloc[train_end:val_end]
    test = df.iloc[val_end:]
    
    print(f"Train: {len(train)}, Val: {len(val)}, Test: {len(test)}")
    
    X_train, y_train = train[features], train[target]
    X_val, y_val = val[features], val[target]
    X_test, y_test = test[features], test[target]
    
    print("\n--- BASELINES ON TEST SET ---")
    
    baseline_a_pred = np.zeros(len(test))
    mae_a = mean_absolute_error(y_test, baseline_a_pred)
    print(f"Baseline A (No-delay) MAE: {mae_a:.4f}")
    
    baseline_b_pred = np.maximum(0, test['recent_travel_time_15m'] - test['mappls_baseline_eta_minutes'])
    mae_b = mean_absolute_error(y_test, baseline_b_pred)
    print(f"Baseline B (Recent-delay) MAE: {mae_b:.4f}")
    
    baseline_c_pred = np.maximum(0, test['historical_median_travel_time_minutes'] - test['mappls_baseline_eta_minutes'])
    mae_c = mean_absolute_error(y_test, baseline_c_pred)
    print(f"Baseline C (Historical-delay) MAE: {mae_c:.4f}")
    
    print("\n--- XGBOOST REGRESSOR ---")
    model = xgb.XGBRegressor(
        n_estimators=100,
        learning_rate=0.1,
        max_depth=5,
        random_state=42
    )
    model.fit(X_train, y_train, eval_set=[(X_val, y_val)], verbose=False)
    
    xgb_pred = np.maximum(0, model.predict(X_test)) # Predict >= 0
    mae_xgb = mean_absolute_error(y_test, xgb_pred)
    rmse_xgb = np.sqrt(mean_squared_error(y_test, xgb_pred))
    
    epsilon = 1e-6
    mape_xgb = np.mean(np.abs((y_test - xgb_pred) / (y_test + epsilon))) * 100
    
    print(f"XGBoost MAE: {mae_xgb:.4f} minutes")
    print(f"XGBoost RMSE: {rmse_xgb:.4f} minutes")
    print(f"XGBoost MAPE: {mape_xgb:.4f}%")
    
    model_path = 'ml/models/eta_xgb_v1.pkl'
    joblib.dump(model, model_path)
    print(f"\nModel saved to {model_path}")
    
    schema = [
        {"field": "timestamp", "type": "datetime", "unit": "", "meaning": "Observation time", "source_synthetic": "Generated chronologically", "source_real": "Vehicle telemetry", "category": "metadata"},
        {"field": "route_id", "type": "string", "unit": "", "meaning": "Candidate route ID", "source_synthetic": "Generated", "source_real": "Mappls/MAARG", "category": "metadata"},
        {"field": "segment_id", "type": "string", "unit": "", "meaning": "Analytical segment ID", "source_synthetic": "Generated", "source_real": "MAARG segmentation", "category": "metadata"},
        {"field": "actual_segment_travel_time_minutes", "type": "float", "unit": "minutes", "meaning": "Ground truth traversal time", "source_synthetic": "Generated with noise", "source_real": "Vehicle telemetry", "category": "ground_truth"},
        {"field": "actual_delay_minutes", "type": "float", "unit": "minutes", "meaning": "Target variable (actual - baseline)", "source_synthetic": "Derived", "source_real": "Derived", "category": "target"}
    ]
    for f in features:
        schema.append({"field": f, "type": "float", "unit": "mixed", "meaning": f"Feature {f}", "source_synthetic": "Generated", "source_real": "Various (Mappls, IMERG, etc.)", "category": "feature"})
    
    with open('ml/data/samples/model2_data_dictionary.json', 'w') as f:
        json.dump(schema, f, indent=2)

if __name__ == "__main__":
    df = generate_dataset()
    train_and_evaluate(df)

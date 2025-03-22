from flask import Flask, render_template, jsonify
import sqlite3
import os
import json
from datetime import datetime, timedelta
import pytz

app = Flask(__name__)

# Database path
DB_PATH = '/data/energy_data.db'
@app.route('/api/consumption/realtime')
def realtime_consumption():
    """API endpoint for real-time consumption data"""
    try:
        # Connect to the database
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        # Get the most recent 60 records
        cursor.execute("""
            SELECT house_id, timestamp, consumption_kwh, type
            FROM energy_consumption
            ORDER BY timestamp DESC
            LIMIT 60
        """)
        
        results = cursor.fetchall()
        conn.close()
        
        # Format the data
        realtime_data = []
        german_tz = pytz.timezone('Europe/Berlin')
        
        for row in results:
            # Parse the UTC time
            utc_time = datetime.fromisoformat(row['timestamp'])
            # Convert to German time
            local_time = utc_time.replace(tzinfo=pytz.UTC).astimezone(german_tz)
            
            realtime_data.append({
                'house_id': row['house_id'],
                'timestamp': local_time.strftime('%Y-%m-%d %H:%M:%S'),
                'consumption_kwh': row['consumption_kwh'],
                'type': row['type']
            })
        
        return jsonify(realtime_data)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
@app.route('/')
def index():
    """Render the dashboard page"""
    return render_template('index.html')

@app.route('/api/consumption/hourly')
def hourly_consumption():
    """API endpoint for hourly consumption data"""
    try:
        # Connect to the database
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        # Get the last 24 hours of data
        cursor.execute("""
            SELECT hour, total_consumption, residential_consumption, commercial_consumption
            FROM hourly_aggregates
            ORDER BY hour DESC
            LIMIT 24
        """)
        
        results = cursor.fetchall()
        conn.close()
        
        # Format the data for the chart with German timezone
        chart_data = []
        german_tz = pytz.timezone('Europe/Berlin')
        
        for row in results:
            # Parse the UTC time
            utc_time = datetime.fromisoformat(row['hour'])
            # Convert to German time
            local_time = utc_time.replace(tzinfo=pytz.UTC).astimezone(german_tz)
            
            chart_data.append({
                'hour': local_time.strftime('%Y-%m-%d %H:%M:%S'),
                'total': round(row['total_consumption'], 2),
                'residential': round(row['residential_consumption'], 2),
                'commercial': round(row['commercial_consumption'], 2)
            })
        
        # Sort by hour
        chart_data.sort(key=lambda x: x['hour'])
        
        return jsonify(chart_data)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/stats/summary')
def summary_stats():
    """API endpoint for summary statistics"""
    try:
        # Connect to the database
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        # Get consumption statistics
        cursor.execute("""
            SELECT 
                COUNT(DISTINCT house_id) as total_households,
                SUM(consumption_kwh) as total_consumption,
                AVG(consumption_kwh) as avg_consumption
            FROM energy_consumption
            WHERE timestamp >= datetime('now', '-1 day')
        """)
        
        consumption_stats = cursor.fetchone()
        
        # Get type breakdown
        cursor.execute("""
            SELECT 
                type,
                COUNT(*) as count,
                SUM(consumption_kwh) as total_consumption
            FROM energy_consumption
            WHERE timestamp >= datetime('now', '-1 day')
            GROUP BY type
        """)
        
        type_stats = cursor.fetchall()
        conn.close()
        
        # Format the statistics
        stats = {
            'total_households': consumption_stats['total_households'] if consumption_stats['total_households'] else 0,
            'total_consumption': round(consumption_stats['total_consumption'] if consumption_stats['total_consumption'] else 0, 2),
            'avg_consumption': round(consumption_stats['avg_consumption'] if consumption_stats['avg_consumption'] else 0, 2),
            'type_breakdown': {
                row['type']: {
                    'count': row['count'],
                    'consumption': round(row['total_consumption'], 2)
                } for row in type_stats
            }
        }
        
        return jsonify(stats)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)

import pika
import json
import time
import os
import sqlite3
from datetime import datetime, timedelta

# RabbitMQ connection parameters
rabbitmq_host = os.getenv('RABBITMQ_HOST', 'rabbitmq')
rabbitmq_port = int(os.getenv('RABBITMQ_PORT', '5672'))
rabbitmq_user = os.getenv('RABBITMQ_USER', 'user')
rabbitmq_pass = os.getenv('RABBITMQ_PASS', 'password')

# Constants
QUEUE_NAME = 'energy_data'
DB_PATH = '/data/energy_data.db'

def setup_database():
    """Set up SQLite database to store processed data"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Create tables if they don't exist
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS energy_consumption (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        house_id INTEGER,
        timestamp TEXT,
        consumption_kwh REAL,
        type TEXT
    )
    ''')
    
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS hourly_aggregates (
        hour TEXT PRIMARY KEY,
        total_consumption REAL,
        residential_consumption REAL,
        commercial_consumption REAL,
        household_count INTEGER
    )
    ''')
    
    conn.commit()
    conn.close()
    print("Database initialized")

def process_message(ch, method, properties, body):
    """Process incoming messages from RabbitMQ"""
    try:
        # Parse the message
        data = json.loads(body)
        print(f"Processing data for house {data['house_id']}")
        
        # Store data in SQLite
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        # Insert raw data
        cursor.execute(
            "INSERT INTO energy_consumption (house_id, timestamp, consumption_kwh, type) VALUES (?, ?, ?, ?)",
            (data['house_id'], data['timestamp'], data['consumption_kwh'], data['type'])
        )
        
        # Update hourly aggregates
        hour = datetime.fromisoformat(data['timestamp']).strftime('%Y-%m-%d %H:00:00')
        
        # Check if this hour exists in aggregates
        cursor.execute("SELECT * FROM hourly_aggregates WHERE hour = ?", (hour,))
        result = cursor.fetchone()
        
        if result:
            # Update existing aggregate
            if data['type'] == 'residential':
                cursor.execute(
                    "UPDATE hourly_aggregates SET total_consumption = total_consumption + ?, residential_consumption = residential_consumption + ? WHERE hour = ?",
                    (data['consumption_kwh'], data['consumption_kwh'], hour)
                )
            else:
                cursor.execute(
                    "UPDATE hourly_aggregates SET total_consumption = total_consumption + ?, commercial_consumption = commercial_consumption + ? WHERE hour = ?",
                    (data['consumption_kwh'], data['consumption_kwh'], hour)
                )
        else:
            # Create new aggregate
            residential = data['consumption_kwh'] if data['type'] == 'residential' else 0
            commercial = data['consumption_kwh'] if data['type'] == 'commercial' else 0
            
            cursor.execute(
                "INSERT INTO hourly_aggregates (hour, total_consumption, residential_consumption, commercial_consumption, household_count) VALUES (?, ?, ?, ?, 1)",
                (hour, data['consumption_kwh'], residential, commercial)
            )
        
        conn.commit()
        conn.close()
        
        # Acknowledge the message
        ch.basic_ack(delivery_tag=method.delivery_tag)
        
    except Exception as e:
        print(f"Error processing message: {e}")
        # Negative acknowledgment - return to queue
        ch.basic_nack(delivery_tag=method.delivery_tag, requeue=True)

def main():
    # Set up the database
    setup_database()
    
    # Set up RabbitMQ connection
    while True:
        try:
            credentials = pika.PlainCredentials(rabbitmq_user, rabbitmq_pass)
            connection = pika.BlockingConnection(
                pika.ConnectionParameters(
                    host=rabbitmq_host,
                    port=rabbitmq_port,
                    credentials=credentials
                )
            )
            channel = connection.channel()
            channel.queue_declare(queue=QUEUE_NAME, durable=True)
            
            # Only fetch one message at a time
            channel.basic_qos(prefetch_count=1)
            
            # Set up consumer
            channel.basic_consume(
                queue=QUEUE_NAME,
                on_message_callback=process_message
            )
            
            print("Connected to RabbitMQ, waiting for messages...")
            channel.start_consuming()
            
        except Exception as e:
            print(f"Failed to connect to RabbitMQ: {e}")
            print("Retrying in 5 seconds...")
            time.sleep(5)

if __name__ == '__main__':
    main()

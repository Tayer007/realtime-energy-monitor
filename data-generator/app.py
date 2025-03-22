import pika
import json
import time
import random
import os
from datetime import datetime

# RabbitMQ connection parameters
rabbitmq_host = os.getenv('RABBITMQ_HOST', 'rabbitmq')
rabbitmq_port = int(os.getenv('RABBITMQ_PORT', '5672'))
rabbitmq_user = os.getenv('RABBITMQ_USER', 'user')
rabbitmq_pass = os.getenv('RABBITMQ_PASS', 'password')

# Constants
NUM_HOUSEHOLDS = 100
QUEUE_NAME = 'energy_data'

def generate_energy_data():
    """Generate random energy consumption data for simulated households"""
    timestamp = datetime.now().isoformat()
    
    data = []
    for house_id in range(1, NUM_HOUSEHOLDS + 1):
        # Generate random consumption between 0.5 and 10 kWh
        consumption = round(random.uniform(0.5, 10.0), 2)
        
        # Simulate some peak hours (higher consumption from 17:00-21:00)
        hour = datetime.now().hour
        if 17 <= hour <= 21:
            consumption *= 1.5
        
        data.append({
            'house_id': house_id,
            'timestamp': timestamp,
            'consumption_kwh': consumption,
            'type': random.choice(['residential', 'commercial'])
        })
    
    return data

def main():
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
            break
        except Exception as e:
            print(f"Failed to connect to RabbitMQ: {e}")
            print("Retrying in 5 seconds...")
            time.sleep(5)
    
    print("Connected to RabbitMQ, starting data generation...")
    
    # Generate and send data every second
    while True:
        try:
            data = generate_energy_data()
            for record in data:
                message = json.dumps(record)
                channel.basic_publish(
                    exchange='',
                    routing_key=QUEUE_NAME,
                    body=message,
                    properties=pika.BasicProperties(
                        delivery_mode=2,  # make message persistent
                    )
                )
            
            print(f"Generated and sent data for {NUM_HOUSEHOLDS} households")
            time.sleep(1)  # Generate data every second
            
        except Exception as e:
            print(f"Error: {e}")
            time.sleep(5)  # Wait before retrying
            
            # Try to reconnect
            try:
                connection = pika.BlockingConnection(
                    pika.ConnectionParameters(
                        host=rabbitmq_host,
                        port=rabbitmq_port,
                        credentials=credentials
                    )
                )
                channel = connection.channel()
            except Exception:
                pass

if __name__ == '__main__':
    main()

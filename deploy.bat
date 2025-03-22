@echo off
echo Deploying Energy Data Pipeline to Kubernetes...

REM Create persistent volume
kubectl apply -f kubernetes/persistent-volume.yaml

REM Deploy RabbitMQ
kubectl apply -f kubernetes/rabbitmq.yaml

REM Wait for RabbitMQ to be ready
echo Waiting for RabbitMQ to be ready...
timeout /t 20

REM Deploy data processor
kubectl apply -f kubernetes/processor-deployment.yaml

REM Deploy data generator
kubectl apply -f kubernetes/generator-deployment.yaml

REM Deploy dashboard
kubectl apply -f kubernetes/dashboard-deployment.yaml

echo Deployment completed!
echo Use "kubectl get pods" to check the status of the pods
echo Use "kubectl port-forward svc/dashboard 8080:80" to access the dashboard at http://localhost:8080
@echo off
echo Building and pushing Docker images...

REM Set your Docker Hub username
set DOCKER_USERNAME=fourat98

REM Build data generator
cd data-generator
docker build -t %DOCKER_USERNAME%/energy-data-generator:latest .
docker push %DOCKER_USERNAME%/energy-data-generator:latest
cd ..

REM Build data processor
cd data-processor
docker build -t %DOCKER_USERNAME%/energy-data-processor:latest .
docker push %DOCKER_USERNAME%/energy-data-processor:latest
cd ..

REM Build dashboard
cd dashboard
docker build -t %DOCKER_USERNAME%/energy-dashboard:latest .
docker push %DOCKER_USERNAME%/energy-dashboard:latest
cd ..

echo All images built and pushed successfully!
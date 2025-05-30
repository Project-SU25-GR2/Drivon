@echo off
echo Dang khoi dong cac server Drivon...

:: Start frontend  server (Spring Boot)
start cmd /k "cd frontend && npm start"

:: Wait for 2 seconds to ensure frontend starts first
timeout /t 2 /nobreak

:: Start backend server
start cmd /k "cd backend && mvn spring-boot:run"


echo Cac server dang duoc khoi dong...
echo Backend se chay tren http://localhost:8080
echo Frontend se chay tren http://localhost:3000 
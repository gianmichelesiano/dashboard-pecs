@echo on
setlocal enabledelayedexpansion

:: Rimuovi il file openapi.json se esiste
if exist openapi.json (
    del openapi.json
)

:: Vai alla directory pecs-api
cd ..\pecs-api

:: Attiva l'ambiente virtuale Python
call  .\.venv\Scripts\activate

:: Genera il file openapi.json usando Python
python -c "import app.main; import json; print(json.dumps(app.main.app.openapi()))" > ..\openapi.json

:: Torna alla directory principale
cd ..

:: Sposta il file openapi.json nella directory pecs-dashboard
move openapi.json pecs-dashboard\

:: Vai alla directory pecs-dashboard
cd pecs-dashboard

:: Genera il client API
call npm run generate-client

:: Formatta il codice generato
call npx biome format --write .\src\client

echo Client API generato con successo!
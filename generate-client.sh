#! /usr/bin/env bash

set -e
set -x

cd ../backend
python -c "import app.main; import json; print(json.dumps(app.main.app.openapi()))" > ../openapi.json
cd ..
mv openapi.json pecs-dashboard/
cd pecs-dashboard
npm run generate-client
npx biome format --write ./src/client

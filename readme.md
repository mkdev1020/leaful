
## Setup

### Configure Node
Set Node version:
```
nvm install 14
nvm use 14
```

Install dependencies:
```
npm install
```

Then, copy the config file `config.js` to the project root directory. (This
file is not tracked in git, so you'll need to get this file from another team
member.)

### Set up database
```
./scripts/init-docker-containers.sh
```

Wait about 30 seconds for the DB to boot up.

### Run
Open a new terminal tab and run:
```
nvm use 14
npm run start:dev
```

Then, to start running the unit tests, open another terminal tab and run:
```
nvm use 14
npm run test:watch
```

The tests will restart if you change a file.

## Updating database schema
1. Open `teachagogo-database.mwb` in MySQLWorkbench.
2. File -> Export -> "Forward Engineer MySQL CREATE Script..."
3. On the export options page, check the following:
  - ✅ "Omit Schema Qualifier in Object Names"
  - ✅ "Generate USE Statements"
4. On the "SQL Object Export Filter" page, select only the first option,
   which is "Export MySQL Table Objects".
5. Finish the export, overwriting the existing file.
6. Re-initialize the Docker containers to use the new schema:
   `./scripts/init-docker-containers.sh`
7. Give it about 30 seconds to set itself up.
8. Update the schema SQL file: `npm run flush-db-changes`

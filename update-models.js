
const Automate = require('sequelize-automate');

const config = require('./config');

// Database options, is the same with sequelize constructor options.
const dbOptions = {
  database: config.db.name,
  username: config.db.username,
  password: config.db.password,
  dialect: 'mysql',
  host: config.db.host,
  port: config.db.port,
  define: {
    underscored: false,
    freezeTableName: false,
    charset: 'utf8mb4',
    timezone: '+00:00',
    dialectOptions: {
      collate: 'utf8_general_ci',
    },
    timestamps: false,
  },
};

const modelDir = 'models/definitions';

// Automate options
const options = {
  type: 'js',         // Which code style want to generate, supported: js/ts/egg/midway. Default is `js`.
  camelCase: false,   // Model name camel case. Default is false.
  fileNameCamelCase: false, // Model file name camel case. Default is false.
  dir: modelDir,      // What directory to place the models. Default is `models`.
  typesDir: modelDir, // What directory to place the models' definitions (for typescript), default is the same with dir.
  emptyDir: true,     // Remove all files in `dir` and `typesDir` directories before generate models.
  tables: null,       // Use these tables, Example: ['user'], default is null.
  skipTables: null,   // Skip these tables. Example: ['user'], default is null.
  tsNoCheck: false,   // Whether add @ts-nocheck to model files, default is false.
  match: null         // RegExp to match table name
}

class AutomateFixed extends Automate {

  fixIntegerDefaultsInPlace(definitions) {
    const searchRe = /^DataTypes\.INTEGER.*/;
    for (let i = 0; i < definitions.length; i++) {
      for (const attr of Object.keys(definitions[i].attributes)) {
        const attrProperties = definitions[i].attributes[attr];
        if (!searchRe.exec(attrProperties.type)) {
          continue;
        }

        const defaultValue = attrProperties.defaultValue;
        if (attrProperties.defaultValue === null) {
          continue;
        }

        definitions[i].attributes[attr].defaultValue = parseInt(defaultValue);
      }
    }
  }

  async getDefinitions() {
    const definitions = await super.getDefinitions();

    this.fixIntegerDefaultsInPlace(definitions);

    return definitions;
  }

}

const automate = new AutomateFixed(dbOptions, options);

(async function main() {
  const code = await automate.run();
  console.log(code);
})().catch(console.error)

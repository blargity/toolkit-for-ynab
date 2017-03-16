require('colors');
const glob = require('glob');
const fs = require('fs');
const path = require('path');

const FEATURES_PROJECT_DIR = path.join('sauce', 'features');
const FEATURES_INDEX_PROJECT_PATH = path.join(FEATURES_PROJECT_DIR, 'index.js');

function run(callback) {
  glob(`${FEATURES_PROJECT_DIR}/*/**/index.js`, (error, files) => {
    if (error) return callback(error);

    let imports = [];
    let featureNames = [];

    files.forEach((filePath) => {
      // let filePathSplit = filePath.split(path.sep);
      let filePathSplit = filePath.split('/');
      console.log('filePathSplit: ' + filePathSplit + ', length: ' + filePathSplit.length + ', path.sep:' + path.sep);
      let projectFeaturePath = filePathSplit.slice(0, filePathSplit.length - 1).join(path.sep);
      // let projectFeaturePath = path.join(filePath, '..');
      console.log('filePath: ' + filePath + ', projectFeaturePath: ' + projectFeaturePath);
      // up one directory to use the project path
      // let featureSetting = require(`../${projectFeaturePath}/settings.js`); // eslint-disable-line global-require
      let featureSetting = require(path.join('..', projectFeaturePath, 'settings.js')); // eslint-disable-line global-require
      console.log('featureSetting: ' + featureSetting);

      // features/index will source from the features folder, so remove
      // `sauce/features` from the path here.
      let featureIndexPath = filePathSplit.slice(2, filePathSplit.length - 1).join('/');
      console.log('featureIndexPath: ' + featureIndexPath);

      let importLine = `import ${featureSetting.name} from './${featureIndexPath}';\n`;
      imports.push(importLine);
      featureNames.push(featureSetting.name);
    });

    writeFeatureIndex(imports, featureNames, callback);
  });
}

function writeFeatureIndex(importLines, featureNames, callback) {
  let importLinesString = '';
  importLines.forEach(line => {
    importLinesString += line;
  });

  let featureNamesString = '';
  featureNames.forEach((featureName, index) => {
    featureNamesString += featureName + (index !== featureNames.length - 1 ? ',\n  ' : '');
  });

  const fileContents = `/*
 ***********************************************************
 * Warning: This is a file generated by the build process. *
 *                                                         *
 * Any changes you make manually will be overwritten       *
 * the next time you run webpack!                          *
 ***********************************************************
*/
${importLinesString}
const features = [
  ${featureNamesString}
];

export default features;
`;

  let featureIndexPath = path.join(__dirname, '..', FEATURES_INDEX_PROJECT_PATH);
  fs.writeFile(featureIndexPath, fileContents, callback);
}

run(error => {
  if (error) {
    console.log(`Error: ${error}`.red);
    process.exit(1);
  }

  process.exit();
});

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
      const filePathSplit = filePath.split('/');
      const projectFeaturePath = filePathSplit.slice(0, filePathSplit.length - 1).join(path.sep);

      // up one directory to use the project path
      const featureSetting = require(path.join('..', projectFeaturePath, 'settings.js')); // eslint-disable-line global-require

      // features/index will source from the features folder, so remove
      // `sauce/features` from the path here.
      const featureIndexPath = filePathSplit.slice(2, filePathSplit.length - 1).join(path.sep);
      const importLine = `import ${featureSetting.name} from './${featureIndexPath}';\n`;
      imports.push(importLine);
      featureNames.push(featureSetting.name);
    });

    writeFeatureIndex(imports, featureNames, callback);
  });
}

function writeFeatureIndex(importLines, featureNames, callback) {
  const fileContents = `/*
 ***********************************************************
 * Warning: This is a file generated by the build process. *
 *                                                         *
 * Any changes you make manually will be overwritten       *
 * the next time you run webpack!                          *
 ***********************************************************
*/
${importLines.join('')}
const features = [
  ${featureNames.join('\n ')}
];

export default features;
`;

  const featureIndexPath = path.join(__dirname, '..', FEATURES_INDEX_PROJECT_PATH);
  fs.writeFile(featureIndexPath, fileContents, callback);
}

run(error => {
  if (error) {
    console.log(`Error: ${error}`.red);
    process.exit(1);
  }

  process.exit();
});

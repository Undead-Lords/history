const fs = require('fs');
const path = require('path');

const uniqueIds = new Set();

function generateUniqueId() {
  let result;
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  do {
    result = '';
    for (let i = 0; i < 10; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
  } while (uniqueIds.has(result));

  uniqueIds.add(result);
  return result;
}

function collectIds(filePath) {
  const data = fs.readFileSync(filePath, 'utf-8');
  let jsonObject;
  try {
    jsonObject = JSON.parse(data);
  } catch (e) {
    console.error(`Error parsing JSON file: ${filePath}: ${e}`);
    return;
  }

  if (jsonObject.hasOwnProperty('id')) {
    uniqueIds.add(jsonObject.id);
  }
}

function updateJsonFile(filePath) {
  const data = fs.readFileSync(filePath, 'utf-8');
  let jsonObject;
  try {
    jsonObject = JSON.parse(data);
  } catch (e) {
    console.error(`Error parsing JSON file: ${filePath}: ${e}`);
    return;
  }

  if (!jsonObject.hasOwnProperty('id')) {
    jsonObject.id = generateUniqueId();
    fs.writeFileSync(filePath, JSON.stringify(jsonObject, null, 2));
  }
}

function traverseDirectory(directoryPath, callback) {
  const items = fs.readdirSync(directoryPath, { withFileTypes: true });
  items.forEach((item) => {
    const fullPath = path.join(directoryPath, item.name);
    if (item.isDirectory()) {
      traverseDirectory(fullPath, callback);
    } else if (item.isFile() && path.extname(fullPath) === '.json') {
      callback(fullPath);
    }
  });
}

const rootFolder = './events'; // The root folder of the repository

// Collect existing IDs
traverseDirectory(rootFolder, collectIds);

// Update JSON files with missing IDs
traverseDirectory(rootFolder, updateJsonFile);
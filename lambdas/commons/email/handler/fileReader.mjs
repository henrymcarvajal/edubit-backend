import * as fs from 'node:fs';

export const readFile = async (path) => {

  return await new Promise((resolve, reject) => {
    fs.readFile(path, { encoding: 'utf-8' }, (error, contents) => {
      if (error) {
        console.log('readFile', `error reading file contents ${path}`, error);
        reject(error);
      }
      resolve(contents);
    });
  });
};
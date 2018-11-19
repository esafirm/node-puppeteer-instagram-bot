let PouchDB = require('pouchdb');

let db = new PouchDB('follows');
let db_archive = new PouchDB('followsArchive');

let addFollow = async function(username) {
  return db.put(
    { _id: username, added: new Date().getTime() },
    { force: true }
  );
};

let getFollows = async function() {
  return db.allDocs({ include_docs: true });
};

let unFollow = async function(username) {
  return new Promise(function(resolve, reject) {
    db.get(username)
      .then(doc => {
        return db.remove(doc);
      })
      .then(() => {
        return db_archive.put({ _id: username });
      })
      .then(() => {
        resolve(true);
      })
      .catch(e => reject(e));
  });
};

let inArchive = async function(username) {
  return db_archive.get(username);
};

let getArchives = async () => {
  return db_archive.allDocs({ include_docs: true });
};

exports.addFollow = addFollow;
exports.getFollows = getFollows;
exports.unFollow = unFollow;
exports.inArchive = inArchive;
exports.getArchives = getArchives;

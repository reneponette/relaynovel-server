module.exports = function (db) {
    return db.define('novel', {
        title : String
    });
};
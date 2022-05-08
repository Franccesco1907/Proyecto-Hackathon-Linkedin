module.exports = function (app) {
    app.use('/', require('../controllers/app/main'));
};
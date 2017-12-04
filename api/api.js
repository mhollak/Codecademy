const express = require('express');
const apiRouter = express.Router();

const menusRouter = require('./menus.js');
const employeesRouter = require('./employees.js');
// const timesheetsRouter = require('./timesheets.js');

apiRouter.use('/menus', menusRouter);
apiRouter.use('/employees', employeesRouter);
// apiRouter.use('/timesheets', timesheetsRouter);

module.exports = apiRouter;

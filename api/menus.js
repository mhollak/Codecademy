const express = require('express');
const menusRouter = express.Router();

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

const menuItemRouter = require('./menu-items.js');

menusRouter.param('menuId', (req, res, next, menuId) => {
  const sql = 'SELECT * FROM Menu WHERE Menu.id = $menuId';
  const values = {$menuId: menuId};
  db.get(sql, values, (error, menu) => {
    if (error) {
      next(error);
    } else if (menu) {
      req.menu = menu;
      next();
    } else {
      res.sendStatus(404);
    }
  });
});

menusRouter.use('/:menuId/menu-items', menuItemRouter);

// How to check if menu item id exists?
menusRouter.delete('/:menuId', (req, res, send) => {
  const menuItemSql = 'SELECT * FROM MenuItem WHERE MenuItem.menu_id = $menuId';
  const menuItemValues = {$menuId: req.params.menuId};

  db.get(menuItemSql, menuItemValues, (error, menuItem) => {
    if (error) {
      next(error);
    } else if (menuItem) {
      res.sendStatus(400);
    } else {
      const sql = 'DELETE FROM Menu WHERE Menu.id = $menuId';
      const values = {$menuId: req.params.menuId};

      db.run(sql, values, (error) => {
          if (error) {
            next(error);
          } else {
            res.status(204).send();
          }
        });
      }
    });
});

menusRouter.put('/:menuId', (req, res, send) => {
  const title = req.body.menu.title;

  if (!title) {
    return res.status(400).send();
  }
  const sql = 'UPDATE Menu SET title = $title WHERE Menu.id = $menuId';

  const values = {
      $title: title,
      $menuId: req.params.menuId
  };

  db.run(sql, values, function(error) {
    if (error) {
      next(error);
    } else {
      db.get(`SELECT * FROM Menu WHERE Menu.id = ${req.params.menuId}`, (error, menu) => {
        res.status(200).send({menu: menu});
      });
    }
  });
});

menusRouter.get('/:menuId', (req, res, send) => {
  res.status(200).send({menu: req.menu});
});

menusRouter.post('/', (req, res, send) => {
  const title = req.body.menu.title;

  if(!title) {
    return res.status(400).send();
  }

  const sql = 'INSERT INTO Menu (title) VALUES ($title)';
  const values = {
    $title: title
  };

  db.run(sql, values, function(error) {
    if (error) {
      next(error);
    } else {
      db.get(`SELECT * FROM Menu WHERE Menu.id = ${this.lastID}`, (error, menu) => {
        res.status(201).send({menu: menu});
      });
    }
  });
});

menusRouter.get('/', (req, res, send) => {
  db.all('SELECT * FROM Menu', (err, menus) => {
    if (err) {
      next(err);
    } else {
      res.status(200).send({menus: menus});
    }
  });
});

module.exports = menusRouter;

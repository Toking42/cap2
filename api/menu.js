const express = require('express');
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');


const menuRouter = express.Router();
const menuitemRouter =require('./menuitem');

const { getQueryAllFromTable,
        getQueryAllFromTableByFieldValue,
        getQueryItemFromTable,
        deleteItemFromTable} = require('./../sql');

const tableName = 'Menu';
const DEBUG = true;;


menuRouter.use('/:menuId/menu-items', menuitemRouter);

menuRouter.param('menuId' , function (req, res, next, id) {
  let query = getQueryItemFromTable(tableName, id);

  db.get(query, (err, row) => {
    if(err) {
      next(error);
    } else if (row) {
      req.menu = row;
      req.menuId = id;
      next();
    } else {
      res.status(404).send('Menu not found');
    }
  })


})


menuRouter.get('/', (req, res, next) => {
  db.all(getQueryAllFromTable(tableName), function (err, rows) {
        if(err) {
          next(err);
        } else {
          res.status(200).json({menus: rows});
        }
      });
})

// Insert
menuRouter.post('/', (req, res, next) => {
  let newItem =req.body.menu;
  if(!isValidMenu(newItem)) {
    return res.status(400).send('Wrong params');
  }
  db.run("INSERT into Menu (title) VALUES ($title);",
  {$title : newItem.title}, function (err) {
      if(err) next(err);
      else {
        db.get("SELECT * FROM Menu where id = $id",{$id:this.lastID}, (err, row) => {
          if(err) next(err);
          else if(row) res.status(201).send({menu:row});
          else return res.status(404).send('Menu not found');
        })
      }
    }
  );

})


menuRouter.get('/:menuId', (req, res, next) => {
  res.status(200).send({menu:req.menu});
})

// Udate menu
menuRouter.put('/:menuId', (req, res, next) => {
  if(!isValidMenu(req.body.menu)) {
    return res.status(400).send('Wrong params');
  } else {
    let newItem = req.body.menu;
    db.run("UPDATE Menu set title = $title WHERE id = $id;",
    {
      $id:req.menuId,
      $title : newItem.title
    }, function (err) {
        if(err) console.log(err);
        else {
          db.get("SELECT * FROM Menu where id = $id",{$id:req.menuId}, (err, row) => {
            if(err) next(err);
            else if(row) {
              res.status(200).json({menu:row});
            } else return res.status(404).send('Menu not found');
          })
        }
      }
    )}

});

// Delete only if no MenuItems are present
menuRouter.delete('/:menuId', (req, res, next) => {
  db.all(getQueryAllFromTableByFieldValue('MenuItem','menu_id',req.params.menuId),
    (err, rows) => {
    if (err) {
      next(err);}
    else if(rows && rows.length > 0) {
      return res.status(400).send();
    } else {
      db.run(deleteItemFromTable(tableName, req.params.menuId),
        function (err) {
            if(err) next(err);
            else res.status(204).send();
      });
    }
  });
});


const isValidMenu = (newItem) => {
  if(newItem.title === undefined) return false;
  return true;
}




module.exports = menuRouter;

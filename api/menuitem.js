const express = require('express');
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');


const menuItemRouter = express.Router({mergeParams:true});

const { getQueryAllFromTable,
        getQueryAllFromTableByFieldValue,
        getQueryItemFromTable,
        deleteItemFromTable} = require('./../sql');

const tableName = 'MenuItem';
const DEBUG = true;;



menuItemRouter.param('menuItemId' , function (req, res, next, id) {
  let query = getQueryItemFromTable(tableName, id);

  db.get(query, (err, row) => {
    if(err) {
      next(error);
    } else if (row) {
      req.menuItem = row;
      req.menuItemId = id;
      next();
    } else {
      res.status(404).send('MenuItem not found');
    }
  })


})


menuItemRouter.get('/', (req, res, next) => {
  db.all(getQueryAllFromTableByFieldValue(tableName,'menu_id', req.menuId), function (err, rows) {
        if(err) {
          next(err);
        } else {
          res.status(200).json({menuItems: rows});
        }
      });
})

// Insert
menuItemRouter.post('/', (req, res, next) => {
  let newItem =req.body.menuItem;

  if(!isValidMenuItem(newItem)) {
    console.log("not valid");
    return res.status(400).send('Wrong params');
  }

  db.run("INSERT into MenuItem (name, description, inventory, price, menu_id)"+
  " VALUES ($name, $description, $inventory, $price, $menuId);",
  {
    $name : newItem.name,
    $price : newItem.price,
    $description : newItem.description,
    $inventory : newItem.inventory,
    $menuId : req.menuId
  }, function (err) {
      if(err) console.log(err);
      else {
        db.get("SELECT * FROM MenuItem where id = $id",{$id:this.lastID}, (err, row) => {
          if(err) next(err);
          else if(row) res.status(201).send({menuItem:row});
          else return res.status(404).send('MenuItem not found');
        })
      }
    }
  );

})


menuItemRouter.get('/:menuItemId', (req, res, next) => {
  res.status(200).send({menuItem:req.menuItem});
})

// Udate menuItem
menuItemRouter.put('/:menuItemId', (req, res, next) => {
  if(!isValidMenuItem(req.body.menuItem)) {
    return res.status(400).send('Wrong params');
  } else {
    let newItem = req.body.menuItem;

    db.run("UPDATE MenuItem set name  = $name, price = $price, inventory = $inventory, description = $description WHERE id = $id;",
    {
      $id:req.menuItemId,
      $name : newItem.name,
      $price : newItem.price,
      $description : newItem.description,
      $inventory : newItem.inventory,
  }, function (err) {
        if(err) console.log(err);
        else {
          db.get("SELECT * FROM MenuItem where id = $id",{$id:req.menuItemId}, (err, row) => {
            if(err) next(err);
            else if(row) {
              res.status(200).json({menuItem:row});
            } else return res.status(404).send('MenuItem not found');
          })
        }
      }
    )}

});

menuItemRouter.delete('/:menuItemId', (req, res, next) => {
    db.run(deleteItemFromTable(tableName, req.params.menuItemId),
      function (err) {
          if(err) next(err);
          else res.status(204).send();
    });
});


const isValidMenuItem = (newItem) => {
  if(newItem.name === undefined) return false;
  if(newItem.inventory === undefined || isNaN(newItem.inventory)) return false;
  if(newItem.price === undefined || isNaN(newItem.price)) return false;

  return true;
}




module.exports = menuItemRouter;

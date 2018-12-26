const express = require('express');
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

const timesheetRouter =require('./timesheet');

const employeeRouter = express.Router();

const { getQueryAllFromTable,
        getQueryAllFromTableByFieldValue,
        getQueryItemFromTable,
        deleteItemFromTable} = require('./../sql');

const tableName = 'Employee';
const DEBUG = true;;


employeeRouter.use('/:employeeId/timesheets', timesheetRouter)

employeeRouter.param('employeeId' , function (req, res, next, id) {
  let query = getQueryItemFromTable(tableName, id);

  db.get(query, (err, row) => {
    if(err) {
      next(error);
    } else if (row) {
      req.employee = row;
      req.employeeId = id;
      next();
    } else {
      res.status(404).send('Employee not found');
    }
  })


})


employeeRouter.get('/', (req, res, next) => {
  db.all(getQueryAllFromTableByFieldValue(tableName,'is_current_employee',1), function (err, rows) {
        if(err) {
          next(err);
        } else {
          res.status(200).json({employees: rows});
        }
      });
})

// Insert
employeeRouter.post('/', (req, res, next) => {
  let newItem =req.body.employee;
  newItem.isCurrentEmployee = 1;

  if(!isValidEmployee(newItem, req)) {
    return res.status(400).send('Wrong params');
  }

  db.run("INSERT into Employee (name, position, wage, is_current_employee) VALUES ($name, $position, $wage, $isCurrentEmployee);",
  {
    $name : newItem.name,
    $position: newItem.position,
    $wage: newItem.wage,
    $isCurrentEmployee: newItem.isCurrentEmployee

  }, function (err) {
      if(err) console.log(err);
      else {
        db.get("SELECT * FROM Employee where id = $id",{$id:this.lastID}, (err, row) => {
          if(err) next(err);
          else if(row) res.status(201).send({employee:row});
          else return res.status(404).send('Employee not found');
        })
      }
    }
  );

})


employeeRouter.get('/:employeeId', (req, res, next) => {
  res.status(200).send({employee:req.employee});
})

// Udate employee
employeeRouter.put('/:employeeId', (req, res, next) => {
  if(!isValidEmployee(req.body.employee)) {
    return res.status(400).send('Wrong params');
  } else {
    let newItem = req.body.employee;
    db.run("UPDATE Employee set name = $name , position = $position, wage =$wage WHERE id = $id;",
    {
      $id:req.employeeId,
      $name : newItem.name,
      $position: newItem.position,
      $wage: newItem.wage

    }, function (err) {
        if(err) console.log(err);
        else {
          db.get("SELECT * FROM Employee where id = $id",{$id:req.employeeId}, (err, row) => {
            if(err) next(err);
            else if(row) {
              res.status(200).json({employee:row});
            } else return res.status(404).send('Employee not found');
          })
        }
      }
    )}

});

employeeRouter.delete('/:employeeId', (req, res, next) => {
    db.run("UPDATE Employee set is_current_employee = 0 WHERE id = $id;",
    {$id:req.employeeId}, function (err) {
        if(err) nexts(err);
        else {
          db.get("SELECT * FROM Employee where id = $id",{$id:req.employeeId}, (err, row) => {
            if(err) next(err);
            else if(row) {
              res.status(200).json({employee:row});
            } else return res.status(404).send('Employee not found');
          })
        }
      });
  });


const isValidEmployee = (newItem, req) => {
  if(newItem.name === undefined) return false;
  if(newItem.position === undefined) return false;
  if(newItem.wage === undefined)  if(newItem.isCurrentEmployee === undefined) return false;
  return true;
}




module.exports = employeeRouter;

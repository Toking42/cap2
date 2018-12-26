const express = require('express');
const sqlite3 = require('sqlite3');

const timesheetRouter = express.Router({mergeParams:true});
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');


const { getQueryAllFromTable,
        getQueryAllFromTableByFieldValue,
        getQueryItemFromTable,
        deleteItemFromTable} = require('./../sql');

const tableName = 'Timesheet';
const DEBUG = true;;



timesheetRouter.param('timesheetId' , function (req, res, next, id) {
  let query = getQueryItemFromTable(tableName, id);

  db.get(query, (err, row) => {
    if(err) {
          next(err);
    } else if(row) {
      req.timesheet = row;
      req.timesheetId = id;
      next();
    } else {
      res.sendStatus(404);
    }
  });
});


timesheetRouter.get('/', (req, res, next) => {
  db.all(getQueryAllFromTableByFieldValue(tableName, 'employee_id' ,req.params.employeeId), (err, rows) => {
    if(err) next(err);
    else if (rows) res.status(200).json({timesheets:rows});
    else res.status(200).json({timesheets:[]});
  });
})
// Insert
timesheetRouter.post('/', (req, res, next) => {
  let newItem =req.body.timesheet;
  newItem['employeeId'] =  req.employeeId;
  if(!isValidItem(newItem)) {
    return res.status(400).send('Wrong params');
  }

  db.run("INSERT into Timesheet ( hours, rate, date, employee_Id) "+
  "VALUES ($hours, $rate, $date, $employeeId);",
  {
    $hours: newItem.hours,
    $rate: newItem.rate,
    $date: newItem.date,
    $employeeId: newItem.employeeId
  }, function (err) {
      if(err) console.log(err);
      else {
        db.get("SELECT * FROM Timesheet where id = $id",{$id:this.lastID}, (err, row) => {
          if(row) res.status(201).send({timesheet:row});
          else res.sendStatus(404);
        })
      }
    }
  );

})


timesheetRouter.get('/:timesheetId', (req, res, next) => {
  res.status(200).send({timesheets:req.timesheet});
})

timesheetRouter.put('/:timesheetId', (req, res, next) => {
  let newItem = req.body.timesheet;
  newItem['employeeId'] = req.params.employeeId;
  if(!isValidItem(newItem)) {
    return res.status(400).send('Wrong params');
  } else {
    db.run('UPDATE Timesheet SET hours = $hours, rate = $rate, ' +
        ' date = $date' +
        ' WHERE Timesheet.id = $timesheetId',
    {
      $hours: newItem.hours,
      $rate: newItem.rate,
      $date: newItem.date,
      $timesheetId: req.params.timesheetId
    }, function (err) {
        if(err) console.log(err);
        else {
          db.get("SELECT * FROM Timesheet where id = $id",{$id:req.params.timesheetId}, (err, row) => {
            if(err) next(err);
            else if(row) {
              res.status(200).json({timesheet:row});
            } else return res.status(404).send('Series not found');
          })
        }
      }
    )}

});


timesheetRouter.delete('/:timesheetId', (req, res, next) => {
    db.run("DELETE FROM Timesheet WHERE id = $id;",
      {$id:req.params.timesheetId}, function (err) {
          if(err) next(err);
          else res.status(204).send();
        });
    });



const isValidItem = (newItem) => {
  if(newItem.hours === undefined) return false;
  if(newItem.date === undefined) return false;
  if(newItem.rate === undefined) return false;
  if(newItem.employeeId === undefined) return false;
  return true;
}





module.exports = timesheetRouter;

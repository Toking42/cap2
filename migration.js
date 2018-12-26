const sqlite3 = require('sqlite3');

const dbfile =process.env.TEST_DATABASE || './database.sqlite';

const db = new sqlite3.Database(dbfile);

db.serialize(function() {
  db.run('CREATE TABLE IF NOT EXISTS Employee ( ' +
           'id INTEGER PRIMARY KEY AUTOINCREMENT, ' +
           'name TEXT NOT NULL, ' +
           'position TEXT NOT NULL, ' +
           'wage INTEGER NOT NULL, ' +
           'is_current_employee INTEGER NOT NULL DEFAULT 1 ' +
           ')');
   db.run('CREATE TABLE IF NOT EXISTS Timesheet ( ' +
            'id INTEGER PRIMARY KEY AUTOINCREMENT, ' +
            'employee_id INTEGER NOT NULL REFERENCES Employee(id),' +
            'hours INTEGER NOT NULL, ' +
            'rate  INTEGER NOT NULL, ' +
            'date  INTEGER NOT NULL ' +
            ')');

  db.run('CREATE TABLE IF NOT EXISTS Menu ( ' +
             'id INTEGER PRIMARY KEY AUTOINCREMENT, ' +
             'title TEXT NOT NULL' +
             ')');

   db.run('CREATE TABLE IF NOT EXISTS MenuItem ( ' +
            'id INTEGER PRIMARY KEY AUTOINCREMENT, ' +
            'menu_id INTEGER NOT NULL REFERENCES Menu(id),' +
            'inventory INTEGER NOT NULL, ' +
            'price  INTEGER NOT NULL, ' +
            'name TEXT NOT NULL,' +

            'description TEXT ' +
            ')');
});

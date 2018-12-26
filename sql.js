
const DEBUG  = true;

const getQueryAllFromTable = (table) => {
    return "SELECT * FROM "+table+";";
}

const getQueryAllFromTableByFieldValue = (table, field, value) => {
    return "SELECT * FROM "+table+" WHERE "+field+"="+value+";";
}

const getQueryItemFromTable = function (table, id) {
    return "SELECT * FROM "+table+" WHERE id = "+id+";";
}

const deleteItemFromTable = function (table, id) {
    return "DELETE FROM "+table+" WHERE id = "+id+";";
}


module.exports = {
  getQueryAllFromTable,
  getQueryAllFromTableByFieldValue,
  getQueryItemFromTable,
  deleteItemFromTable
};

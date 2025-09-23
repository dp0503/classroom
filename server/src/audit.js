const {add}=require('./datastore');
function log(action,performed_by,details){
  add('auditLogs',{action,performed_by,details,created_at:new Date().toISOString()});
}
module.exports={log};


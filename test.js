const db = require('./models')
const TokenValidator = require('./src/tokenValidator');
const taskController = require('./controller/tasks');

taskController.like(1).then((data)=>{
  console.log(data);
  process.exit(1);
})


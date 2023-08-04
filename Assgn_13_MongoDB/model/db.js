const mongoose = require('mongoose');
const db = 'tododb'

module.exports.init = async function(){

    await mongoose.connect(`mongodb://127.0.0.1:27017/${db}`)
  
}

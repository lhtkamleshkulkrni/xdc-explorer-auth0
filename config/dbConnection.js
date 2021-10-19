import Config from '.'

import mongoose from 'mongoose'

import fs from "fs"



export default class DBConnection {

static connect () {

//returning true, as we are not using any DB connection for users in this project

console.log('DB trying to connect on ' + new Date() + ' to url' + Config.DB)

const options = {

keepAlive: 1,

poolSize: 10,

retryWrites: false,

ssl: true,

sslValidate: false,

useNewUrlParser: true,

useCreateIndex: true,

useUnifiedTopology: true,

sslCA: [fs.readFileSync("./xinfin-rds-combined-ca-bundle.pem")]

}
return mongoose.connect(Config.DB, options)
}
}
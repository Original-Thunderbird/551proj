const firebase = require('firebase/app')
const mySQLApp = require('mysql')

const firebaseConfig = {
    apiKey: "AIzaSyDslr5vIL3zU9aUf2sYopP-lsmzkAcJrBo",
    authDomain: "dsci551-85451.firebaseapp.com",
    databaseURL: "https://dsci551-85451-default-rtdb.firebaseio.com",
    projectId: "dsci551-85451",
    storageBucket: "dsci551-85451.appspot.com",
    messagingSenderId: "413318604891",
    appId: "1:413318604891:web:fab9aeb0b27f7e020cb77e",
    measurementId: "G-6P3LJQ53SD"
};

// Initialize Firebase
fbApp = firebase.initializeApp(firebaseConfig);

const sqlDB = mySQLApp.createConnection({
    user: 'root',
    host: 'localhost',
    password: 'Zzh12345',
    database: 'playground'
})

const sqlDBB = mySQLApp.createConnection({
  user: 'admin',
  host: 'localhost',
  password: '123456',
  database: 'DSCI551'
})

srcDB = 'MySQL';

//exports.sqlDB = sqlDBB
exports.sqlDB = sqlDB
exports.fbApp = this.fbApp
exports.srcDB = this.srcDB
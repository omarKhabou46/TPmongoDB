const { MongoClient } = require("mongodb");
require("dotenv").config();

const urlConnection = process.env.MongoDBConnectionString;
const dbName = process.env.MongoDBDatabaseName;
const client = new MongoClient(urlConnection);
let db;


const connectDB = async () => {
    if (db) return db;
  try {
    await client.connect();
    db = client.db(dbName);
    console.log("connected to mongodb");
    return db;
  } catch (error) {
    console.log("error connecting database");
  }
};

const logout = async () => {
    await client.close();
}

module.exports = {connectDB, logout}

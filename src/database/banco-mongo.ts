import { MongoClient } from 'mongodb';

const client = new MongoClient(process.env.MONGO_URI!);

let db: any;

export async function connectMongo() {
  await client.connect();
  db = client.db(process.env.MONGO_DB);
  console.log("MongoDB conectado");
}

export { db };
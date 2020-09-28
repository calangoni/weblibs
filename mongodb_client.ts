import { MongoClient, FilterQuery, Collection } from 'mongodb';
import * as configs from '../configs.json';
 
let client_p: Promise<MongoClient> = null;

export async function close () {
  if (client_p) {
    const client = await client_p;
    client.close();
    client_p = null;
  }
}

export async function getDb (dbName: string) {
  if (!client_p) {
    client_p = connect();
  }
  const client = await client_p;
  return client.db(dbName);
}

export function connect () {
  return MongoClient.connect(configs.mongodb.url);
}

export async function querySingle<T> (col: Collection<T>, query?: FilterQuery<T>): Promise<T> {
  try {
    const rows = await col.find(query).toArray();
    if (rows.length === 1) return Promise.resolve(rows[0])
    if (rows.length === 0) return Promise.resolve(null)
    return Promise.reject(Error('Invalid database result count!').HttpStatus(500))
  } catch (err) {
    return Promise.reject(err)
  }
}

// async function example () {
//   try {
//     const exsis = await getDb('exsis');
//     const mdb = {
//       docscol: exsis.collection<{ a: number, b?: number }>('docscol'),
//     };
//     const r1 = await mdb.docscol.insertMany([{a : 1}, {a : 2}, {a : 3}]);
//     console.log(r1);
//     const r2 = await mdb.docscol.updateOne({a : 2}, { $set: {b : 1} });
//     console.log(r2);
//     const r3 = await mdb.docscol.find({a : 2}).toArray();
//     console.log(r3);
//     const r4 = await mdb.docscol.deleteOne({a : 3});
//     console.log(r4);
//   } catch (err) { console.error(err); }
// }

import { Collection } from 'mongodb';
import { getDb, querySingle } from './mongoClient';
import * as configs from '../configs.json';

const mdb = {
  users: {
    col: null as Collection<{ userId: string, pw: string }>,
    async _init () {
      if (!(await mdb.users.col.indexExists('unique_userId'))) {
        await mdb.users.col.createIndex({ userId: 1 }, { unique: true, name: 'unique_userId' })
      }
    },
    insert (qPars: { userId: string, pw: string }) { return mdb.users.col.insertOne(qPars) },
    async selectOne (qPars: { userId: string }) { return querySingle(mdb.users.col, qPars) },
  }
}

export async function init () {
  const db = await getDb(configs.mongodb.dbname);
  const existingCols = (await db.collections()).map(x => x.collectionName);
  for (const [colName, colInfo] of Object.entries(mdb)) {
    colInfo.col = db.collection(colName);
    if (!existingCols.includes(colName)) {
      await db.createCollection(colName);
    }
    await colInfo._init();
  }
}

export default mdb;

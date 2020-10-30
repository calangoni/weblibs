import { Collection } from 'mongodb';
import { getDb, querySingle } from './mongodbClient';
import * as configs from '../configs.json';

const mdb = {
  users: {
    col: null as Collection<{ userId: string, pw: string }>,
    async _init () {
      if (!(await this.col.indexExists('unique_userId'))) {
        await this.col.createIndex({ userId: 1 }, { unique: true, name: 'unique_userId' })
      }
    },
    insert (qPars: { userId: string, pw: string }) { return this.col.insertOne(qPars) },
    async selectOne (qPars: { userId: string }) { return querySingle(this.col, qPars) },
  }
}

export async function init () {
  const db = await getDb(configs.mongodb.dbname);
  const existingCols = (await db.collections()).map(x => x.collectionName);
  for (const [colName, colInfo] of Object.entries(mdb)) {
    colInfo.col = db.collection(colName) as Collection<any>;
    if (!existingCols.includes(colName)) {
      await db.createCollection(colName);
    }
    await colInfo._init();
  }
}

export default mdb;

import { Collection, Db } from 'mongodb';
import { getDb, querySingle } from './mongoClient';
import * as configs from '../configs.json';

const mdb = {
  db: null as Db,
  cols: {
    users: null as Collection<{ userId: string, pw: string }>,
  },

  async _init () {
    mdb.db = await getDb(configs.mongodb.dbname);
    const existingCols = (await mdb.db.collections()).map(x => x.collectionName);
    for (const colName of Object.keys(mdb.cols)) {
      if (!existingCols.includes(colName)) {
        await mdb.db.createCollection(colName);
      }
    }
    mdb.cols.users = mdb.db.collection('users');
    await mdb.users._init();
  },

  users: {
    async _init () {
      if (!(await mdb.cols.users.indexExists('unique_userId'))) {
        await mdb.cols.users.createIndex({ userId: 1 }, { unique: true, name: 'unique_userId' })
      }
    },
    insert (qPars: { userId: string, pw: string }) { return mdb.cols.users.insertOne(qPars) },
    async selectOne (qPars: { userId: string }) { return querySingle(mdb.cols.users, qPars) },
  },
}

export default mdb

import { MongoClient, Collection } from 'mongodb'
import { ReadWriteDb } from '../types'

const FIND_IN_BATCHES_LIMIT = 500

export function mongoDatabase(url: string): ReadWriteDb<Collection, any> {
  const client = new MongoClient(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })

  const findInBatches = (collection: Collection) => (query: any = {}) => ({
    async *[Symbol.asyncIterator]() {
      let placeQuery = {}
      let done = false

      while (!done) {
        const results = await collection
          .aggregate()
          .sort({ _id: 1 })
          .match(query)
          .match(placeQuery)
          .limit(FIND_IN_BATCHES_LIMIT)
          .toArray()

        if (results.length) {
          placeQuery = { _id: { $gt: results[results.length - 1]._id } }
          yield {
            startId: results[0]._id,
            endId: results[results.length - 1]._id,
            items: results
          }
        } else {
          done = true
        }
      }
    }
  })

  const replaceItems = (collection: Collection) => async ({
    startId,
    endId,
    items
  }: {
    startId: any
    endId: any
    items: any[]
  }) => {
    await collection.deleteMany({
      _id: {
        ...(startId ? { $gte: startId } : {}),
        $lte: endId,
        $nin: items.map((item) => item._id)
      }
    })

    await collection.bulkWrite(
      items.map(({ _id, ...fields }) => ({
        replaceOne: {
          filter: { _id },
          replacement: { _id, ...fields },
          upsert: true
        }
      }))
    )
  }

  return {
    describe() {
      return url
    },

    async connect() {
      await client.connect()
    },

    async close() {
      client.close()
    },

    async getCollections() {
      return (await client.db().collections()).map((collection) => ({
        name: collection.collectionName,
        type: collection,
        findInBatches: findInBatches(collection),
        replaceItems: replaceItems(collection)
      }))
    },

    async deleteCollection(name) {
      await client.db().dropCollection(name)
    },

    async upsertCollection(name, collection) {
      await client.db().createCollection(name)

      const indexes = await collection.indexes()

      await client
        .db()
        .collection(name)
        .createIndexes(indexes.map(({ v, ns, ...options }) => options))
    }
  }
}

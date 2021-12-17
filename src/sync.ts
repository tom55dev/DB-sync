import { mapValues } from 'lodash'
import {
  CollectionOptions, ReadableCollection, ReadableDb, ReadWriteCollection, ReadWriteDb
} from './types'

export default async function sync<CollectionType, ItemType extends object>({
  from,
  to,
  collectionOptions
}: {
  from: ReadableDb<CollectionType, ItemType>
  to: ReadWriteDb<CollectionType, ItemType>
  collectionOptions: { [name: string]: CollectionOptions }
}) {
  try {
    console.log(`Starting sync.\n  From: ${from.describe()}\n  To: ${to.describe()}`)

    await Promise.all([from.connect(), to.connect()])

    let [fromDbCollections, toDbCollections] = await Promise.all([
      from.getCollections(),
      to.getCollections()
    ])

    if (!fromDbCollections.every(collection => collectionOptions[collection.name])) {
      throw new Error('Not all collections have been configured in sync options')
    }

    fromDbCollections = fromDbCollections.filter(({ name }) => !collectionOptions[name]?.skip)
    toDbCollections = toDbCollections.filter(({ name }) => !collectionOptions[name]?.skip)

    await deleteRemovedCollections({ toDbCollections, fromDbCollections, to })
    await upsertCollections({ toDbCollections, fromDbCollections, to })

    await syncItems({
      collections: await to.getCollections(),
      fromDbCollections,
      collectionOptions
    })
  } catch (e) {
    console.log('ERROR', e)
  } finally {
    await Promise.all([from.close(), to.close()])
  }
}

async function upsertCollections<CollectionType, ItemType extends object>({
  fromDbCollections,
  to
}: {
  toDbCollections: ReadWriteCollection<CollectionType, ItemType>[]
  fromDbCollections: ReadableCollection<CollectionType, ItemType>[]
  to: ReadWriteDb<CollectionType, ItemType>
}) {
  await Promise.all(
    fromDbCollections.map((collection) => {
      console.log(`Syncing collection options for ${collection.name}`)

      return to.upsertCollection(collection.name, collection.type)
    })
  )
}

async function deleteRemovedCollections<CollectionType, ItemType extends object>({
  toDbCollections,
  fromDbCollections,
  to
}: {
  toDbCollections: ReadWriteCollection<CollectionType, ItemType>[]
  fromDbCollections: ReadableCollection<CollectionType, ItemType>[]
  to: ReadWriteDb<CollectionType, ItemType>
}) {
  await Promise.all(
    toDbCollections
      .filter((collection) => !fromDbCollections.some((other) => collection.name === other.name))
      .map((collection) => {
        console.log(`Deleting collection ${collection.name}`)

        return to.deleteCollection(collection.name)
      })
  )
}

async function syncItems<CollectionType, ItemType extends object>({
  collections,
  fromDbCollections,
  collectionOptions
}: {
  collections: ReadWriteCollection<CollectionType, ItemType>[]
  fromDbCollections: ReadableCollection<CollectionType, ItemType>[]
  collectionOptions: { [name: string]: CollectionOptions }
}) {
  const collectionsToUpdate = collections
    .filter(({ name }) => !collectionOptions[name]?.skip)
    .map((collection) => ({
      from: fromDbCollections.find((other) => collection.name === other.name),
      to: collection,
      options: collectionOptions[collection.name] || {}
    }))

  await Promise.all(
    collectionsToUpdate.map(({ from, to, options }) => syncCollection({ from, to, options }))
  )
}

async function syncCollection<CollectionType, ItemType extends object>({
  from,
  to,
  options
}: {
  from: ReadableCollection<CollectionType, ItemType>
  to: ReadWriteCollection<CollectionType, ItemType>
  options: CollectionOptions
}) {
  for await (const { startId, endId, items } of from.findInBatches(options.query)) {
    const transformedItems = items.map((item) =>
      mapValues(item, (value, name) => {
        const transformer = options.transformFields?.[name] || ((value) => value)

        return transformer(value)
      })
    )

    await to.replaceItems({ startId, endId, items: transformedItems })

    console.log(`${from.name} { ${startId}~${endId} }`)
  }
}

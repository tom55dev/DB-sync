export interface CollectionOptions {
  query?: any
  skip?: boolean
  transformFields?: {
    [name: string]: (value: any, item: any) => any
  }
}

export interface ReadableCollection<CollectionType, ItemType> {
  readonly name: string
  readonly type: CollectionType

  findInBatches: (query?: any) => AsyncIterable<{ startId: any; endId: any; items: ItemType[] }>
}

export interface ReadWriteCollection<CollectionType, ItemType>
  extends ReadableCollection<CollectionType, ItemType> {
  replaceItems: (options: { startId: any; endId: any; items: ItemType[] }) => Promise<void>
}

interface ConnectableDb {
  describe: () => string
  connect: () => Promise<void>
  close: () => Promise<void>
}

export interface ReadableDb<CollectionType, ItemType> extends ConnectableDb {
  getCollections: () => Promise<Array<ReadableCollection<CollectionType, ItemType>>>
}

export interface ReadWriteDb<CollectionType, ItemType> extends ConnectableDb {
  getCollections: () => Promise<Array<ReadWriteCollection<CollectionType, ItemType>>>
  deleteCollection: (name: string) => Promise<void>
  upsertCollection: (name: string, type: CollectionType) => Promise<void>
}

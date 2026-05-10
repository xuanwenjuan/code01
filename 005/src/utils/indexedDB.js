const DB_NAME = 'herbal_medicine_system'
const DB_VERSION = 2
const STORES = {
  categories: 'categories',
  specimens: 'specimens',
  borrowRecords: 'borrowRecords',
  maintenanceRecords: 'maintenanceRecords',
  operationLogs: 'operationLogs'
}

const STORE_SCHEMAS = {
  [STORES.categories]: {
    keyPath: 'id',
    autoIncrement: true,
    indexes: [
      { name: 'name', keyPath: 'name', unique: true },
      { name: 'createdAt', keyPath: 'createdAt', unique: false }
    ]
  },
  [STORES.specimens]: {
    keyPath: 'id',
    autoIncrement: true,
    indexes: [
      { name: 'categoryId', keyPath: 'categoryId', unique: false },
      { name: 'name', keyPath: 'name', unique: false },
      { name: 'rareLevel', keyPath: 'rareLevel', unique: false },
      { name: 'status', keyPath: 'status', unique: false },
      { name: 'code', keyPath: 'code', unique: true },
      { name: 'collectYear', keyPath: 'collectYear', unique: false },
      { name: 'createdAt', keyPath: 'createdAt', unique: false },
      { name: 'updatedAt', keyPath: 'updatedAt', unique: false }
    ]
  },
  [STORES.borrowRecords]: {
    keyPath: 'id',
    autoIncrement: true,
    indexes: [
      { name: 'specimenId', keyPath: 'specimenId', unique: false },
      { name: 'status', keyPath: 'status', unique: false },
      { name: 'borrower', keyPath: 'borrower', unique: false },
      { name: 'createdAt', keyPath: 'createdAt', unique: false },
      { name: 'expectedReturnDate', keyPath: 'expectedReturnDate', unique: false },
      { name: 'returnDate', keyPath: 'returnDate', unique: false }
    ]
  },
  [STORES.maintenanceRecords]: {
    keyPath: 'id',
    autoIncrement: true,
    indexes: [
      { name: 'specimenId', keyPath: 'specimenId', unique: false },
      { name: 'maintenanceDate', keyPath: 'maintenanceDate', unique: false },
      { name: 'status', keyPath: 'status', unique: false },
      { name: 'isDamage', keyPath: 'isDamage', unique: false },
      { name: 'damageLevel', keyPath: 'damageLevel', unique: false }
    ]
  },
  [STORES.operationLogs]: {
    keyPath: 'id',
    autoIncrement: true,
    indexes: [
      { name: 'operationType', keyPath: 'operationType', unique: false },
      { name: 'timestamp', keyPath: 'timestamp', unique: false },
      { name: 'operator', keyPath: 'operator', unique: false },
      { name: 'specimenName', keyPath: 'specimenName', unique: false }
    ]
  }
}

let db = null

const createObjectStore = (database, storeName, schema) => {
  const store = database.createObjectStore(storeName, {
    keyPath: schema.keyPath,
    autoIncrement: schema.autoIncrement
  })
  
  schema.indexes.forEach(index => {
    store.createIndex(index.name, index.keyPath, { unique: index.unique || false })
  })
}

const upgradeObjectStore = (transaction, storeName, schema) => {
  const store = transaction.objectStore(storeName)
  const existingIndexes = Array.from(store.indexNames)
  
  schema.indexes.forEach(index => {
    if (!existingIndexes.includes(index.name)) {
      store.createIndex(index.name, index.keyPath, { unique: index.unique || false })
    }
  })
}

export const openDB = () => {
  return new Promise((resolve, reject) => {
    if (db) {
      resolve(db)
      return
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => {
      db = request.result
      resolve(db)
    }

    request.onupgradeneeded = (event) => {
      const database = event.target.result
      const transaction = event.target.transaction
      const existingStores = Array.from(database.objectStoreNames)
      
      Object.keys(STORE_SCHEMAS).forEach(storeName => {
        const schema = STORE_SCHEMAS[storeName]
        
        if (!existingStores.includes(storeName)) {
          createObjectStore(database, storeName, schema)
        } else {
          upgradeObjectStore(transaction, storeName, schema)
        }
      })
    }
  })
}

export const resetDatabase = async () => {
  try {
    db?.close()
    db = null
    
    const request = indexedDB.deleteDatabase(DB_NAME)
    
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  } catch (error) {
    console.error('重置数据库失败:', error)
    throw error
  }
}

const getTransaction = (storeName, mode = 'readonly') => {
  return db.transaction(storeName, mode)
}

const getStore = (storeName, mode = 'readonly') => {
  return getTransaction(storeName, mode).objectStore(storeName)
}

export const addItem = (storeName, item) => {
  return new Promise((resolve, reject) => {
    const store = getStore(storeName, 'readwrite')
    const request = store.add(item)
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export const updateItem = (storeName, item) => {
  return new Promise((resolve, reject) => {
    const store = getStore(storeName, 'readwrite')
    const request = store.put(item)
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export const deleteItem = (storeName, id) => {
  return new Promise((resolve, reject) => {
    const store = getStore(storeName, 'readwrite')
    const request = store.delete(id)
    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}

export const getItem = (storeName, id) => {
  return new Promise((resolve, reject) => {
    const store = getStore(storeName)
    const request = store.get(id)
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export const getAllItems = (storeName) => {
  return new Promise((resolve, reject) => {
    const store = getStore(storeName)
    const request = store.getAll()
    request.onsuccess = () => resolve(request.result || [])
    request.onerror = () => reject(request.error)
  })
}

export const getItemsByIndex = (storeName, indexName, value) => {
  return new Promise((resolve, reject) => {
    const store = getStore(storeName)
    const index = store.index(indexName)
    const request = index.getAll(value)
    request.onsuccess = () => resolve(request.result || [])
    request.onerror = () => reject(request.error)
  })
}

export const bulkAddItems = (storeName, items) => {
  return new Promise((resolve, reject) => {
    const store = getStore(storeName, 'readwrite')
    let count = 0
    const total = items.length

    if (total === 0) {
      resolve([])
      return
    }

    const results = []

    const addNext = () => {
      if (count >= total) {
        resolve(results)
        return
      }
      const request = store.add(items[count])
      request.onsuccess = (event) => {
        results.push(event.target.result)
        count++
        addNext()
      }
      request.onerror = () => reject(request.error)
    }

    addNext()
  })
}

export const clearStore = (storeName) => {
  return new Promise((resolve, reject) => {
    const store = getStore(storeName, 'readwrite')
    const request = store.clear()
    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}

export const STORE_NAMES = STORES
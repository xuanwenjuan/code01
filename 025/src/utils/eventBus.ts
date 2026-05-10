type EventCallback = (...args: unknown[]) => void

interface EventHandler {
  callback: EventCallback
  once: boolean
}

class EventBus {
  private events: Map<string, EventHandler[]> = new Map()

  on(event: string, callback: EventCallback): () => void {
    if (!this.events.has(event)) {
      this.events.set(event, [])
    }
    const handlers = this.events.get(event)!
    handlers.push({ callback, once: false })

    return () => this.off(event, callback)
  }

  off(event: string, callback?: EventCallback): void {
    if (!this.events.has(event)) return

    if (!callback) {
      this.events.delete(event)
      return
    }

    const handlers = this.events.get(event)!
    const index = handlers.findIndex(h => h.callback === callback)
    if (index !== -1) {
      handlers.splice(index, 1)
    }

    if (handlers.length === 0) {
      this.events.delete(event)
    }
  }

  once(event: string, callback: EventCallback): () => void {
    if (!this.events.has(event)) {
      this.events.set(event, [])
    }
    const handlers = this.events.get(event)!
    handlers.push({ callback, once: true })

    return () => this.off(event, callback)
  }

  emit(event: string, ...args: unknown[]): void {
    if (!this.events.has(event)) return

    const handlers = this.events.get(event)!
    const toRemove: number[] = []

    handlers.forEach((handler, index) => {
      try {
        handler.callback(...args)
      } catch (error) {
        console.error(`Event handler error for event "${event}":`, error)
      }

      if (handler.once) {
        toRemove.push(index)
      }
    })

    for (let i = toRemove.length - 1; i >= 0; i--) {
      handlers.splice(toRemove[i], 1)
    }
  }

  clear(): void {
    this.events.clear()
  }
}

export const eventBus = new EventBus()

export enum StoreEvents {
  PRODUCT_CHANGED = 'product:changed',
  PRODUCT_ADDED = 'product:added',
  PRODUCT_UPDATED = 'product:updated',
  PRODUCT_DELETED = 'product:deleted',
  CATEGORY_CHANGED = 'category:changed',
  INVENTORY_OPERATION = 'inventory:operation',
  LOG_ADDED = 'log:added'
}

export interface ProductEventPayload {
  productId: string
  productName: string
}

export interface InventoryEventPayload extends ProductEventPayload {
  operationType: 'in' | 'out' | 'sale' | 'offline'
  quantity: number
  stockBefore: number
  stockAfter: number
}

export function emitProductAdded(payload: ProductEventPayload): void {
  eventBus.emit(StoreEvents.PRODUCT_ADDED, payload)
  eventBus.emit(StoreEvents.PRODUCT_CHANGED, payload)
}

export function emitProductUpdated(payload: ProductEventPayload): void {
  eventBus.emit(StoreEvents.PRODUCT_UPDATED, payload)
  eventBus.emit(StoreEvents.PRODUCT_CHANGED, payload)
}

export function emitProductDeleted(payload: ProductEventPayload): void {
  eventBus.emit(StoreEvents.PRODUCT_DELETED, payload)
  eventBus.emit(StoreEvents.PRODUCT_CHANGED, payload)
}

export function emitInventoryOperation(payload: InventoryEventPayload): void {
  eventBus.emit(StoreEvents.INVENTORY_OPERATION, payload)
  eventBus.emit(StoreEvents.PRODUCT_CHANGED, {
    productId: payload.productId,
    productName: payload.productName
  })
}

export function emitLogAdded(): void {
  eventBus.emit(StoreEvents.LOG_ADDED)
}

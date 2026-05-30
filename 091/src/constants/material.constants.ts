export enum MaterialCategoryType {
  WOOD = 'wood',
  HERB = 'herb',
  RESIN = 'resin',
  COMPOUND = 'compound',
}

export enum MaterialStatus {
  GOOD = 'good',
  PENDING_PROCESS = 'pending_process',
  SEALED = 'sealed',
  PROCESSING = 'processing',
  PROCESSED = 'processed',
  ISOLATED = 'isolated',
  FAILED = 'failed',
}

export enum ProcessStatus {
  PENDING_SELECTION = 'pending_selection',
  SELECTING = 'selecting',
  SELECTED = 'selected',
  PENDING_PROCESS = 'pending_process',
  PROCESSING = 'processing',
  PROCESSED = 'processed',
  PENDING_DRYING = 'pending_drying',
  DRYING = 'drying',
  DRIED = 'dried',
  PACKAGED = 'packaged',
  FAILED = 'failed',
}

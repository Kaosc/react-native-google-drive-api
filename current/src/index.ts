import { extend } from '@robinbobin/mimetype-constants'

export const mimeTypes = extend('application', {
  vndGoogleAppsFolder: 'vnd.google-apps.folder'
})

export * from './api/constants'
export * from './api/files/constants'
export { UnexpectedFileCountError } from './api/files/errors/UnexpectedFileCountError'
export { ListQueryBuilder } from './api/files/ListQueryBuilder'
export { blobToByteArray } from './aux/Fetcher/blobToByteArray'
export { BlobToByteArrayError } from './aux/Fetcher/errors/BlobToByteArrayError'
export { FetchResponseError } from './aux/Fetcher/errors/FetchResponseError'
export * from './constants'
export { GDrive } from './GDrive'

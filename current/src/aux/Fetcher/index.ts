import type { TJson } from 'src/types'
import type { ReadonlyDeep } from 'type-fest'
import type { TBlobToByteArrayResultType, TBodyType } from './types'

import { GDriveApi } from 'api/GDriveApi'

import { blobToByteArray } from './blobToByteArray'
import { FetchResponseError } from './errors/FetchResponseError'

class Fetcher {
  private readonly abortController = new AbortController()
  private readonly init: RequestInit
  private resource: RequestInfo = ''

  constructor(public readonly gDriveApi: GDriveApi) {
    this.init = {
      headers: new Headers(),
      signal: this.abortController.signal
    }

    this.appendHeader(
      'Authorization',
      `Bearer ${this.gDriveApi.accessParameters.accessToken}`
    )
  }

  appendHeader(name: string, value: string): this {
    ;(this.init.headers as Headers).append(name, value)

    return this
  }

  async fetch(resource?: RequestInfo): Promise<Response> {
    if (resource) {
      this.setResource(resource)
    }

    if (
      this.gDriveApi.accessParameters.fetchTimeout !==
      GDriveApi.INFINITE_TIMEOUT
    ) {
      setTimeout(
        () => this.abortController.abort(),
        this.gDriveApi.accessParameters.fetchTimeout
      )
    }

    const response: Response = await fetch(this.resource, this.init)

    if (response.ok) {
      return response
    }

    throw await FetchResponseError.create(response)
  }

  async fetchBlob(resource?: RequestInfo): Promise<TBlobToByteArrayResultType> {
    const response = await this.fetch(resource)

    return blobToByteArray(await response.blob())
  }

  async fetchText(resource?: RequestInfo): Promise<string> {
    const response = await this.fetch(resource)

    return await response.text()
  }

  async fetchJson<T = TJson>(resource?: RequestInfo): Promise<T> {
    const response = await this.fetch(resource)

    return (await response.json()) as T
  }

  setBody(body: ReadonlyDeep<TBodyType>, contentType?: string): this {
    this.init.body = body

    if (contentType) {
      this.appendHeader('Content-Length', body.length.toString())
      this.appendHeader('Content-Type', contentType)
    }

    return this
  }

  setMethod(method: string): this {
    this.init.method = method

    return this
  }

  setResource(resource: RequestInfo): this {
    this.resource = resource

    return this
  }
}

const fetchBlob = (
  gDriveApi: GDriveApi,
  resource: RequestInfo
): Promise<TBlobToByteArrayResultType> => {
  return new Fetcher(gDriveApi).fetchBlob(resource)
}

const fetchText = (
  gDriveApi: GDriveApi,
  resource: RequestInfo
): Promise<string> => {
  return new Fetcher(gDriveApi).fetchText(resource)
}

const fetchJson = <T = TJson>(
  gDriveApi: GDriveApi,
  resource: RequestInfo
): Promise<T> => {
  return new Fetcher(gDriveApi).fetchJson<T>(resource)
}

export { fetchBlob, Fetcher, fetchJson, fetchText }

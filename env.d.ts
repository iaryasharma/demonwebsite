/// <reference types="next" />

declare namespace NodeJS {
  interface ProcessEnv {
    readonly NEXT_PUBLIC_DEFAULT_PREFIX: string
  }
}

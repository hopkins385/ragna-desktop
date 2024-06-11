import Store from 'electron-store'
let appStore: Store

export function getAppStorage(): Store {
  if (!appStore) {
    appStore = new Store()
  }
  return appStore
}

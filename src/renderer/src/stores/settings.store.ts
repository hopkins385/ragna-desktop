import { defineStore } from 'pinia'

enum SettingsNavigation {
  PROFILE = 'profile',
  ACCOUNT = 'account',
  APPEARANCE = 'appearance',
  MODEL = 'model',
  SERVER = 'server',
  STORAGE = 'storage',
  ADVANCED = 'advanced',
  LOG = 'log'
}

interface ISettingsStoreState {
  navPath: SettingsNavigation
  showSidebar: boolean
}

interface Item {
  title: string
  path: SettingsNavigation
}

const sidebarNavItems: Item[] = [
  {
    title: 'Profile',
    path: SettingsNavigation.PROFILE
  },
  {
    title: 'Account',
    path: SettingsNavigation.ACCOUNT
  },
  {
    title: 'Appearance',
    path: SettingsNavigation.APPEARANCE
  },
  /*{
    title: 'AI Model',
    path: SettingsNavigation.MODEL
  },*/
  {
    title: 'Storage',
    path: SettingsNavigation.STORAGE
  },
  {
    title: 'Advanced',
    path: SettingsNavigation.ADVANCED
  },
  {
    title: 'Server',
    path: SettingsNavigation.SERVER
  },
  {
    title: 'Logs',
    path: SettingsNavigation.LOG
  }
]

export const useSettingsStore = defineStore('settings', {
  state: () =>
    ({
      navPath: SettingsNavigation.STORAGE,
      showSidebar: true
    }) as ISettingsStoreState,
  getters: {
    activeNavPath(state) {
      return state.navPath
    },
    sidebarNavItems() {
      return sidebarNavItems
    },
    sidebarIsVisible(state) {
      return state.showSidebar
    }
  },
  actions: {
    setActiveNavPath(path: SettingsNavigation) {
      this.navPath = path
    },
    toggleSidebar() {
      this.showSidebar = !this.showSidebar
    }
  }
  // persist: true
})

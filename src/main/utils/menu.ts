import { Menu, app } from 'electron'
import { logger } from './logger'

// build a new menu based on default one
export function createMenu() {
  if (!app.isPackaged) return
  const menu = Menu.getApplicationMenu() // get default menu
  if (menu) {
    const newmenu = Menu.buildFromTemplate(
      menu.items.map((i) => {
        // overwrite viewmenu item
        // @ts-ignore
        if (i.role === 'viewmenu' && i.submenu) {
          // create new submenu
          const newviewsub = Menu.buildFromTemplate(
            i.submenu.items.slice(4) // cut first 4 item (4th is separator)
          )
          // replace this item's submenu with the news
          return Object.assign({}, i, { submenu: newviewsub })
        }
        // otherwise keep
        return i
      })
    )
    Menu.setApplicationMenu(newmenu)
  } else {
    logger.error('No menu found')
  }
}

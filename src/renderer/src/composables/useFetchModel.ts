interface ModelList {
  title: string
  hf_params: {
    file: string
  }
}

export interface SelectionList {
  id: number
  title: string
  filePath: string
}

export default function useFetchModel() {
  async function getModelList(): Promise<ModelList | []> {
    try {
      const modelList = await window.electron.ipcRenderer.invoke('get-model-list')
      return JSON.parse(modelList) as ModelList
    } catch (error) {
      console.error('Error getting models', error)
      return []
    }
  }

  async function getModelFolderFiles() {
    try {
      return await window.electron.ipcRenderer.invoke('read-folder-files')
    } catch (error) {
      console.error('Error reading files', error)
      return []
    }
  }

  async function fetchModels(): Promise<SelectionList[]> {
    const list = [] as SelectionList[]
    const modelsInDatabase = await getModelList()
    const filesInFolder = await getModelFolderFiles()
    // files in folder is an array of strings
    // models in database is an array of objects
    // we want to return an array of objects that have a title and a file name
    let id = 0
    filesInFolder?.forEach((filePath: string) => {
      const file = filePath.split('/').pop() as string
      const model = modelsInDatabase.find((model) => model.hf_params.file === file)
      let title = file
      if (model) {
        title = model.title
      }
      list.push({
        id: id++,
        title,
        filePath
      })
    })
    // sort the list by title
    list.sort((a, b) => a.title.localeCompare(b.title))
    return list
  }

  return {
    getModelList,
    getModelFolderFiles,
    fetchModels
  }
}

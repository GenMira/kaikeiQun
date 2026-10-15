import { useCallback, useReducer, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { emptyProject, ProjectContext, projectReducer, restoreProject, STORAGE_KEY } from './project'

function loadProject() {
  try {
    return { project: restoreProject(sessionStorage.getItem(STORAGE_KEY)), warning: '' }
  } catch {
    return {
      project: emptyProject,
      warning: '保存した入力内容を復元できませんでした。商品情報を確認して、もう一度登録してください。',
    }
  }
}

export default function ProjectProvider({ children }: { children: ReactNode }) {
  const [initial] = useState(loadProject)
  const [project, reduce] = useReducer(projectReducer, initial.project)
  const currentProject = useRef(initial.project)
  const [storageWarning, setStorageWarning] = useState(initial.warning)

  const dispatch = useCallback((action: Parameters<typeof projectReducer>[1]) => {
    const next = projectReducer(currentProject.current, action)
    currentProject.current = next
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, ...next }))
    } catch {
      setStorageWarning('このブラウザでは入力内容を保存できません。再読み込みすると内容が失われます。')
    }
    reduce(action)
  }, [])

  return (
    <ProjectContext.Provider value={{ project, dispatch, storageWarning }}>
      {children}
    </ProjectContext.Provider>
  )
}

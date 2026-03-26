import { useContext } from 'react'
import { AppContext } from './appContextInstance'

export function useApp() {
  return useContext(AppContext)
}

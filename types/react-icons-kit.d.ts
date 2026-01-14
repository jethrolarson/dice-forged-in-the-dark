declare module 'react-icons-kit' {
  export interface IconKitNode {
    name: string
    attribs?: Record<string, string>
    children?: IconKitNode[]
  }

  export interface IconKitDefinition {
    viewBox: string
    children: IconKitNode[]
  }
}

declare module 'react-icons-kit/*' {
  import type { IconKitDefinition } from 'react-icons-kit'
  const icons: Record<string, IconKitDefinition>
  export = icons
}

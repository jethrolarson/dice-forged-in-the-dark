import { Component } from '@fun-land/fun-web'
import type { IconKitDefinition, IconKitNode } from 'react-icons-kit'

const SVG_NS = 'http://www.w3.org/2000/svg'

function buildSvgNode(node: IconKitNode): SVGElement {
  const el = document.createElementNS(SVG_NS, node.name)

  if (node.attribs) {
    for (const [key, value] of Object.entries(node.attribs)) {
      // be defensive in case a pack sneaks in non-strings
      if (value != null) el.setAttribute(key, String(value))
    }
  }

  if (node.children && node.children.length) {
    for (const child of node.children) {
      el.appendChild(buildSvgNode(child))
    }
  }

  return el
}

export const Icon: Component<{ icon: IconKitDefinition; size?: number }> = (signal, { icon, size = 16 }) => {
  const svg = document.createElementNS(SVG_NS, 'svg')
  svg.setAttribute('viewBox', icon.viewBox)
  svg.setAttribute('width', String(size))
  svg.setAttribute('height', String(size))
  svg.setAttribute('fill', 'currentColor')
  svg.setAttribute('aria-hidden', 'true')
  svg.setAttribute('focusable', 'false')

  for (const child of icon.children) {
    svg.appendChild(buildSvgNode(child))
  }

  return svg
}

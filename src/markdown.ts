import MarkdownIt from 'markdown-it'

const md = MarkdownIt().configure('default').enable('image')

// Remember old renderer, if overridden, or proxy to default renderer
const defaultRender =
  md.renderer.rules.link_open ??
  function (tokens, idx, options, _env, self): string {
    return self.renderToken(tokens, idx, options)
  }

md.renderer.rules.link_open = function (tokens, idx, options, env, self): string {
  // If you are sure other plugins can't add `target` - drop check below
  const token = tokens[idx]
  if (token !== undefined) {
    const aIndex = token.attrIndex('target')

    if (aIndex < 0) {
      token.attrPush(['target', '_blank']) // add new attribute
    } else {
      const existingAttr = token?.attrs?.[aIndex]
      if (existingAttr) {
        existingAttr[1] = '_blank' // replace value of existing attr
      }
    }
  }

  // pass token to default renderer.
  return defaultRender(tokens, idx, options, env, self)
}

export default md

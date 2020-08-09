/**
 * Not type-checking this file because it's mostly vendor code.
 */

/*!
 * HTML Parser By John Resig (ejohn.org)
 * Modified by Juriy "kangax" Zaytsev
 * Original code by Erik Arvidsson (MPL-1.1 OR Apache-2.0 OR GPL-2.0-or-later)
 * http://erik.eae.net/simplehtmlparser/simplehtmlparser.js
 */


/**
 * Always return false.
 */
const no = (a, b, c) => false

const isNonPhrasingTag = makeMap(
  'address,article,aside,base,blockquote,body,caption,col,colgroup,dd,' +
  'details,dialog,div,dl,dt,fieldset,figcaption,figure,footer,form,' +
  'h1,h2,h3,h4,h5,h6,head,header,hgroup,hr,html,legend,li,menuitem,meta,' +
  'optgroup,option,param,rp,rt,source,style,summary,tbody,td,tfoot,th,thead,' +
  'title,tr,track'
)

function makeMap(
  str,
  expectsLowerCase
) {
  const map = Object.create(null)
  const list = str.split(',')
  for (let i = 0; i < list.length; i++) {
    map[list[i]] = true
  }
  return expectsLowerCase
    ? val => map[val.toLowerCase()]
    : val => map[val]
}

// Regular Expressions for parsing tags and attributes
const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/
const dynamicArgAttribute = /^\s*((?:v-[\w-]+:|@|:|#)\[[^=]+\][^\s"'<>\/=]*)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/
const ncname = '[a-zA-Z_][\\w\\-\\.]*'
const qnameCapture = `((?:${ncname}\\:)?${ncname})`
const startTagOpen = new RegExp(`^<${qnameCapture}`)
const startTagClose = /^\s*(\/?)>/
const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`)
const doctype = /^<!DOCTYPE [^>]+>/i
// #7298: escape - to avoid being passed as HTML comment when inlined in page
const comment = /^<!\--/
const conditionalComment = /^<!\[/

// Special Elements (can contain anything)
const isPlainTextElement = makeMap('script,style,textarea', true)
const reCache = {}

const decodingMap = {
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&amp;': '&',
  '&#10;': '\n',
  '&#9;': '\t',
  '&#39;': "'"
}
const encodedAttr = /&(?:lt|gt|quot|amp|#39);/g
const encodedAttrWithNewLines = /&(?:lt|gt|quot|amp|#39|#10|#9);/g

// #5992
const isIgnoreNewlineTag = makeMap('pre,textarea', true)
const shouldIgnoreFirstNewline = (tag, html) => tag && isIgnoreNewlineTag(tag) && html[0] === '\n'

function decodeAttr(value, shouldDecodeNewlines) {
  const re = shouldDecodeNewlines ? encodedAttrWithNewLines : encodedAttr
  return value.replace(re, match => decodingMap[match])
}

function parseHTML(html, options) {
  const stack = []

  //web 平台为 true
  const expectHTML = true
  //自闭和标签列表
  const isUnaryTag = options.isUnaryTag || no
  //左开放标签
  const canBeLeftOpenTag = options.canBeLeftOpenTag || no
  let index = 0
  let last, lastTag
  while (html) {
    last = html
    // Make sure we're not in a plaintext content element like script/style
    if (!lastTag || !isPlainTextElement(lastTag)) {
      let textEnd = html.indexOf('<')
      //如果是<开始的字符串
      if (textEnd === 0) {
        // Comment:
        //是否为注释
        if (comment.test(html)) {
          const commentEnd = html.indexOf('-->')

          if (commentEnd >= 0) {
            if (options.shouldKeepComment) {
              options.comment(html.substring(4, commentEnd), index, index + commentEnd + 3)
            }
            advance(commentEnd + 3)
            continue
          }
        }

        //是否为特殊编译
        // http://en.wikipedia.org/wiki/Conditional_comment#Downlevel-revealed_conditional_comment
        if (conditionalComment.test(html)) {
          const conditionalEnd = html.indexOf(']>')

          if (conditionalEnd >= 0) {
            advance(conditionalEnd + 2)
            continue
          }
        }

        // Doctype:
        const doctypeMatch = html.match(doctype)
        if (doctypeMatch) {
          advance(doctypeMatch[0].length)
          continue
        }

        // End tag:
        const endTagMatch = html.match(endTag)
        if (endTagMatch) {
          const curIndex = index
          advance(endTagMatch[0].length)
          parseEndTag(endTagMatch[1], curIndex, index)
          continue
        }

        // Start tag:
        const startTagMatch = parseStartTag()
        if (startTagMatch) {
          handleStartTag(startTagMatch)
          if (shouldIgnoreFirstNewline(startTagMatch.tagName, html)) {
            advance(1)
          }
          continue
        }
      }

      let text, rest, next
      if (textEnd >= 0) {
        rest = html.slice(textEnd)
        while (
          !endTag.test(rest) &&
          !startTagOpen.test(rest) &&
          !comment.test(rest) &&
          !conditionalComment.test(rest)
          ) {
          // < in plain text, be forgiving and treat it as text
          next = rest.indexOf('<', 1)
          if (next < 0) break
          textEnd += next
          rest = html.slice(textEnd)
        }
        text = html.substring(0, textEnd)
      }

      if (textEnd < 0) {
        text = html
      }

      if (text) {
        advance(text.length)
      }

      if (options.chars && text) {
        options.chars(text, index - text.length, index)
      }
    } else {
      let endTagLength = 0
      const stackedTag = lastTag.toLowerCase()
      const reStackedTag = reCache[stackedTag] || (reCache[stackedTag] = new RegExp('([\\s\\S]*?)(</' + stackedTag + '[^>]*>)', 'i'))
      const rest = html.replace(reStackedTag, function (all, text, endTag) {
        endTagLength = endTag.length
        if (!isPlainTextElement(stackedTag) && stackedTag !== 'noscript') {
          text = text
            .replace(/<!\--([\s\S]*?)-->/g, '$1') // #7298
            .replace(/<!\[CDATA\[([\s\S]*?)]]>/g, '$1')
        }
        if (shouldIgnoreFirstNewline(stackedTag, text)) {
          text = text.slice(1)
        }
        if (options.chars) {
          options.chars(text)
        }
        return ''
      })
      index += html.length - rest.length
      html = rest
      parseEndTag(stackedTag, index - endTagLength, index)
    }

    if (html === last) {
      options.chars && options.chars(html)
      if (process.env.NODE_ENV !== 'production' && !stack.length && options.warn) {
        options.warn(`Mal-formatted tag at end of template: "${html}"`, {start: index + html.length})
      }
      break
    }
  }

  // Clean up any remaining tags
  parseEndTag()

  function advance(n) {
    index += n
    html = html.substring(n)
  }

  function parseStartTag() {
    const start = html.match(startTagOpen)
    if (start) {
      const match = {
        tagName: start[1],
        attrs: [],
        start: index
      }
      advance(start[0].length)
      let end, attr
      while (!(end = html.match(startTagClose)) && (attr = html.match(dynamicArgAttribute) || html.match(attribute))) {
        attr.start = index
        advance(attr[0].length)
        attr.end = index
        match.attrs.push(attr)
      }
      if (end) {
        match.unarySlash = end[1]
        advance(end[0].length)
        match.end = index
        return match
      }
    }
  }

  function handleStartTag(match) {
    const tagName = match.tagName
    const unarySlash = match.unarySlash

    if (expectHTML) {
      if (lastTag === 'p' && isNonPhrasingTag(tagName)) {
        parseEndTag(lastTag)
      }
      if (canBeLeftOpenTag(tagName) && lastTag === tagName) {
        parseEndTag(tagName)
      }
    }

    const unary = isUnaryTag(tagName) || !!unarySlash

    const l = match.attrs.length
    const attrs = new Array(l)
    for (let i = 0; i < l; i++) {
      const args = match.attrs[i]
      const value = args[3] || args[4] || args[5] || ''
      const shouldDecodeNewlines = tagName === 'a' && args[1] === 'href'
        ? options.shouldDecodeNewlinesForHref
        : options.shouldDecodeNewlines
      attrs[i] = {
        name: args[1],
        value: decodeAttr(value, shouldDecodeNewlines)
      }
      if (process.env.NODE_ENV !== 'production' && options.outputSourceRange) {
        attrs[i].start = args.start + args[0].match(/^\s*/).length
        attrs[i].end = args.end
      }
    }

    if (!unary) {
      stack.push({tag: tagName, lowerCasedTag: tagName.toLowerCase(), attrs: attrs, start: match.start, end: match.end})
      lastTag = tagName
    }

    if (options.start) {
      options.start(tagName, attrs, unary, match.start, match.end)
    }
  }

  function parseEndTag(tagName, start, end) {
    let pos, lowerCasedTagName
    if (start == null) start = index
    if (end == null) end = index

    // Find the closest opened tag of the same type
    if (tagName) {
      lowerCasedTagName = tagName.toLowerCase()
      for (pos = stack.length - 1; pos >= 0; pos--) {
        if (stack[pos].lowerCasedTag === lowerCasedTagName) {
          break
        }
      }
    } else {
      // If no tag name is provided, clean shop
      pos = 0
    }

    if (pos >= 0) {
      // Close all the open elements, up the stack
      for (let i = stack.length - 1; i >= pos; i--) {
        if (process.env.NODE_ENV !== 'production' &&
          (i > pos || !tagName) &&
          options.warn
        ) {
          options.warn(
            `tag <${stack[i].tag}> has no matching end tag.`,
            {start: stack[i].start, end: stack[i].end}
          )
        }
        if (options.end) {
          options.end(stack[i].tag, start, end)
        }
      }

      // Remove the open elements from the stack
      stack.length = pos
      lastTag = pos && stack[pos - 1].tag
    } else if (lowerCasedTagName === 'br') {
      if (options.start) {
        options.start(tagName, [], true, start, end)
      }
    } else if (lowerCasedTagName === 'p') {
      if (options.start) {
        options.start(tagName, [], false, start, end)
      }
      if (options.end) {
        options.end(tagName, start, end)
      }
    }
  }
}

parseHTML(`<div  class="box" id="el"></div>`)
parseHTML((template, {
  warn,
  expectHTML: options.expectHTML,
  isUnaryTag: options.isUnaryTag,
  canBeLeftOpenTag: options.canBeLeftOpenTag,
  shouldDecodeNewlines: options.shouldDecodeNewlines,
  shouldDecodeNewlinesForHref: options.shouldDecodeNewlinesForHref,
  shouldKeepComment: options.comments,
  outputSourceRange: options.outputSourceRange,
  start (tag, attrs, unary, start, end) {
    // check namespace.
    // inherit parent ns if there is one
    const ns = (currentParent && currentParent.ns) || platformGetTagNamespace(tag)

    // handle IE svg bug
    /* istanbul ignore if */
    if (isIE && ns === 'svg') {
      attrs = guardIESVGBug(attrs)
    }

    let element: ASTElement = createASTElement(tag, attrs, currentParent)
    if (ns) {
      element.ns = ns
    }

    if (process.env.NODE_ENV !== 'production') {
      if (options.outputSourceRange) {
        element.start = start
        element.end = end
        element.rawAttrsMap = element.attrsList.reduce((cumulated, attr) => {
          cumulated[attr.name] = attr
          return cumulated
        }, {})
      }
      attrs.forEach(attr => {
        if (invalidAttributeRE.test(attr.name)) {
          warn(
            `Invalid dynamic argument expression: attribute names cannot contain ` +
            `spaces, quotes, <, >, / or =.`,
            {
              start: attr.start + attr.name.indexOf(`[`),
              end: attr.start + attr.name.length
            }
          )
        }
      })
    }

    if (isForbiddenTag(element) && !isServerRendering()) {
      element.forbidden = true
      process.env.NODE_ENV !== 'production' && warn(
        'Templates should only be responsible for mapping the state to the ' +
        'UI. Avoid placing tags with side-effects in your templates, such as ' +
        `<${tag}>` + ', as they will not be parsed.',
        { start: element.start }
      )
    }

    // apply pre-transforms
    for (let i = 0; i < preTransforms.length; i++) {
      element = preTransforms[i](element, options) || element
    }

    if (!inVPre) {
      processPre(element)
      if (element.pre) {
        inVPre = true
      }
    }
    if (platformIsPreTag(element.tag)) {
      inPre = true
    }
    if (inVPre) {
      processRawAttrs(element)
    } else if (!element.processed) {
      // structural directives
      processFor(element)
      processIf(element)
      processOnce(element)
    }

    if (!root) {
      root = element
      if (process.env.NODE_ENV !== 'production') {
        checkRootConstraints(root)
      }
    }

    if (!unary) {
      currentParent = element
      stack.push(element)
    } else {
      closeElement(element)
    }
  },

  end (tag, start, end) {
    const element = stack[stack.length - 1]
    // pop stack
    stack.length -= 1
    currentParent = stack[stack.length - 1]
    if (process.env.NODE_ENV !== 'production' && options.outputSourceRange) {
      element.end = end
    }
    closeElement(element)
  },

  chars (text: string, start: number, end: number) {
    if (!currentParent) {
      if (process.env.NODE_ENV !== 'production') {
        if (text === template) {
          warnOnce(
            'Component template requires a root element, rather than just text.',
            { start }
          )
        } else if ((text = text.trim())) {
          warnOnce(
            `text "${text}" outside root element will be ignored.`,
            { start }
          )
        }
      }
      return
    }
    // IE textarea placeholder bug
    /* istanbul ignore if */
    if (isIE &&
      currentParent.tag === 'textarea' &&
      currentParent.attrsMap.placeholder === text
    ) {
      return
    }
    const children = currentParent.children
    if (inPre || text.trim()) {
      text = isTextTag(currentParent) ? text : decodeHTMLCached(text)
    } else if (!children.length) {
      // remove the whitespace-only node right after an opening tag
      text = ''
    } else if (whitespaceOption) {
      if (whitespaceOption === 'condense') {
        // in condense mode, remove the whitespace node if it contains
        // line break, otherwise condense to a single space
        text = lineBreakRE.test(text) ? '' : ' '
      } else {
        text = ' '
      }
    } else {
      text = preserveWhitespace ? ' ' : ''
    }
    if (text) {
      if (!inPre && whitespaceOption === 'condense') {
        // condense consecutive whitespaces into single space
        text = text.replace(whitespaceRE, ' ')
      }
      let res
      let child: ?ASTNode
      if (!inVPre && text !== ' ' && (res = parseText(text, delimiters))) {
        child = {
          type: 2,
          expression: res.expression,
          tokens: res.tokens,
          text
        }
      } else if (text !== ' ' || !children.length || children[children.length - 1].text !== ' ') {
        child = {
          type: 3,
          text
        }
      }
      if (child) {
        if (process.env.NODE_ENV !== 'production' && options.outputSourceRange) {
          child.start = start
          child.end = end
        }
        children.push(child)
      }
    }
  },
  comment (text: string, start, end) {
    // adding anyting as a sibling to the root node is forbidden
    // comments should still be allowed, but ignored
    if (currentParent) {
      const child: ASTText = {
        type: 3,
        text,
        isComment: true
      }
      if (process.env.NODE_ENV !== 'production' && options.outputSourceRange) {
        child.start = start
        child.end = end
      }
      currentParent.children.push(child)
    }
  }
}))

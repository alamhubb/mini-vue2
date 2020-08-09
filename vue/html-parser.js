//以字母+下划线开头,任意的单个字符加-
const ncname = '[a-zA-Z_][\\w\\-\\.]*'
const qnameCapture = `((?:${ncname}\\:)?${ncname})`
// const startTagOpen = new RegExp(`^<${qnameCapture}`)
const startTagOpen = new RegExp(`^<(${ncname})`)
const startTagClose = /^\s*(\/?)>/
const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/
const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`)


const astStack = []

const ast = null

let lastTag

function isPlainTextElement(value) {
  return ['script', 'style', 'textarea'].includes(value.toLowerCase())
}

function parseHTML(html, options) {
  while (html) {
    if (!lastTag || !isPlainTextElement(lastTag)) {
      let textEnd = html.indexOf('<')
      //如果是<开始
      if (textEnd === 0) {
        // 结束标签
        const endTagMatch = html.match(endTag)
        if (endTagMatch) {
          //截取
          advance(endTagMatch[0].length)
          options.end()
          // 结束标签的处理逻辑
          continue
        }

        // 开始标签
        const startTagMatch = parseStartTag()
        if (startTagMatch) {
          options.start(startTagMatch.tagName, startTagMatch.attrs, startTagMatch.unarySlash)
          // 开始标签的处理逻辑
          //将标签放入ast
          // handleStartTag(startTagMatch)
          continue
        }
      }

      let text, rest, next
      // 截取文本 asdf<
      if (textEnd >= 0) {
        //获取第一个<的位置开始到结束,获取 <之后的所有标签
        rest = html.slice(textEnd)
        while (
          //不为开始结束标签，是否符合标签规范，
        !endTag.test(rest) &&
        !startTagOpen.test(rest)
          ) {
          //不符合的话，获取下一个<,从1，开始因为0是<
          // 如果'<'在纯文本中，将它视为纯文本对待
          next = rest.indexOf('<', 1)
          if (next < 0) break
          textEnd += next
          //继续向后查询还有没有<
          rest = html.slice(textEnd)
        }
        //设置text内容
        text = html.substring(0, textEnd)
        options.chars(text)
        //截取html
        html = html.substring(textEnd)
      }

      // 如果模板中找不到<，就说明整个模板都是文本
      if (textEnd < 0) {
        text = html
        html = ''
      }
    }
  }

  function advance(n) {
    html = html.substring(n)
  }

  function parseStartTag() {
    // 解析标签名，判断模板是否符合开始标签的特征
    const start = html.match(startTagOpen)
    if (start) {
      const match = {
        tagName: start[1],
        attrs: []
      }
      advance(start[0].length)

      // 解析标签属性
      let end, attr
      while (!(end = html.match(startTagClose)) && (attr = html.match(attribute))) {
        advance(attr[0].length)
        match.attrs.push(attr)
      }

      // 判断是否是自闭合标签
      if (end) {
        match.unarySlash = end[1]
        advance(end[0].length)
        return match
      }
    }
  }

  console.log('退出了')
}


parseHTML(
  `<div id="app">
          <div  class="box" id="el">123</div>
        </div>`
  , {
    start(tag, attrs, unary) {
      let currentParent = null
      //如果当前有父元素，则往父元素中插入，如果没有，则当前元素改为父元素
      if (astStack && astStack.length) {
        currentParent = astStack[astStack.length - 1]
      }
      // 每当解析到标签的开始位置时，触发该函数
      const element = createASTElement(tag, attrs, currentParent)
      if (currentParent) {
        currentParent.children.push(element)
      }
      astStack.push(element)
    },
    end() {
      // 每当解析到标签的结束位置时，触发该函数
      const lastEle = astStack.pop()
      if (!astStack.length) {
        console.dir(lastEle)
      }
    },
    chars(text) {
      // 每当解析到文本时，触发该函数
      // 每当解析到标签的开始位置时，触发该函数
      const element = {type: 3, text}
      //如果当前有父元素，则往父元素中插入，如果没有，则当前元素改为父元素
      if (astStack && astStack.length) {
        const currentParent = astStack[astStack.length - 1]
        currentParent.children.push(element)
      }
    }
  })

function createASTElement(tag, attrs, parent) {
  return {
    type: 1,
    tag,
    attrsList: attrs,
    parent,
    children: []
  }
}

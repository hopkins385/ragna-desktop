import type { Options as LinkifyOptions } from 'linkify-it'
import markdownit from 'markdown-it'
// import hljs from 'highlight.js'

export default function useMarkdown() {
  const mdOptions: markdownit.Options = {
    html: true,
    breaks: true,
    linkify: false,
    typographer: true

    /*highlight: function (str, lang) {
      if (lang && hljs.getLanguage(lang)) {
        try {
          return (
            `<pre><code class="hljs language-${lang}">` +
            hljs.highlight(str, { language: lang, ignoreIllegals: true }).value +
            '</code></pre>'
          )
          // eslint-disable-next-line no-empty
        } catch (__) {}
      }

      return '<pre><code class="hljs">' + md.utils.escapeHtml(str) + '</code></pre>'
    }*/
  }

  const linkifyOptions: LinkifyOptions = {
    fuzzyLink: false,
    fuzzyIP: false,
    fuzzyEmail: false
  }

  const disable = ['reference', 'image', 'link', 'html_block', 'html_inline', 'autolink']

  const md = new markdownit(mdOptions ?? {}).disable(disable)

  md.linkify.set(linkifyOptions ?? {})

  function render(text: string) {
    return md.render(text)
  }

  return {
    render
  }
}

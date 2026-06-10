// ==UserScript==
// @name         Expo Docs Safe Collector
// @namespace    https://docs.expo.dev/
// @version      2.0.0
// @description  安全收集 Expo Docs Next 链接，支持暂停、继续、停止、查看结果
// @match        https://docs.expo.dev/*
// @run-at       document-idle
// ==/UserScript==

;(function () {
  'use strict'

  const START_URL = 'https://docs.expo.dev/workflow/overview/'

  const KEY_RESULT = 'expo_docs_result'
  const KEY_RUNNING = 'expo_docs_running'
  const KEY_DONE = 'expo_docs_done'
  const KEY_AUTO = 'expo_docs_auto'

  const JUMP_DELAY = 3000

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

  function cleanUrl(url = location.href) {
    const u = new URL(url, location.origin)
    u.hash = ''
    u.search = ''
    return u.origin + u.pathname
  }

  function toMdUrl(url) {
    const clean = cleanUrl(url)

    if (clean.endsWith('/')) {
      return clean.slice(0, -1) + '.md'
    }

    if (clean.endsWith('.md')) {
      return clean
    }

    return clean + '.md'
  }

  function getResult() {
    try {
      return JSON.parse(localStorage.getItem(KEY_RESULT) || '[]')
    } catch {
      return []
    }
  }

  function setResult(result) {
    localStorage.setItem(KEY_RESULT, JSON.stringify(result))
  }

  function getBool(key) {
    return localStorage.getItem(key) === 'true'
  }

  function setBool(key, value) {
    localStorage.setItem(key, value ? 'true' : 'false')
  }

  function resetState() {
    localStorage.removeItem(KEY_RESULT)
    localStorage.removeItem(KEY_RUNNING)
    localStorage.removeItem(KEY_DONE)
    localStorage.removeItem(KEY_AUTO)
  }

  function addCurrentUrl() {
    const current = cleanUrl()
    const result = getResult()

    if (!result.includes(current)) {
      result.push(current)
      setResult(result)
    }
  }

  function getMdResult() {
    return getResult().map(toMdUrl)
  }

  function findNextLink() {
    const containers = Array.from(document.querySelectorAll('[data-nosnippet]'))

    for (const container of containers) {
      const links = Array.from(container.querySelectorAll('a[href]'))

      for (const link of links) {
        const text = link.textContent.replace(/\s+/g, ' ').trim()

        if (/\bNext\b/i.test(text)) {
          return link
        }
      }
    }

    const allLinks = Array.from(document.querySelectorAll('a[href]'))

    for (const link of allLinks) {
      const text = link.textContent.replace(/\s+/g, ' ').trim()

      if (/\bNext\b/i.test(text)) {
        return link
      }
    }

    return null
  }

  function renderPanel(message = '') {
    let panel = document.querySelector('#expo-safe-collector-panel')

    if (!panel) {
      panel = document.createElement('div')
      panel.id = 'expo-safe-collector-panel'
      panel.style.cssText = `
        position: fixed;
        right: 16px;
        top: 16px;
        z-index: 999999999;
        width: 620px;
        max-height: 80vh;
        overflow: auto;
        padding: 12px;
        background: #111827;
        color: #fff;
        border-radius: 8px;
        box-shadow: 0 8px 30px rgba(0,0,0,.35);
        font-size: 12px;
        line-height: 1.5;
        font-family: Menlo, Monaco, Consolas, monospace;
      `

      document.body.appendChild(panel)
    }

    const result = getResult()
    const mdUrls = getMdResult()
    const running = getBool(KEY_RUNNING)
    const auto = getBool(KEY_AUTO)
    const done = getBool(KEY_DONE)

    panel.innerHTML = `
      <div style="font-weight:bold;color:#93c5fd;margin-bottom:8px;">
        Expo Docs Safe Collector
      </div>

      <div style="margin-bottom:8px;">
        当前页面：${cleanUrl()}
      </div>

      <div style="margin-bottom:8px;">
        状态：running=${running} | auto=${auto} | done=${done} | 已收集=${result.length}
      </div>

      <div style="margin-bottom:8px;color:#facc15;">
        ${message || '等待操作'}
      </div>

      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:8px;">
        <button id="expo-btn-start">开始/继续自动收集</button>
        <button id="expo-btn-pause">暂停</button>
        <button id="expo-btn-step">只收集当前页并跳下一页</button>
        <button id="expo-btn-stop">停止并输出结果</button>
        <button id="expo-btn-reset">清空并回到起始页</button>
        <button id="expo-btn-copy">复制结果</button>
      </div>

      <textarea id="expo-result-area" style="
        width:100%;
        height:300px;
        box-sizing:border-box;
        color:#111827;
        background:#fff;
        padding:8px;
        border-radius:4px;
        font-size:12px;
      ">${mdUrls.join('\n')}</textarea>
    `

    panel.querySelectorAll('button').forEach((btn) => {
      btn.style.cssText = `
        padding: 5px 8px;
        cursor: pointer;
        font-size: 12px;
      `
    })

    panel.querySelector('#expo-btn-start').onclick = () => {
      setBool(KEY_RUNNING, true)
      setBool(KEY_AUTO, true)
      setBool(KEY_DONE, false)

      if (cleanUrl() !== cleanUrl(START_URL) && getResult().length === 0) {
        location.href = START_URL
        return
      }

      renderPanel('已开始，3 秒后自动处理当前页面')
      setTimeout(runOnce, 3000)
    }

    panel.querySelector('#expo-btn-pause').onclick = () => {
      setBool(KEY_RUNNING, false)
      setBool(KEY_AUTO, false)
      renderPanel('已暂停，不会继续跳转')
    }

    panel.querySelector('#expo-btn-step').onclick = () => {
      setBool(KEY_RUNNING, true)
      setBool(KEY_AUTO, false)
      setBool(KEY_DONE, false)
      runOnce()
    }

    panel.querySelector('#expo-btn-stop').onclick = () => {
      setBool(KEY_RUNNING, false)
      setBool(KEY_AUTO, false)
      setBool(KEY_DONE, true)
      renderPanel('已停止，结果已输出')
    }

    panel.querySelector('#expo-btn-reset').onclick = () => {
      resetState()
      location.href = START_URL
    }

    panel.querySelector('#expo-btn-copy').onclick = async () => {
      await navigator.clipboard.writeText(getMdResult().join('\n'))
      renderPanel('已复制结果')
    }
  }

  async function runOnce() {
    renderPanel('开始处理当前页面')

    addCurrentUrl()
    renderPanel('已收集当前页，正在查找 Next 链接')

    const nextLink = findNextLink()

    if (!nextLink) {
      setBool(KEY_RUNNING, false)
      setBool(KEY_AUTO, false)
      setBool(KEY_DONE, true)
      renderPanel('未找到 Next，认为已到最后一页')
      return
    }

    const current = cleanUrl()
    const nextUrl = cleanUrl(nextLink.href)

    if (nextUrl === current) {
      setBool(KEY_RUNNING, false)
      setBool(KEY_AUTO, false)
      setBool(KEY_DONE, true)
      renderPanel('Next 和当前页面相同，已停止，避免死循环')
      return
    }

    renderPanel(`${JUMP_DELAY / 1000} 秒后跳转到：${nextUrl}`)

    await sleep(JUMP_DELAY)

    if (!getBool(KEY_RUNNING)) {
      renderPanel('跳转前检测到已暂停，取消跳转')
      return
    }

    location.href = nextUrl
  }

  async function main() {
    await sleep(800)

    renderPanel('脚本已加载')

    window.__expoCollector = {
      getRawResult: getResult,
      getMdResult,
      getState() {
        return {
          result: getResult(),
          mdResult: getMdResult(),
          running: getBool(KEY_RUNNING),
          auto: getBool(KEY_AUTO),
          done: getBool(KEY_DONE),
        }
      },
      pause() {
        setBool(KEY_RUNNING, false)
        setBool(KEY_AUTO, false)
        renderPanel('已通过 Console 暂停')
      },
      reset() {
        resetState()
        renderPanel('已通过 Console 清空状态')
      },
    }

    if (getBool(KEY_RUNNING) && getBool(KEY_AUTO)) {
      renderPanel('检测到自动模式，3 秒后继续')
      await sleep(3000)

      if (getBool(KEY_RUNNING) && getBool(KEY_AUTO)) {
        runOnce()
      }
    }
  }

  main()
})()

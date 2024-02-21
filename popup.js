const tabs = await chrome.tabs.query({
  url: [
    'https://developer.chrome.com/docs/webstore/*',
    'https://developer.chrome.com/docs/extensions/*',
  ],
})

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Collator
// sort ettik
const collator = new Intl.Collator()
tabs.sort((a, b) => collator.compare(a.title, b.title))

const template = document.getElementById('li_template')
const elements = new Set()
for (const tab of tabs) {
  // cloneNode() method creates a copy of a node, and returns the clone.
  // The cloneNode() method clones all attributes and their values.
  // <temple></temple> içindeki ilk elementi klonluyoruz <template> </template> yapmak önemliydi.
  const element = template.content.firstElementChild.cloneNode(true)

  const title = tab.title.split('-')[0].trim()
  const pathname = new URL(tab.url).pathname.slice('/docs'.length)

  element.querySelector('.title').textContent = title
  element.querySelector('.pathname').textContent = pathname
  element.querySelector('a').addEventListener('click', async () => {
    // need to focus window as well as the active tab
    //tells the browser to switch to this tab, making it the currently displayed tab in its window.
    await chrome.tabs.update(tab.id, { active: true })
    //tells the browser to switch to this window, making it the currently focused window.
    //  window is brought to the foreground, making it the active window on the user's desktop.
    await chrome.windows.update(tab.windowId, { focused: true })
  })

  elements.add(element)
}
document.querySelector('ul').append(...elements)

const button = document.querySelector('button')
button.addEventListener('click', async () => {
  const tabIds = tabs.map(({ id }) => id)
  if (tabIds.length) {
    const group = await chrome.tabs.group({ tabIds })
    await chrome.tabGroups.update(group, { title: 'DOCS' })
  }
})

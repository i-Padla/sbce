import Jedison from './assets/jedison/custom.js'

let instances = {}
let schemaReady = null

const RefParser = new Jedison.RefParser()
const JedisonOptions = {
  theme: new Jedison.Custom.Bootstrap(),
  customEditors: Jedison.Custom.Editors,
  refParser: RefParser,
  enablePropertiesToggle: true,
  deactivateNonRequired: true,
  objectAdd: false,
  btnContents: true,
  mergeAllOf: false,
  parseMarkdown: false,
  purifyHtml: true,
  domPurifyOptions: {},
  show_errors: 'always',
  startCollapsed: true,
  enableCollapseToggle: true,
  subErrors: true,
  translations: {
    en: {
      collapseToggle: ''
    }
  }
}

marked.use({
  extensions: [
    {
      name: 'highlight',
      level: 'inline',
      start(src) {
        return src.indexOf('==')
      },
      tokenizer(src) {
        const match = /^==([\s\S]+?)==/.exec(src)
        if (match) {
          return {
            type: 'highlight',
            raw: match[0],
            text: match[1]
          }
        }
      },
      renderer(token) {
        return `<mark>${token.text}</mark>`
      }
    },
    {
      name: 'admonition',
      level: 'block',
      start(src) {
        return src.indexOf('!!!')
      },
      tokenizer(src) {
        const match =
          /^!!!\s+([\w-]+)(?:\s+"([^"]*)")?\s*\n((?:(?: {4}).*(?:\n|$)|[ \t]*(?:\n|$))*)/.exec(
            src
          )

        if (match) {
          const text = match[3].trim()
          const cleanText = match[3].replace(/^\s{4}/gm, '')

          const token = {
            type: 'admonition',
            raw: match[0],
            variant: match[1],
            title: match[2] !== undefined ? match[2] : match[1],
            text: text,
            tokens: []
          }

          if (text) {
            this.lexer.blockTokens(cleanText, token.tokens)
          }

          return token
        }
      },
      renderer(token) {
        const titleHtml = token.title
          ? `<p class="admonition-title">${token.title}</p>`
          : ''

        const innerHtml = this.parser.parse(token.tokens)

        return `
<div class="admonition ${token.variant}">
  ${titleHtml}
  ${innerHtml}
</div>
`
      }
    }
  ]
})

async function init() {
  try {
    const response = await fetch('./schema/main_config.json')
    if (!response.ok) throw new Error('Schema file not found')

    const raw_schema = await response.json()

    const schema_combined = await bundleSchema(raw_schema) // Combining sub-schemas into single schema file

    schemaReady = structuredClone(schema_combined)
    await RefParser.dereference(schemaReady) // "Dereferencing" schema by Jedison RefParser for it to add x-recursive  where it is necessary

    const layersContainer = document.getElementById('editor-layers')
    const props = schemaReady.properties

    buildSectionMenu()
    buildOptionsMenu()
    const firstKey = Object.keys(props)[0]
    if (firstKey) switchLayer(firstKey)
  } catch (e) {
    console.error('Init Error:', e)
    document.getElementById('editor-layers').innerHTML =
      `<div class="alert alert-danger">${e.message}</div>`
  }
}

function parseInfo(text) {
  const lines = text.split(/\r?\n/)
  const dict = {}
  let currentKey = null
  let currentBuffer = []

  for (const line of lines) {
    if (/^#{4,}/.test(line)) {
      if (currentKey) dict[currentKey] = marked.parse(currentBuffer.join('\n'))
      currentKey = line.replace(/^#+\s*/, '').trim()
      currentBuffer = []
    } else if (currentKey) {
      currentBuffer.push(line)
    }
  }
  if (currentKey) dict[currentKey] = marked.parse(currentBuffer.join('\n'))
  return dict
}

function appendInfo(node, dict, schemaKeys, currentPath = '') {
  if (!node || typeof node !== 'object') return

  if (currentPath) {
    schemaKeys.add(currentPath)
    if (dict[currentPath]) {
      node['x-info'] = { variant: 'modal', content: dict[currentPath] }
    }
  }

  if (node.properties) {
    for (const [propKey, propValue] of Object.entries(node.properties)) {
      appendInfo(
        propValue,
        dict,
        schemaKeys,
        currentPath ? `${currentPath}.${propKey}` : propKey
      )
    }
  }

  ;['allOf', 'anyOf', 'oneOf'].forEach((logicKey) => {
    if (Array.isArray(node[logicKey])) {
      node[logicKey].forEach((subNode) =>
        appendInfo(subNode, dict, schemaKeys, currentPath)
      )
    }
  })

  if (node.items && typeof node.items === 'object') {
    appendInfo(node.items, dict, schemaKeys, currentPath)
  }
}

function compareInfo(key, dict, schemaKeys) {
  const allMdKeys = Object.keys(dict)
  const inSchemaNotInMd = [...schemaKeys].filter((k) => !dict[k])
  const inMdNotInSchema = allMdKeys.filter((k) => !schemaKeys.has(k))

  if (inSchemaNotInMd.length === 0 && inMdNotInSchema.length === 0) return

  console.log(`📊 --- Missmatch in[${key}] ---`)
  console.log(`   In JSON: ${schemaKeys.size} | In MD: ${allMdKeys.length}`)
  if (inSchemaNotInMd.length > 0)
    console.log(`   ❌ In JSON, but not in MD:`, inSchemaNotInMd)
  if (inMdNotInSchema.length > 0)
    console.log(`   ⚠️ In MD, but not in JSON:`, inMdNotInSchema)
}

async function loadSchemaPart(key, value) {
  try {
    const response = await fetch(value.$ref)
    if (!response.ok) return null
    const schemaPart = await response.json()

    const docPath = value.$ref
      .replace('schema/', 'assets/info/')
      .replace('.json', '.md')
    const mdResponse = await fetch(docPath)

    if (mdResponse.ok) {
      const dict = parseInfo(await mdResponse.text())
      const schemaKeys = new Set()
      appendInfo(schemaPart, dict, schemaKeys)
      compareInfo(key, dict, schemaKeys)
    }

    return schemaPart
  } catch (err) {
    console.error(`❌ [${key}] Error:`, err)
    return null
  }
}

async function bundleSchema(rawSchema) {
  await Promise.all(
    Object.entries(rawSchema.$defs).map(async ([key, value]) => {
      const schemaPart = await loadSchemaPart(key, value)
      if (schemaPart) rawSchema.$defs[key] = schemaPart
    })
  )
  return rawSchema
}
function buildSectionMenu() {
  const menu = document.getElementById('main-menu')
  const layersContainer = document.getElementById('editor-layers')
  menu.innerHTML = ''

  Object.keys(schemaReady.properties).forEach((key) => {
    // 1. layer container for this section
    const layer = document.createElement('div')
    layer.id = `layer-${key}`
    layer.className = 'config-layer'
    layersContainer.appendChild(layer)

    // 2. menu link for this section
    const title = schemaReady.$defs?.[key]?.title || key
    const item = document.createElement('div')
    item.className = 'section-link'
    item.setAttribute('data-section', key)
    item.innerHTML = `  
      <input type="checkbox" class="section-checkbox" id="check-${key}">  
      <span class="flex-grow-1 text-truncate">${title}</span>  
    `
    item.querySelector('input').onclick = (e) => {
      e.stopPropagation()
      refreshPreview()
    }
    item.onclick = () => switchLayer(key)
    menu.appendChild(item)
  })
}
function buildOptionsMenu() {
  const layersContainer = document.getElementById('editor-layers')

  const loadLayer = document.createElement('div')
  loadLayer.id = 'layer-load'
  loadLayer.className = 'config-layer'
  loadLayer.innerHTML = `  
    <h3>Upload config</h3>  
    <div class="well">  
      <textarea id="import-area" class="form-control font-monospace mb-3" rows="12" placeholder='{"inbounds": [...], "outbounds": [...]}'></textarea>
      <input type="file" id="config-file" accept=".json,application/json" class="d-none">  
      <button class="btn btn-outline-primary" onclick="loadConfig()">Apply config</button> 
      <button class="btn btn-outline-primary" onclick="document.getElementById('config-file').click()">Upload file</button>   
    </div>  
  `
  layersContainer.appendChild(loadLayer)

  setupImportHandlers()

  function addBtn(id, text, onclick, iconClass) {
    const optionsMenu = document.getElementById('options')

    const btn = document.createElement('button')
    btn.id = id
    btn.className = 'btn btn-sm btn-outline-secondary'

    if (iconClass) {
      const icon = document.createElement('i')
      icon.className = `bi ${iconClass} me-2`
      btn.appendChild(icon)
    }

    btn.appendChild(document.createTextNode(text ? ` ${text}` : ''))

    if (onclick) {
      btn.onclick = onclick
    }

    optionsMenu.appendChild(btn)
  }

  addBtn(
    'upload-config',
    'UPLOAD CONFIG',
    () => switchLayer('load'),
    'bi-cloud-arrow-up-fill'
  )

  addBtn('clear-config', 'CLEAR CONFIG', () => clearConfig(), 'bi-eraser-fill')
  addBtn(
    'clear-section',
    'CLEAR CURRENT SECTION',
    () => clearCurrentSection(),
    'bi-eraser-fill'
  )
  addBtn('mask-sensitive', 'MASK SENSITIVE INFO', undefined, 'bi-incognito')
  addBtn('generate', 'GENERATE STUFF', undefined, 'bi-tools')
  document.getElementById('mask-sensitive').disabled = true
  document.getElementById('generate').disabled = true
}
function setupImportHandlers() {
  const importArea = document.getElementById('import-area')
  const configFile = document.getElementById('config-file')

  configFile.addEventListener('change', (e) => {
    const file = e.target.files[0]
    if (!file) return
    readFileIntoTextarea(file, importArea)
  })

  importArea.addEventListener('dragover', (e) => {
    e.preventDefault()
    importArea.classList.add('drag-over')
  })

  importArea.addEventListener('dragleave', () => {
    importArea.classList.remove('drag-over')
  })

  importArea.addEventListener('drop', (e) => {
    e.preventDefault()
    importArea.classList.remove('drag-over')
    const file = e.dataTransfer.files[0]
    if (!file) return
    readFileIntoTextarea(file, importArea)
  })
}
function readFileIntoTextarea(file, textarea) {
  const reader = new FileReader()
  reader.onload = (event) => {
    textarea.value = event.target.result
  }
  reader.readAsText(file)
}
function switchLayer(key) {
  document
    .querySelectorAll('.section-link')
    .forEach((el) => el.classList.remove('active'))
  const activeLink = document.querySelector(`[data-section="${key}"]`)
  if (activeLink) activeLink.classList.add('active')

  document
    .querySelectorAll('.config-layer')
    .forEach((el) => (el.style.display = 'none'))
  const targetLayer = document.getElementById(`layer-${key}`)
  targetLayer.style.display = 'block'

  if (key !== 'load' && !instances[key]) {
    instances[key] = new Jedison.Create({
      container: targetLayer,
      id: key,
      schema: schemaReady.properties[key],
      ...JedisonOptions
    })

    instances[key].on('change', () => {
      refreshPreview()
    })
  }
  // Disable clear section button while active layer isn't real config layer.
  const clearSectionBtn = document.getElementById('clear-section')
  if (clearSectionBtn) {
    clearSectionBtn.disabled = key === 'load'
  }

  refreshPreview()
}
function loadConfig() {
  const fileInput = document.getElementById('config-file')

  if (fileInput && fileInput.files && fileInput.files[0]) {
    const file = fileInput.files[0]
    const reader = new FileReader()

    reader.onload = function (e) {
      try {
        applyConfig(parseConfigInput(e.target.result))
      } catch (err) {
        alert('Error reading from JSON: ' + err.message)
      }
    }
    reader.readAsText(file)
  } else {
    const rawValue = document.getElementById('import-area')?.value
    try {
      applyConfig(parseConfigInput(rawValue))
    } catch (err) {
      alert('Error while parsing JSON: ' + err.message)
    }
  }
}

function parseConfigInput(rawValue) {
  const cleaned =
    typeof rawValue === 'string'
      ? rawValue.replace(/^\uFEFF/, '').trim()
      : rawValue

  try {
    return JSON.parse(cleaned)
  } catch (fullParseErr) {
    try {
      return JSON.parse(`{${cleaned}}`.replace(/,(\s*[}\]])/g, '$1'))
    } catch (fragmentParseErr) {
      try {
        return JSON.parse(cleaned.replace(/,(\s*[}\]])/g, '$1'))
      } catch (trailingCommaErr) {
        throw fullParseErr
      }
    }
  }
}
function applyConfig(config) {
  let finalDataToLoad = config

  Object.keys(schemaReady.properties).forEach((key) => {
    const checkbox = document.getElementById(`check-${key}`)
    if (checkbox) {
      checkbox.checked = false
    }

    if (instances[key]) {
      instances[key].setValue(instances[key].schema.type === 'array' ? [] : {})
    }
  })

  Object.keys(schemaReady.properties).forEach((key) => {
    if (finalDataToLoad[key]) {
      if (!instances[key]) {
        switchLayer(key)
      }

      if (instances[key]) {
        instances[key].setValue(finalDataToLoad[key])
        finalDataToLoad[key] = instances[key].getValue()
        const checkbox = document.getElementById(`check-${key}`)
        if (checkbox) {
          checkbox.checked = true
        }
      }
    }
  })

  if (schemaReady.properties['log']) {
    switchLayer('log')
  }

  refreshPreview()
}
function cleanData(data) {
  if (Array.isArray(data)) {
    return data.map((item) => cleanData(item))
  } else if (data !== null && typeof data === 'object') {
    const newObj = {}
    for (const key in data) {
      if (key !== 'x-tag' && !key.startsWith('_')) {
        newObj[key] = cleanData(data[key])
      }
    }
    return newObj
  }
  return data
}
function refreshPreview() {
  const finalConfig = {}

  Object.keys(schemaReady.properties).forEach((key) => {
    const checkbox = document.getElementById(`check-${key}`)

    if (checkbox?.checked && instances[key]) {
      const rawData = instances[key].getValue()

      if (rawData && Object.keys(rawData).length > 0) {
        finalConfig[key] = cleanData(rawData)
      }
    }
  })

  const previewBox = document.querySelector('#json-preview code')
  if (previewBox) {
    previewBox.textContent = JSON.stringify(finalConfig, null, 2)
  }
}
function clearConfig() {
  Object.keys(schemaReady.properties).forEach((key) => {
    const checkbox = document.getElementById(`check-${key}`)
    if (checkbox) checkbox.checked = false

    if (instances[key]) {
      instances[key].setValue(
        Array.isArray(instances[key].getValue()) ? [] : {}
      )
    }
  })
  refreshPreview()
}
function clearCurrentSection() {
  const activeLink = document.querySelector('.section-link.active')
  const key = activeLink?.getAttribute('data-section')
  if (!key || key === 'load' || !instances[key]) return

  instances[key].setValue(instances[key].schema.type === 'array' ? [] : {})

  const checkbox = document.getElementById(`check-${key}`)
  if (checkbox) checkbox.checked = false

  refreshPreview()
}
function setupCopyButton(btn, getCode) {
  const originalHtml = btn.innerHTML
  let revertTimeout = null

  btn.addEventListener('click', function () {
    const code = getCode()
    if (code === undefined) return

    navigator.clipboard
      .writeText(code)
      .then(() => {
        if (revertTimeout) clearTimeout(revertTimeout)

        btn.innerHTML = '<i class="my-icon my-icon-check"></i> Copied!'

        btn.classList.remove('success')
        void btn.offsetWidth
        btn.classList.add('success')

        revertTimeout = setTimeout(() => {
          btn.innerHTML = originalHtml
          btn.classList.remove('success')
          revertTimeout = null
        }, 2000)
      })
      .catch((err) => {})
  })
}
function playSuccessAnimation(btn) {
  btn.classList.remove('success')
  void btn.offsetWidth
  btn.classList.add('success')
}
setupCopyButton(
  document.getElementById('copy-btn'),
  () => document.getElementById('json-preview').innerText
)

setupCopyButton(document.getElementById('copy-section'), () => {
  const activeLink = document.querySelector('.section-link.active')
  const key = activeLink?.getAttribute('data-section')
  if (!key || key === 'load' || !instances[key]) return undefined

  const rawData = instances[key].getValue()
  const body = JSON.stringify(cleanData(rawData), null, 2)

  return `"${key}": ${body}`
})
window.onload = init
window.loadConfig = loadConfig

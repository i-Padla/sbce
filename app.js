// import Jedison from './assets/jedison/1.13.0/src/index.js'
import Jedison from './assets/jedison/custom.js'
let instances = {}
let schema_ready = null
const RefParser = new Jedison.RefParser()
const JedisonOptions = {
  theme: new Jedison.Custom.Bootstrap(),
  // iconLib: 'bootstrap-icons',
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
  subErrors: true
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
          /^!!!\s+([\w-]+)(?:\s+"([^"]*)")?\s*\n((?:(?: {4}|\t).*(?:\n|$)|[ \t]*(?:\n|$))*)/.exec(
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

const init = async () => {
  try {
    const response = await fetch('./schema/main_config.json')
    if (!response.ok) throw new Error('Schema file not found')

    const raw_schema = await response.json()

    const schema_combined = await bundleSchema(raw_schema) // Combining sub-schemas into single schema file

    schema_ready = structuredClone(schema_combined)
    await RefParser.dereference(schema_ready) // "Dereferencing" schema by Jedison RefParser for it to add x-recursive  where it is necessary

    const layersContainer = document.getElementById('editor-layers')
    const props = schema_ready.properties

    // Preparing layers for menu section
    Object.keys(props).forEach((key) => {
      const layer = document.createElement('div')
      layer.id = `layer-${key}`
      layer.className = 'config-layer'
      layersContainer.appendChild(layer)
    })

    // Layer for Config Upload
    const loadLayer = document.createElement('div')
    loadLayer.id = 'layer-load'
    loadLayer.className = 'config-layer'
    loadLayer.innerHTML = `
                    <h3>Upload config</h3>
                    <div class="well">
                        <textarea id="import-area" class="form-control font-monospace mb-3" rows="12" placeholder='{"inbounds": [...], "outbounds": [...]}'></textarea>
                        <button class="btn btn-primary" onclick="loadConfig()">Apply config</button>
                    </div>
                `
    layersContainer.appendChild(loadLayer)
    buildMenu()

    const firstKey = Object.keys(props)[0]
    if (firstKey) switchLayer(firstKey)
  } catch (e) {
    console.error('Init Error:', e)
    document.getElementById('editor-layers').innerHTML =
      `<div class="alert alert-danger">${e.message}</div>`
  }
}

async function bundleSchema(rawSchema) {
  await Promise.all(
    Object.entries(rawSchema.$defs).map(async ([key, value]) => {
      try {
        const response = await fetch(value.$ref)
        if (!response.ok) return
        const schemaPart = await response.json()

        const docPath = value.$ref
          .replace('schema/', 'assets/info/')
          .replace('.json', '.md')
        const mdResponse = await fetch(docPath)

        if (mdResponse.ok) {
          const text = await mdResponse.text()
          const lines = text.split(/\r?\n/)

          const dict = {}
          let currentKey = null
          let currentBuffer = []

          for (const line of lines) {
            if (/^#{4,}/.test(line)) {
              if (currentKey)
                dict[currentKey] = marked.parse(currentBuffer.join('\n'))
              currentKey = line.replace(/^#+\s*/, '').trim()
              currentBuffer = []
            } else if (currentKey) {
              currentBuffer.push(line)
            }
          }
          if (currentKey)
            dict[currentKey] = marked.parse(currentBuffer.join('\n'))

          const schemaKeys = new Set()
          const matchedMdKeys = new Set()

          const injectDescriptions = (node, currentPath = '') => {
            if (!node || typeof node !== 'object') return

            if (currentPath) {
              schemaKeys.add(currentPath)

              if (dict[currentPath]) {
                matchedMdKeys.add(currentPath)
                node['x-info'] = {
                  variant: 'modal',
                  content: dict[currentPath]
                }
              }
            }

            if (node.properties) {
              for (const [propKey, propValue] of Object.entries(
                node.properties
              )) {
                const nextPath = currentPath
                  ? `${currentPath}.${propKey}`
                  : propKey
                injectDescriptions(propValue, nextPath)
              }
            }

            ;['allOf', 'anyOf', 'oneOf'].forEach((logicKey) => {
              if (Array.isArray(node[logicKey])) {
                node[logicKey].forEach((subNode) => {
                  injectDescriptions(subNode, currentPath)
                })
              }
            })

            if (node.items && typeof node.items === 'object') {
              injectDescriptions(node.items, currentPath)
            }
          }

          injectDescriptions(schemaPart)

          const allMdKeys = Object.keys(dict)
          const inSchemaNotInMd = [...schemaKeys].filter((k) => !dict[k])
          const inMdNotInSchema = allMdKeys.filter((k) => !schemaKeys.has(k))

          if (inSchemaNotInMd.length > 0 || inMdNotInSchema.length > 0) {
            console.log(`📊 --- Missmatch in[${key}] ---`)
            console.log(
              `   In JSON: ${schemaKeys.size} | In MD: ${allMdKeys.length}`
            )

            if (inSchemaNotInMd.length > 0) {
              console.log(`   ❌ In JSON, but not in MD:`, inSchemaNotInMd)
            }
            if (inMdNotInSchema.length > 0) {
              console.log(`   ⚠️ In MD, but not in JSON:`, inMdNotInSchema)
            }
          }
        }

        rawSchema.$defs[key] = schemaPart
      } catch (err) {
        console.error(`❌ [${key}] Error:`, err)
      }
    })
  )

  return rawSchema
}
function buildMenu() {
  const menu = document.getElementById('main-menu')
  menu.innerHTML = ''

  Object.keys(schema_ready.properties).forEach((key) => {
    const title = schema_ready.$defs?.[key]?.title || key
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

  const loadItem = document.createElement('div')
  loadItem.className = 'section-link'
  loadItem.setAttribute('data-section', 'load')
  loadItem.innerHTML = `
                <i class="my-icon my-icon-upload me-2"></i>
                <span class="flex-grow-1 text-truncate">Upload config</span>
            `
  loadItem.onclick = () => switchLayer('load')
  menu.appendChild(loadItem)
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
      schema: schema_ready.properties[key],
      // refParser: globalRefParser,
      ...JedisonOptions
    })

    instances[key].on('change', () => {
      refreshPreview()
    })
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
        const config = JSON.parse(e.target.result)
        applyConfig(config)
      } catch (err) {
        alert('Error reading from JSON: ' + err.message)
      }
    }
    reader.readAsText(file)
  } else {
    const rawValue = document.getElementById('import-area')?.value
    try {
      const config = JSON.parse(rawValue)
      applyConfig(config)
    } catch (err) {
      alert('Error while parsing JSON: ' + err.message)
    }
  }
}
function applyConfig(config) {
  let finalDataToLoad = config

  Object.keys(schema_ready.properties).forEach((key) => {
    const checkbox = document.getElementById(`check-${key}`)
    if (checkbox) {
      checkbox.checked = false
    }

    if (instances[key]) {
      instances[key].setValue(instances[key].schema.type === 'array' ? [] : {})
    }
  })

  Object.keys(schema_ready.properties).forEach((key) => {
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

  if (schema_ready.properties['log']) {
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

  Object.keys(schema_ready.properties).forEach((key) => {
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
document.getElementById('copy-btn').addEventListener('click', function () {
  const code = document.getElementById('json-preview').innerText
  const btn = this

  navigator.clipboard
    .writeText(code)
    .then(() => {
      const originalHtml = btn.innerHTML
      btn.innerHTML = '<i class="my-icon my-icon-check"></i> COPIED!'
      btn.classList.add('success')

      setTimeout(() => {
        btn.innerHTML = originalHtml
        btn.classList.remove('success')
      }, 2000)
    })
    .catch((err) => {
      console.error('Ошибка при копировании: ', err)
    })
})
window.onload = init
window.loadConfig = loadConfig

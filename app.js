let instances = {};
let schema_ready = null;
let schema_for_ajv = null;
let globalRefParser = null;
import { BooleanToggle, TextareaArrayEditor } from "./assets/custom.editors.js";
// import { infoDictionary } from "./assets/info/infoDictionary.js";


const AjvConstructor = window.ajv2020;
let ajv = null;

//----------------- Fix for properties pop-up dialog window, so it foesn't  scroll up.
(function () {
  const scrollRegistry = new WeakMap();

  const restoreScroll = (dialog) => {
    const savedScroll = scrollRegistry.get(dialog);
    if (savedScroll !== undefined && dialog.scrollTop !== savedScroll) {
      dialog.scrollTop = savedScroll;
    }
  };

  document.addEventListener(
    "mousedown",
    (e) => {
      const dialog = e.target.closest("dialog.jedi-properties-slot");
      if (!dialog) return;

      scrollRegistry.set(dialog, dialog.scrollTop);
      dialog.dataset.focusLock = "true";
    },
    true,
  );

  document.addEventListener(
    "mouseup",
    (e) => {
      const dialog = e.target.closest("dialog.jedi-properties-slot");
      if (!dialog) return;

      requestAnimationFrame(() => {
        restoreScroll(dialog);
        requestAnimationFrame(() => {
          restoreScroll(dialog);
          dialog.dataset.focusLock = "false";
        });
      });
    },
    true,
  );

  document.addEventListener(
    "focusin",
    (e) => {
      const dialog = e.target.closest("dialog.jedi-properties-slot");
      if (!dialog || dialog.dataset.focusLock !== "true") return;

      restoreScroll(dialog);
    },
    true,
  );
})();
// ------------------------------------------------------------------------------------

if (AjvConstructor) {
  ajv = new AjvConstructor({
    coerceTypes: "array",
    useDefaults: false,
    discriminator: true,
    allErrors: true,
    inlineRefs: false,
    strict: false,
  });
  ajv.addKeyword({
    keyword: "x-stringToPropertie",
    modifying: true,
    compile: function (targetProperty) {
      return function (data, dataCxt) {
        if (typeof data === "string") {
          dataCxt.parentData[dataCxt.parentDataProperty] = {
            [targetProperty]: data,
          };
        }
        return true;
      };
    },
  });
} else {
  console.error("Библиотека ajv2020 не найдена в window.");
}

const init = async () => {
  try {
    const response = await fetch("./schema/main_config.json");
    if (!response.ok) throw new Error("Schema file not found");

    const raw_schema = await response.json();

    schema_for_ajv = await bundleSchema(raw_schema); // Combining sub-schemas into single schema file

    schema_ready = structuredClone(schema_for_ajv);
    globalRefParser = new Jedison.RefParser();
    await globalRefParser.dereference(schema_ready); // "Dereferencing" schema by Jedison RefParser for it to add x-recursive to rucursive parts of the schema.

    const layersContainer = document.getElementById("editor-layers");
    const props = schema_ready.properties;

    // Preparing layers for menu section
    Object.keys(props).forEach((key) => {
      const layer = document.createElement("div");
      layer.id = `layer-${key}`;
      layer.className = "config-layer";
      layersContainer.appendChild(layer);
    });

    // Layer for Config Upload
    const loadLayer = document.createElement("div");
    loadLayer.id = "layer-load";
    loadLayer.className = "config-layer";
    loadLayer.innerHTML = `
                    <h3>Upload config</h3>
                    <div class="well">
                        <textarea id="import-area" class="form-control font-monospace mb-3" rows="12" placeholder='{"inbounds": [...], "outbounds": [...]}'></textarea>
                        <button class="btn btn-primary" onclick="loadConfig()">Apply config</button>
                    </div>
                `;
    layersContainer.appendChild(loadLayer);
    buildMenu();

    const firstKey = Object.keys(props)[0];
    if (firstKey) switchLayer(firstKey);
  } catch (e) {
    console.error("Init Error:", e);
    document.getElementById("editor-layers").innerHTML =
      `<div class="alert alert-danger">${e.message}</div>`;
  }
};

async function bundleSchema(rawSchema) {
  await Promise.all(Object.entries(rawSchema.$defs).map(async ([key, value]) => {
    try {
      const response = await fetch(value.$ref);
      if (!response.ok) return;
      const schemaPart = await response.json();

      const docPath = value.$ref.replace('schema/', 'assets/info/').replace('.json', '.md');
      const mdResponse = await fetch(docPath);

      if (mdResponse.ok) {
        const text = await mdResponse.text();
        const lines = text.split(/\r?\n/);

        const dict = {};
        let currentKey = null;
        let currentBuffer = [];

        for (const line of lines) {
          if (/^#{4,}/.test(line)) {
            if (currentKey) dict[currentKey] = marked.parse(currentBuffer.join('\n'));
            currentKey = line.replace(/^#+\s*/, '').trim();
            currentBuffer = [];
          } else if (currentKey) {
            currentBuffer.push(line);
          }
        }
        if (currentKey) dict[currentKey] = marked.parse(currentBuffer.join('\n'));


        const injectDescriptions = (node, currentPath = "") => {
          if (!node || typeof node !== 'object') return;

          if (currentPath && dict[currentPath]) {
            node['x-info'] = { variant: "modal", content: dict[currentPath] };
            console.log(`✅ [${key}] Добавлено описание для: ${currentPath}`);
          }

          if (node.properties) {
            for (const [propKey, propValue] of Object.entries(node.properties)) {
              const nextPath = currentPath ? `${currentPath}.${propKey}` : propKey;
              injectDescriptions(propValue, nextPath);
            }
          }
        };

        injectDescriptions(schemaPart);
      }

      rawSchema.$defs[key] = schemaPart;
    } catch (err) {
      console.error(`❌ [${key}] Ошибка обработки:`, err);
    }
  }));

  return rawSchema;
}
function buildMenu() {
  const menu = document.getElementById("main-menu");
  menu.innerHTML = "";

  Object.keys(schema_ready.properties).forEach((key) => {
    const title = schema_ready.$defs?.[key]?.title || key;
    const item = document.createElement("div");
    item.className = "section-link";
    item.setAttribute("data-section", key);

    item.innerHTML = `
                    <input type="checkbox" class="section-checkbox" id="check-${key}">
                    <span class="flex-grow-1 text-truncate">${title}</span>
                `;

    item.querySelector("input").onclick = (e) => {
      e.stopPropagation();
      refreshPreview();
    };

    item.onclick = () => switchLayer(key);
    menu.appendChild(item);
  });

  const loadItem = document.createElement("div");
  loadItem.className = "section-link";
  loadItem.setAttribute("data-section", "load");
  loadItem.innerHTML = `
                <i class="my-icon my-icon-save me-2"></i>
                <span class="flex-grow-1 text-truncate">Upload config</span>
            `;
  loadItem.onclick = () => switchLayer("load");
  menu.appendChild(loadItem);
}
function switchLayer(key) {
  document
    .querySelectorAll(".section-link")
    .forEach((el) => el.classList.remove("active"));
  const activeLink = document.querySelector(`[data-section="${key}"]`);
  if (activeLink) activeLink.classList.add("active");

  document
    .querySelectorAll(".config-layer")
    .forEach((el) => (el.style.display = "none"));
  const targetLayer = document.getElementById(`layer-${key}`);
  targetLayer.style.display = "block";

  if (key !== "load" && !instances[key]) {
    console.log(`Инициализация секции: ${key}`);
    instances[key] = new Jedison.Create({
      container: targetLayer,
      id: key,
      refParser: globalRefParser,
      theme: new Jedison.ThemeBootstrap5(),
      iconLib: "custom",
      schema: schema_ready.properties[key],
      customEditors: [BooleanToggle, TextareaArrayEditor],
      enablePropertiesToggle: true,
      deactivateNonRequired: true,
      objectAdd: false,
      btnContents: true,
      mergeAllOf: true,
      parseMarkdown: false,
      purifyHtml: true,
      domPurifyOptions: {},
      show_errors: "always",
      subErrors: true,
    });

    instances[key].on("change", () => {
      refreshPreview();
    });
  }

  refreshPreview();
}
function loadConfig() {
  const fileInput = document.getElementById("config-file");

  if (fileInput && fileInput.files && fileInput.files[0]) {
    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onload = function (e) {
      try {
        const config = JSON.parse(e.target.result);
        applyConfig(config);
      } catch (err) {
        alert("Ошибка чтения JSON из файла: " + err.message);
      }
    };
    reader.readAsText(file);
  } else {
    const rawValue = document.getElementById("import-area")?.value;
    try {
      const config = JSON.parse(rawValue);
      applyConfig(config);
    } catch (err) {
      alert("Ошибка разбора JSON: " + err.message);
    }
  }
}
function applyConfig(config) {
  if (!ajv || !schema_for_ajv) {
    alert("Критическая ошибка: Ajv или схема не инициализированы.");
    return;
  }

  let finalDataToLoad = config;

  try {
    const validate = ajv.compile(schema_for_ajv);

    // Normalizing user config by adding type=inline to route rule-sets without type.
    for (const item of config.route?.rule_set ?? []) {
      if (!item.type && item.rules) {
        item.type = "inline";
      }
    }
    // Normalizing user config by deleting rewrite_ttl and client_subnet fields if they are ==== null
    for (const rule of config.dns?.rules ?? []) {
      if (rule.rewrite_ttl === null) {
        delete rule.rewrite_ttl;
      }

      if (rule.client_subnet === null) {
        delete rule.client_subnet;
      }
    }

    const isValid = validate(config);

    if (!isValid) {
      console.warn(
        "Предупреждение при валидации импортируемого конфига:",
        validate.errors,
      );
    }

    finalDataToLoad = config;
  } catch (err) {
    console.error("Ошибка автоматической нормализации через Ajv:", err);
    alert(
      "Не удалось автоматически нормализовать конфиг через Ajv. Пробуем загрузить как есть.",
    );
  }

  Object.keys(schema_ready.properties).forEach((key) => {
    const checkbox = document.getElementById(`check-${key}`);
    if (checkbox) {
      checkbox.checked = false;
    }

    if (instances[key]) {
      instances[key].setValue(instances[key].schema.type === "array" ? [] : {});
    }
  });

  Object.keys(schema_ready.properties).forEach((key) => {
    if (finalDataToLoad[key]) {
      if (!instances[key]) {
        switchLayer(key);
      }

      if (instances[key]) {
        instances[key].setValue(finalDataToLoad[key]);
        finalDataToLoad[key] = instances[key].getValue();
        const checkbox = document.getElementById(`check-${key}`);
        if (checkbox) {
          checkbox.checked = true;
        }
      }
    }
  });

  if (schema_ready.properties["log"]) {
    switchLayer("log");
  }

  refreshPreview();
}
function cleanData(data) {
  if (Array.isArray(data)) {
    return data.map((item) => cleanData(item));
  } else if (data !== null && typeof data === "object") {
    const newObj = {};
    for (const key in data) {
      if (key !== "x-tag" && !key.startsWith("_")) {
        newObj[key] = cleanData(data[key]);
      }
    }
    return newObj;
  }
  return data;
}

function refreshPreview() {
  const finalConfig = {};

  Object.keys(schema_ready.properties).forEach((key) => {
    const checkbox = document.getElementById(`check-${key}`);

    if (checkbox?.checked && instances[key]) {
      const rawData = instances[key].getValue();

      if (rawData && Object.keys(rawData).length > 0) {
        finalConfig[key] = cleanData(rawData);
      }
    }
  });

  const previewBox = document.querySelector("#json-preview code");
  if (previewBox) {
    previewBox.textContent = JSON.stringify(finalConfig, null, 2);
  }
}
document.getElementById("copy-btn").addEventListener("click", function () {
  const code = document.getElementById("json-preview").innerText;
  const btn = this;

  navigator.clipboard
    .writeText(code)
    .then(() => {
      const originalHtml = btn.innerHTML;
      btn.innerHTML = '<i class="fa-solid fa-check"></i> COPIED!';
      btn.classList.add("success");

      setTimeout(() => {
        btn.innerHTML = originalHtml;
        btn.classList.remove("success");
      }, 2000);
    })
    .catch((err) => {
      console.error("Ошибка при копировании: ", err);
    });
});
window.onload = init;
window.loadConfig = loadConfig;

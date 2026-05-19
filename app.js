let instances = {};
let schema_ready = null;
let schema_for_ajv = null;
let globalRefParser = null;
let debounceTimer;


const AjvConstructor = window.ajv2020;
let ajv = null;

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
    modifying: true, // Позволяет изменять данные на лету
    compile: function (targetProperty) {
      // targetProperty — это строка с именем поля, куда нужно положить значение (например, "server")
      return function (data, dataCxt) {
        if (typeof data === "string") {
          // Заменяем строку на объект нужного формата прямо в родительском объекте
          dataCxt.parentData[dataCxt.parentDataProperty] = {
            [targetProperty]: data
          };
        }
        return true; // Валидация пройдена
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
    await globalRefParser.dereference(schema_ready); // Dereferencing schema by native Jedison RefParser because of reasons

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
  const entries = Object.entries(rawSchema.$defs);

  await Promise.all(
    entries.map(async ([key, value]) => {
      try {
        const response = await fetch(value.$ref);

        if (response.ok) {
          rawSchema.$defs[key] = await response.json();
        }
      } catch (err) {
        console.error(`Ошибка в файле ${key}:`, err);
      }
    }),
  );

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
                    <input type="checkbox" checked class="section-checkbox" id="check-${key}">
                    <span class="flex-grow-1 text-truncate">${title}</span>
                `;

    // Чекбокс просто обновляет превью
    item.querySelector("input").onclick = (e) => {
      e.stopPropagation();
      refreshPreview();
    };

    // Клик по тексту переключает слой
    item.onclick = () => switchLayer(key);
    menu.appendChild(item);
  });

  // Добавляем пункт для загрузки конфига в меню только один раз
  const loadItem = document.createElement("div");
  loadItem.className = "section-link";
  loadItem.setAttribute("data-section", "load");
  loadItem.innerHTML = `
                <i class="fa-solid fa-file-import me-2 text-secondary" style="width: 20px;"></i>
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

  // Инициализируем Jedison только для секций со схемой
  if (key !== "load" && !instances[key]) {
    console.log(`Инициализация секции: ${key}`);
    instances[key] = new Jedison.Create({
      container: targetLayer,
      id: key,
      refParser: globalRefParser,
      theme: new Jedison.ThemeBootstrap5(),
      iconLib: "fontawesome6",
      schema: schema_ready.properties[key],
      enablePropertiesToggle: true,
      deactivateNonRequired: true,
      objectAdd: false,
      btnContents: true,
      mergeAllOf: true,
      parseMarkdown: true,
      purifyHtml: true,
      domPurifyOptions: {},
      show_errors: "always",
    });

    instances[key].on("change", () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        refreshPreview();
      }, 250);
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
    // 1. Компилируем нашу глобальную схему
    const validate = ajv.compile(schema_for_ajv);
    // pre-normalization для shorthand inline rule_set
    for (const item of config.route?.rule_set ?? []) {
      if (!item.type && item.rules) {
        item.type = "inline";
      }
    }
    // Проверяем, что секция dns и массив rules вообще существуют
    for (const rule of config.dns?.rules ?? []) {

      if (rule.rewrite_ttl === null) {
        delete rule.rewrite_ttl;
      }

      if (rule.client_subnet === null) {
        delete rule.client_subnet;
      }
    }
    // 2. Валидируем. Ajv автоматически превратит строки в массивы там, где требует схема
    const isValid = validate(config);

    if (!isValid) {
      // Выводим предупреждение, но не блокируем импорт полностью, 
      // чтобы пользователь мог исправить ошибки прямо в интерфейсе
      console.warn("Предупреждение при валидации импортируемого конфига:", validate.errors);
    }

    // В случае успеха или мелких нестыковок используем мутировавший config
    finalDataToLoad = config;

  } catch (err) {
    console.error("Ошибка автоматической нормализации через Ajv:", err);
    alert("Не удалось автоматически нормализовать конфиг через Ajv. Пробуем загрузить как есть.");
  }

  // 3. Распределяем нормализованные данные по инстансам форм
  Object.keys(schema_ready.properties).forEach((key) => {
    if (finalDataToLoad[key]) {
      if (!instances[key]) {
        switchLayer(key);
      }
      if (instances[key]) {
        instances[key].setValue(finalDataToLoad[key]);
      }
      const checkbox = document.getElementById(`check-${key}`);
      if (checkbox) {
        checkbox.checked = true;
      }
    }
  });

  // Принудительный фокус на секцию log
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
      // Если ключ технический — просто пропускаем его
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

    // Если чекбокс активен и инстанс существует
    if (checkbox?.checked && instances[key]) {
      const rawData = instances[key].getValue();

      if (rawData && Object.keys(rawData).length > 0) {
        // ЧИСТИМ СРАЗУ ПРИ ПОЛУЧЕНИИ
        finalConfig[key] = cleanData(rawData);
      }
    }
  });

  const previewBox = document.querySelector("#json-preview code");
  if (previewBox) {
    previewBox.textContent = JSON.stringify(finalConfig, null, 2);
  }
}
window.onload = init;

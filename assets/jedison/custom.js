import Jedison from './1.13.0/src/index.js'
import { isObject, isNumber } from './1.13.0/src/helpers/utils.js'
//Custom extension for toggle-like boolean editor.
class BooleanToggle extends Jedison.EditorBoolean {
  static resolves(e) {
    return e.type === 'boolean' && e['x-format'] === 'toggle'
  }

  build() {
    this.control = this.theme.getCheckboxControl({
      title: this.getTitle(),
      description: this.getDescription(),
      id: this.getIdFromPath(this.instance.path),
      titleHidden: this.instance.schema['x-options']?.titleHidden,
      titleIconClass: this.instance.schema['x-options']?.titleIconClass,
      info: this.getInfo()
    })

    const { formGroup, input, label, info } = this.control

    formGroup.classList.remove('form-check')
    label.classList.remove('form-check-label')
    label.classList.add('form-label', 'mb-1')

    const switchWrapper = document.createElement('div')
    switchWrapper.classList.add(
      'form-check',
      'form-switch',
      'd-flex',
      'align-items-center'
    )

    const statusLabel = document.createElement('span')
    statusLabel.classList.add('ms-2', 'text-muted', 'small')
    this.statusLabel = statusLabel

    formGroup.appendChild(label)
    if (this.getInfo() && info && info.container) {
      formGroup.appendChild(info.container)
    }
    switchWrapper.appendChild(input)
    switchWrapper.appendChild(statusLabel) //
    formGroup.appendChild(switchWrapper)

    input.setAttribute('role', 'switch')

    this.updateStatusText()
  }

  updateStatusText() {
    if (this.statusLabel && this.control?.input) {
      const titles = this.instance.schema['x-enumTitles'] || [
        'Disable',
        'Enable'
      ]

      const falseText = titles[0] || 'off'
      const trueText = titles[1] || 'on'

      this.statusLabel.textContent = this.control.input.checked
        ? trueText
        : falseText
    }
  }

  addEventListeners() {
    this.control.input.addEventListener('change', () => {
      this.instance.setValue(this.control.input.checked, true, 'user')
      this.updateStatusText()
    })
  }

  refreshUI() {
    this.refreshDisabledState()
    this.control.input.checked = this.instance.getValue()
    this.updateStatusText()
  }

  sanitize(e) {
    return Boolean(e)
  }
}
//Custom editor for string or ing\array of string fields.
class TextareaArrayEditor extends Jedison.Editor {
  static resolves(schema) {
    return schema['x-format'] === 'textarea-array'
  }

  build() {
    const schema = this.instance.schema

    this.control = this.theme.getTextareaControl({
      title: this.getTitle(),
      description: this.getDescription(),
      id: this.getIdFromPath(this.instance.path),
      titleIconClass:
        schema['x-options']?.titleIconClass || schema['x-titleIconClass'],
      titleHidden: schema['x-options']?.titleHidden || schema['x-titleHidden'],
      info: this.getInfo()
    })

    if (this.control.info && this.control.info.info) {
      this.control.info.info.setAttribute('data-bs-toggle', 'modal')
    }

    // this.control.input.setAttribute("rows", "5");
    // Вставляем сюда вместо старого rows
    const input = this.control.input
    input.setAttribute('rows', '1') // Стартуем с одной строки, если пусто
    input.style.fieldSizing = 'content' // Включаем автоподгон под контент
    input.style.maxHeight = '5lh' // Ограничиваем высоту строго 5-ю строками
  }

  addEventListeners() {
    this.control.input.addEventListener('change', () => {
      const lines = this.control.input.value
        .split(/[\n,;]+/)
        .map((line) => line.trim())
        .filter((line) => line !== '')
        // --- НОВЫЙ ШАГ: ПРЕОБРАЗОВАНИЕ ТИПОВ ---
        .map((line) => {
          return /^-?\d+$/.test(line) ? parseInt(line, 10) : line
        })

      let finalValue
      if (lines.length === 0) {
        finalValue = ''
      } else if (lines.length === 1) {
        finalValue = lines[0] // Будет либо integer, либо string
      } else {
        finalValue = lines // Будет массив из чистых чисел (или строк)
      }

      this.instance.setValue(finalValue, true, 'user')
    })
  }

  refreshUI() {
    this.refreshDisabledState()
    const value = this.instance.getValue()

    if (document.activeElement !== this.control.input) {
      if (Array.isArray(value)) {
        this.control.input.value = value.join('\n')
      } else if (typeof value === 'string') {
        this.control.input.value = value
      } else {
        this.control.input.value = ''
      }
    }
  }
}
class CheckboxesScalarEditor extends Jedison.Editor {
  static resolves(schema) {
    return (
      schema['x-format'] === 'checkboxes-scalar' && Array.isArray(schema.oneOf)
    )
  }

  _getArrayBranch() {
    return this.instance.schema.oneOf?.find((s) => s.type === 'array')
  }

  build() {
    const branch = this._getArrayBranch()
    const values = branch?.items?.enum || []
    const titles = branch?.items?.['x-enumTitles'] || values

    this.control = this.theme.getCheckboxesControl({
      title: this.getTitle(),
      description: this.getDescription(),
      values,
      titles,
      id: this.getIdFromPath(this.instance.path),
      titleHidden: this.instance.schema['x-options']?.titleHidden,
      info: this.getInfo(),
      inline: true
    })
  }

  addEventListeners() {
    this.control.checkboxes.forEach((checkbox) => {
      checkbox.addEventListener('change', () => {
        const checked = this.control.checkboxes
          .filter((cb) => cb.checked)
          .map((cb) => cb.value)

        const finalValue = checked.length === 1 ? checked[0] : checked
        this.instance.setValue(finalValue, true, 'user')
      })
    })
  }

  refreshUI() {
    this.refreshDisabledState()
    const value = this.instance.getValue()
    const valueArray = Array.isArray(value)
      ? value
      : typeof value === 'string' && value !== ''
        ? [value]
        : []

    this.control.checkboxes.forEach((checkbox) => {
      checkbox.checked = valueArray.includes(checkbox.value)
    })
  }
}

const Editors = [BooleanToggle, TextareaArrayEditor, CheckboxesScalarEditor]

export default { Editors }

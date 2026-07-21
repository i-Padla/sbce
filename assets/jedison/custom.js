import Jedison from './1.16.1/src/index_custom.js'
const {
  equal,
  pathToAttribute,
  isObject,
  isNumber,
  isSet,
  isArray,
  isString,
  different,
  clone,
  mergeDeep,
  combineDeep,
  hasOwn
} = Jedison.Utils
const {
  getSchemaAnyOf,
  getSchemaDescription,
  getSchemaOneOf,
  getSchemaTitle,
  getSchemaType,
  getSchemaXOption,
  getSchemaElse,
  getSchemaIf,
  getSchemaThen,
  getSchemaPrefixItems,
  getSchemaItems
} = Jedison.Schema
// #region InstaceObject.sortChildrenByPropertyOrder() changes - new sorting logic in order of importance:
// propertyOrder value > parent object propertyOrder map value > property postion in schema > everything else.
Jedison.InstanceObject.prototype.sortChildrenByPropertyOrder = function () {
  const parentOrderMap = getSchemaXOption(this.schema, 'propertyOrder')
  const isParentMap = isObject(parentOrderMap)

  // O(m) once, instead of O(m) per comparison
  const schemaKeyIndex = Object.fromEntries(
    Object.keys(this.properties).map((k, i) => [k, i])
  )

  // Pre-compute bucket+value for each child — O(n) total
  const cache = new Map(
    this.children.map((child) => {
      const key = child.getKey()
      const perProp = getSchemaXOption(child.schema, 'propertyOrder')
      const hasPerProp = isNumber(perProp)
      const parentVal =
        isParentMap && isNumber(parentOrderMap[key])
          ? parentOrderMap[key]
          : null
      const schemaIdx = schemaKeyIndex[key] ?? -1

      const bucket = hasPerProp
        ? 0
        : parentVal !== null
          ? 1
          : schemaIdx !== -1
            ? 2
            : 3
      const value =
        bucket === 0 ? perProp : bucket === 1 ? parentVal : schemaIdx
      return [child, { bucket, value }]
    })
  )

  // Sort is now O(n log n) with O(1) comparisons
  this.children = this.children.sort((a, b) => {
    const oa = cache.get(a),
      ob = cache.get(b)
    return oa.bucket !== ob.bucket ? oa.bucket - ob.bucket : oa.value - ob.value
  })
}
// #endregion
// #region InstanceObject.createChild fixes. Sorting editors on child creation.
Jedison.InstanceObject.prototype.createChild = function (
  schema,
  key,
  value,
  activate = false
) {
  const instance = this.jedison.createInstance({
    jedison: this.jedison,
    schema: schema,
    path: this.path + this.jedison.pathSeparator + key,
    parent: this,
    value: clone(value)
  })

  this.children.push(instance)
  this.value[key] = instance.getValue()

  const deactivateNonRequired =
    getSchemaXOption(this.schema, 'deactivateNonRequired') ??
    this.jedison.getOption('deactivateNonRequired')

  if (
    !this.isRequired(key) &&
    isSet(deactivateNonRequired) &&
    deactivateNonRequired === true &&
    !activate
  ) {
    instance.deactivate()
  }
  this.sortChildrenByPropertyOrder() // Added sorting when turning object properties on\off
  this.onChildChange()

  return instance
}
// #endregion
// #region EditorObject.refreshPropertiesSlot fixes. Saving\restoring scroll bar position, different sotring logic, always disable checkboxes of required properties
Jedison.EditorObject.prototype.refreshPropertiesSlot = function () {
  const schemaOptionEnablePropertiesToggle =
    getSchemaXOption(this.instance.schema, 'enablePropertiesToggle') ??
    this.instance.jedison.getOption('enablePropertiesToggle')

  if (equal(schemaOptionEnablePropertiesToggle, true)) {
    const declaredProperties = Object.keys(this.instance.properties)
    const instanceProperties = this.instance.children.map((child) =>
      child.getKey()
    )
    const properties = [
      ...new Set([...declaredProperties, ...instanceProperties])
    ]

    // #region New feature - sorting propertis in modal window
    const parentOrderMap = getSchemaXOption(
      this.instance.schema,
      'propertyOrder'
    )
    const isParentMap = isObject(parentOrderMap)

    const schemaKeyIndex = Object.fromEntries(
      declaredProperties.map((k, i) => [k, i])
    )

    const cache = new Map(
      properties.map((prop) => {
        const schema = this.instance.getPropertySchema(prop)

        // Priority 1: per-property x-propertyOrder
        const perProp = getSchemaXOption(schema, 'propertyOrder')
        const hasPerProp = isNumber(perProp)

        // Priority 2: parent map
        const parentVal =
          isParentMap && isNumber(parentOrderMap[prop])
            ? parentOrderMap[prop]
            : null
        const hasParentMap = parentVal !== null

        // Priority 3: schema definition order
        const schemaIdx = schemaKeyIndex[prop] ?? -1

        const bucket = hasPerProp
          ? 0
          : hasParentMap
            ? 1
            : schemaIdx !== -1
              ? 2
              : 3
        const value =
          bucket === 0 ? perProp : bucket === 1 ? parentVal : schemaIdx

        return [prop, { bucket, value }]
      })
    )

    // Sort is now O(n log n) with O(1) comparisons
    properties.sort((a, b) => {
      const oa = cache.get(a),
        ob = cache.get(b)
      return oa.bucket !== ob.bucket
        ? oa.bucket - ob.bucket
        : oa.value - ob.value
    })
    // #endregion

    this.control.propertiesActivators.replaceChildren()

    const { container: defaultGroupContainer, group: defaultGroup } =
      this.theme.getPropertiesGroup()

    this.control.propertiesActivators.appendChild(defaultGroupContainer)

    const propertiesGroups = {}
    const currentValue = this.instance.getValue()

    properties.forEach((property) => {
      const isRequired = this.instance.isRequired(property)
      const ariaLive = this.control.ariaLive
      const schema = this.instance.getPropertySchema(property)
      const schemaTitle = getSchemaTitle(schema)
      const path =
        this.instance.path + this.instance.jedison.pathSeparator + property
      const id = pathToAttribute(path) + '-activator'
      const title = isSet(schemaTitle) ? schemaTitle : property

      const checkboxControl = this.theme.getCheckboxControl({
        id: id,
        title: title,
        titleHidden: false
      })

      const checkbox = checkboxControl.input
      this.propertyActivators[property] = checkbox

      checkbox.addEventListener('change', () => {
        const scrollTop = this.control.propertiesContainer.scrollTop // Saving scroll position
        ariaLive.innerHTML = ''
        const ariaLiveMessage = this.theme.getAriaLiveMessage()

        if (checkbox.checked) {
          const child = this.instance.getChild(property)

          if (!child) {
            this.instance.createChild(schema, property)
          }

          this.instance.getChild(property).activate()
          ariaLiveMessage.textContent =
            title +
            ' ' +
            this.instance.jedison.translator.translate('objectPropertyAdded')
          ariaLive.appendChild(ariaLiveMessage)
        } else {
          this.instance.getChild(property).deactivate()
          ariaLiveMessage.textContent =
            title +
            ' ' +
            this.instance.jedison.translator.translate('objectPropertyRemoved')
          ariaLive.appendChild(ariaLiveMessage)
        }

        // keeps dialog open
        this.control.propertiesContainer.close()
        this.control.propertiesContainer.showModal()
        this.control.propertiesContainer.scrollTop = scrollTop // Restoring scroll position
      })

      const propGroup = getSchemaXOption(schema, 'propGroup')

      if (isSet(propGroup) && isString(propGroup)) {
        let propertiesGroup = propertiesGroups[propGroup]

        if (!isSet(propertiesGroup)) {
          propertiesGroup = this.theme.getPropertiesGroup({ name: propGroup })
          propertiesGroups[propGroup] = propertiesGroup
        }

        propertiesGroup.group.appendChild(checkboxControl.container)
        this.control.propertiesActivators.appendChild(propertiesGroup.container)
      } else {
        defaultGroup.appendChild(checkboxControl.container)
      }

      checkbox.disabled = this.disabled || isRequired

      // Always disable chekcboxes of required properties.
      if (isRequired) {
        checkbox.setAttribute('always-disabled', '')
      }

      checkbox.checked = hasOwn(currentValue, property)
    })

    const propGroupOrder = getSchemaXOption(
      this.instance.schema,
      'propGroupOrder'
    )

    if (isSet(propGroupOrder) && Array.isArray(propGroupOrder)) {
      const orderedContainers = [defaultGroupContainer]

      propGroupOrder.forEach((groupName) => {
        if (isSet(propertiesGroups[groupName])) {
          orderedContainers.push(propertiesGroups[groupName].container)
        }
      })

      Object.keys(propertiesGroups).forEach((groupName) => {
        if (!propGroupOrder.includes(groupName)) {
          orderedContainers.push(propertiesGroups[groupName].container)
        }
      })

      this.control.propertiesActivators.replaceChildren()

      orderedContainers.forEach((container) => {
        this.control.propertiesActivators.appendChild(container)
      })
    }
  }
}
// #endregion
// #region EditorObject.RefreshEditors optimization
Jedison.EditorObject.prototype.refreshEditors = function () {
  const fragment = document.createDocumentFragment()
  this.instance.children.forEach((child) => {
    const showOptIn = true

    const optIn = this.theme.getCheckboxControl({
      id: child.path + '-opt-in',
      title: child.path + '-opt-in',
      titleHidden: true
    })

    optIn.input.checked = child.isActive

    optIn.input.addEventListener('change', () => {
      if (child.isActive) {
        child.deactivate()
      } else {
        child.activate()
      }
    })

    if (child.isActive) {
      fragment.appendChild(child.ui.control.container)

      // append optIn toggle
      if (showOptIn && child.ui.control.optInContainer) {
        child.ui.control.optInContainer.appendChild(optIn.container)
      }

      // update disabled state directly, without triggering a full child refreshUI()
      child.ui.disabled = this.disabled || this.instance.isReadOnly()
      child.ui.refreshDisabledState()
    } else {
      if (child.ui.control.container.parentNode) {
        child.ui.control.container.parentNode.removeChild(
          child.ui.control.container
        )
      }
    }
  })

  this.control.childrenSlot.replaceChildren(fragment)
}
// #endregion
// #region IfThenElse.prepare fix for when required checkboxes can still be active.
Jedison.InstanceIfThenElse.prototype.prepare = function () {
  this.instances = []
  this.instanceStartingValues = []
  this.instanceWithoutIf = null
  this.activeInstance = null
  this.index = 0
  this.schemas = []
  this.ifThenElseSchemas = []

  this.traverseSchema(this.schema)

  delete this.schema.if
  delete this.schema.then
  delete this.schema.else

  // combineDeep concatenates arrays (e.g. "required"), preventing then/else from overwriting the base schema's required list.
  const CONCAT_KEYS = new Set(['required', 'allOf', 'anyOf', 'oneOf'])

  function mergeIfThenElseSchema(base, branch) {
    const result = clone(base)
    Object.keys(branch).forEach((key) => {
      if (CONCAT_KEYS.has(key) && Array.isArray(branch[key])) {
        result[key] = [...(result[key] ?? []), ...branch[key]]
      } else if (isObject(branch[key]) && isObject(result[key])) {
        result[key] = mergeIfThenElseSchema(result[key], branch[key])
      } else {
        result[key] = branch[key]
      }
    })
    return result
  }
  this.ifThenElseSchemas.forEach((item) => {
    if (isSet(item.then)) {
      this.schemas.push(mergeIfThenElseSchema(this.schema, item.then))
    }

    if (isSet(item.else)) {
      this.schemas.push(mergeIfThenElseSchema(this.schema, item.else))
    }
  })
  //
  const schemaClone = clone(this.schema)
  delete schemaClone.if
  delete schemaClone.then
  delete schemaClone.else

  this.instanceWithoutIf = this.jedison.createInstance({
    jedison: this.jedison,
    schema: schemaClone,
    originalSchema: this.originalSchema,
    path: this.path,
    parent: this.parent,
    arrayTemplateData: this.arrayTemplateData
  })

  this.schemas.forEach((schema) => {
    const instance = this.jedison.createInstance({
      jedison: this.jedison,
      schema: schema,
      originalSchema: this.originalSchema,
      path: this.path,
      parent: this.parent,
      arrayTemplateData: this.arrayTemplateData
    })

    this.instanceStartingValues.push(instance.getValue())

    this.instances.push(instance)
  })

  this.on('set-value', (value, initiator) => {
    this.changeValue(value, initiator)
  })

  const ifValue = this.instanceWithoutIf.getValueRaw()
  this.changeValue(ifValue)
}
// #endregion
// #region Fix for embeded switcher when sub-schema has if-then-else.
// Jedison.EditorMultiple.prototype.refreshUI = function () {
//   // Helper to find deepest ActiveInstance =================================
//   const getDeepActiveInstance = () => {
//     let activeInstance = this.instance.activeInstance
//     while (activeInstance?.activeInstance) {
//       activeInstance = activeInstance.activeInstance
//     }
//     return activeInstance
//   }
//   // =======================================================================

//   this.refreshDisabledState()
//   this.control.childrenSlot.innerHTML = ''
//   this.control.childrenSlot.appendChild(
//     this.instance.activeInstance.ui.control.container
//   )

//   if (this.embedSwitcher) {
//     const slot = getDeepActiveInstance()?.ui?.control?.switcherSlot
//     if (slot) {
//       slot.innerHTML = ''
//       slot.appendChild(this.control.switcher.container)
//       this.control.header.style.display = 'none'
//     } else {
//       this.control.header.style.display = ''
//       this.control.header.appendChild(this.control.switcher.container)
//     }
//   }

//   if (
//     this.switcherInput === 'modal' ||
//     this.switcherInput === 'select-inline'
//   ) {
//     const childControl = getDeepActiveInstance().ui.control
//     const infoContainer = childControl.infoContainer
//     const titleEl = childControl.legendText || childControl.label
//     if (infoContainer) {
//       infoContainer.after(this.control.switcher.container)
//       this.control.header.style.display = 'none'
//     } else if (titleEl) {
//       const infoEl = childControl.info?.container
//       const anchor = infoEl && infoEl.parentNode ? infoEl : titleEl
//       anchor.after(this.control.switcher.container)
//       this.control.header.style.display = 'none'
//     }
//   }

//   if (this.switcherInput === 'select') {
//     this.control.switcher.input.value = this.instance.index
//   }

//   if (this.switcherInput === 'select-inline') {
//     this.control.switcher.input.value = this.instance.index
//   }

//   if (
//     this.switcherInput === 'radios' ||
//     this.switcherInput === 'radios-inline'
//   ) {
//     this.control.switcher.radios.forEach((radio) => {
//       const radioIndex = Number(radio.value)
//       radio.checked = radioIndex === this.instance.index
//     })
//   }

//   if (this.switcherInput === 'modal') {
//     this.control.switcher.triggerText.textContent =
//       this.instance.switcherOptionsLabels[this.instance.index]
//     this.control.switcher.optionButtons.forEach((btn, index) => {
//       this.theme.setSwitcherOptionActive(btn, index === this.instance.index)
//     })
//   }

//   if (this.disabled || this.instance.isReadOnly()) {
//     this.instance.activeInstance.ui.disable()
//   } else {
//     this.instance.activeInstance.ui.enable()
//   }
// }
// #endregion
// #region InstanceMultiple.prepare
// 1) fix for setting uncompatible value type on inactive sub-schemas in multiple instance
// 2) Forwarding arrayTemplateData when InstanceMultiple creates its sub-instances
Jedison.InstanceMultiple.prototype.prepare = function () {
  this.instances = []
  this.activeInstance = null
  this.index = 0
  this.schemas = []
  this.switcherOptionValues = []
  this.switcherOptionsLabels = []
  this.isMultiple = true

  this.on('set-value', () => {
    this.onSetValue()
  })

  const schemaType = getSchemaType(this.schema)

  if (
    isSet(getSchemaAnyOf(this.schema)) ||
    isSet(getSchemaOneOf(this.schema))
  ) {
    const schemasOf = isSet(getSchemaAnyOf(this.schema))
      ? getSchemaAnyOf(this.schema)
      : getSchemaOneOf(this.schema)
    const schemaCopy = clone(this.schema)
    delete schemaCopy['anyOf']
    delete schemaCopy['oneOf']
    delete schemaCopy['options']

    schemasOf.forEach((schema, index) => {
      schema = { ...schemaCopy, ...schema }

      let switcherOptionsLabel = 'Option-' + (index + 1)
      const switcherTitle = getSchemaXOption(schema, 'switcherTitle')
      const schemaTitle = getSchemaTitle(schema)
      const schemaDescription = getSchemaDescription(schema)

      if (isSet(schemaDescription)) {
        switcherOptionsLabel = schemaDescription
      }

      if (isSet(schemaTitle)) {
        switcherOptionsLabel = schemaTitle
      }

      if (isSet(switcherTitle)) {
        switcherOptionsLabel = switcherTitle
      }

      this.switcherOptionValues.push(index)
      this.switcherOptionsLabels.push(switcherOptionsLabel)
      this.schemas.push(schema)
    })
  } else if (isArray(schemaType)) {
    schemaType.forEach((type, index) => {
      const schemaClone = mergeDeep(this.schema)

      const schema = {
        ...schemaClone,
        ...{ type: type, title: type[0].toUpperCase() + type.slice(1) }
      }

      if (isSet(schemaClone.title)) {
        schema.title = schemaClone.title
      }

      this.switcherOptionValues.push(index)
      this.switcherOptionsLabels.push(
        type.charAt(0).toUpperCase() + type.slice(1)
      )

      this.schemas.push(schema)
    })
  } else if (schemaType === 'any' || !schemaType) {
    const schemaClone = clone(this.schema)

    this.schemas = [
      { ...schemaClone, ...{ type: 'string' } },
      { ...schemaClone, ...{ type: 'boolean' } },
      { ...schemaClone, ...{ type: 'integer' } },
      { ...schemaClone, ...{ type: 'number' } },
      { ...schemaClone, ...{ type: 'array' } },
      { ...schemaClone, ...{ type: 'object' } },
      { ...schemaClone, ...{ type: 'null' } }
    ]

    this.schemas.forEach((schema, index) => {
      this.switcherOptionValues.push(index)
    })

    this.switcherOptionsLabels = [
      'String',
      'Boolean',
      'Integer',
      'Number',
      'Array',
      'Object',
      'Null'
    ]
  }

  const switcherTypeLabels =
    getSchemaXOption(this.schema, 'switcherTypeLabels') ??
    this.jedison.getOption('switcherTypeLabels')
  if (switcherTypeLabels && typeof switcherTypeLabels === 'object') {
    this.switcherOptionsLabels = this.switcherOptionsLabels.map((label) =>
      hasOwn(switcherTypeLabels, label) ? switcherTypeLabels[label] : label
    )
  }

  this.schemas.forEach((schema) => {
    // #region Helper isCompatible function
    const isCompatible =
      !isSet(this.value) ||
      this.jedison.validator.getErrors(
        this.value,
        schema,
        this.getKey(),
        this.path
      ).length === 0
    // #endregion
    const instance = this.jedison.createInstance({
      jedison: this.jedison,
      schema: schema,
      path: this.path,
      parent: this.parent,
      arrayTemplateData: this.arrayTemplateData, // Forwarding arrayTemplateData when InstanceMultiple creates its sub-instances
      value: isCompatible ? clone(this.value) : undefined // Fallback to undefined for incompatible types so the instance seeds its own safe default
    })

    // Guard setValue to avoid forcing incompatible data into the instance after creation
    if (isCompatible && isSet(this.value)) {
      instance.setValue(this.value, false)
    }

    instance.unregister()

    instance.off('notifyParent')

    instance.on('notifyParent', (initiator) => {
      this.value = this.activeInstance.getValueRaw()
      this.emit('change', initiator)
      this.emit('notifyParent', initiator)
    })

    this.instances.push(instance)

    this.register()
  })

  const fittestIndex = this.getFittestIndex(this.value)
  this.switchInstance(fittestIndex, this.value)
}
// #endregion
// #region Adding x-theadHidden support to hide thead in some editors.
Jedison.EditorArrayTuple.prototype.refreshUI = function () {
  {
    this.control.childrenSlot.innerHTML = ''
    const table = this.theme.getTable()
    this.control.childrenSlot.appendChild(table.container)

    // thead — one header per prefixItem
    const schemaPrefixItems = getSchemaPrefixItems(this.instance.schema)
    schemaPrefixItems.forEach((prefixItemSchema) => {
      const th = this.theme.getTableHeader()
      const { label } = this.theme.getFakeLabel({
        content: getSchemaTitle(prefixItemSchema) ?? ''
      })
      th.appendChild(label)
      table.thead.appendChild(th)
    })
    const theadHidden = getSchemaXOption(this.instance.schema, 'theadHidden')
    if (theadHidden) {
      table.table.removeChild(table.thead)
    }

    // tbody — single row
    const tbodyRow = document.createElement('tr')
    this.instance.children.forEach((child) => {
      const td = this.theme.getTableDefinition()
      child.ui.adaptForTable(child, td)
      td.appendChild(child.ui.control.container)
      tbodyRow.appendChild(td)
    })
    table.tbody.appendChild(tbodyRow)

    this.refreshJsonData()
    this.refreshDisabledState()
  }
}
Jedison.EditorArrayTable.prototype.refreshUI = function () {
  this.control.childrenSlot.innerHTML = ''

  const table = this.theme.getTable()

  this.control.childrenSlot.appendChild(table.container)

  const arrayDelete =
    getSchemaXOption(this.instance.schema, 'arrayDelete') ??
    this.instance.jedison.getOption('arrayDelete')
  const arrayMove =
    getSchemaXOption(this.instance.schema, 'arrayMove') ??
    this.instance.jedison.getOption('arrayMove')
  const arrayButtonsPosition =
    getSchemaXOption(this.instance.schema, 'arrayButtonsPosition') ??
    this.instance.jedison.getOption('arrayButtonsPosition')
  const arrayAddAfter =
    getSchemaXOption(this.instance.schema, 'arrayAddAfter') ??
    this.instance.jedison.getOption('arrayAddAfter')

  // thead labels
  const th = this.theme.getTableHeader()
  const { label } = this.theme.getFakeLabel({
    content: 'Controls',
    visuallyHidden: true
  })

  th.appendChild(label)

  // Add controls header at the beginning (left) or end (right)
  if (arrayButtonsPosition === 'left') {
    table.thead.appendChild(th)
  }

  // table header

  if (this.instance.children.length) {
    const schemaItems = getSchemaItems(this.instance.schema)

    const thTitle = this.theme.getTableHeader()

    if (schemaItems) {
      if (schemaItems.title) {
        const fakeLabel = this.theme.getFakeLabel({
          content: schemaItems.title
        })

        thTitle.appendChild(fakeLabel.label)
      }

      const schemaXInfo = getSchemaXOption(schemaItems, 'info')

      if (isSet(schemaXInfo)) {
        const infoContent = this.getInfo(schemaItems)
        const info = this.theme.getInfo(infoContent)

        if (schemaXInfo.variant === 'modal') {
          this.theme.infoAsModal(
            info,
            this.getIdFromPath(this.instance.path) + '-item',
            infoContent
          )
        }

        thTitle.appendChild(info.container)
      }
    }

    table.thead.appendChild(thTitle)
  }
  const theadHidden = getSchemaXOption(this.instance.schema, 'theadHidden')
  if (theadHidden) {
    table.table.removeChild(table.thead)
  }
  // Add controls header at the end if position is right
  if (arrayButtonsPosition === 'right') {
    table.thead.appendChild(th)
  }

  // tbody rows
  this.instance.children.forEach((child, index) => {
    const tbodyRow = document.createElement('tr')

    // buttons
    const buttonsTd = this.theme.getTableDefinition({ isButtonColumn: true })
    const {
      deleteBtn,
      moveUpBtn,
      moveDownBtn,
      dragBtn,
      btnGroup,
      addAfterBtn
    } = this.getButtons(index)

    if (this.isSortable()) {
      btnGroup.appendChild(dragBtn)
    }

    if (isSet(arrayDelete) && arrayDelete === true) {
      btnGroup.appendChild(deleteBtn)
    }

    if (isSet(arrayMove) && arrayMove === true) {
      btnGroup.appendChild(moveUpBtn)
      btnGroup.appendChild(moveDownBtn)
    }

    if (isSet(arrayAddAfter) && arrayAddAfter === true) {
      btnGroup.appendChild(addAfterBtn)
    }

    buttonsTd.appendChild(btnGroup)

    // Add buttons column at the beginning (left) or end (right)
    if (arrayButtonsPosition === 'left') {
      tbodyRow.appendChild(buttonsTd)
    }

    // child
    const td = this.theme.getTableDefinition()
    child.ui.adaptForTable(child, td)
    child.ui.control.info?.container?.remove() // info lives once in the header (#64)
    td.appendChild(child.ui.control.container)
    tbodyRow.appendChild(td)

    // Add buttons column at the end if position is right
    if (arrayButtonsPosition === 'right') {
      tbodyRow.appendChild(buttonsTd)
    }

    table.tbody.appendChild(tbodyRow)
  })

  this.refreshSortable(table.tbody)
  this.refreshAddBtn()
  this.refreshDeleteAllBtn()
  this.refreshJsonData()
  this.refreshDisabledState()
  this.refreshScrollPosition(table.container)

  table.container.addEventListener('scroll', () => {
    this.lastScrollTop = table.container.scrollTop
    this.lastScrollLeft = table.container.scrollLeft
  })
}
// #endregion
// #region Custom extension for toggle-like boolean editor.
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

    const { formGroup, input, label, info, switcherSlot } = this.control

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
    formGroup.appendChild(switcherSlot)
    switchWrapper.appendChild(input)
    switchWrapper.appendChild(statusLabel)
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
// #endregion
// #region Custom editor for string or int\array of string fields.
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
    const input = this.control.input
    input.setAttribute('rows', '1')
    input.style.fieldSizing = 'content'
    input.style.maxHeight = '5lh'
  }

  addEventListeners() {
    this.control.input.addEventListener('change', () => {
      const lines = this.control.input.value
        .split(/[\n,;]+/)
        .map((line) => line.trim())
        .filter((line) => line !== '')
        .map((line) => {
          return /^-?\d+$/.test(line) ? parseInt(line, 10) : line
        })

      let finalValue
      if (lines.length === 0) {
        finalValue = ''
      } else if (lines.length === 1) {
        finalValue = lines[0]
      } else {
        finalValue = lines
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
// #endregion
// #region Custom editor - string or array with inline checkboxes
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
// #endregion
// #region Bootstrap5 Theme with custom icons
class CustomBootstrap extends Jedison.ThemeBootstrap5 {
  constructor() {
    super()
    this.icons = {
      properties: 'my-icon my-icon-properties',
      delete: 'my-icon my-icon-delete',
      add: 'my-icon my-icon-add',
      moveUp: 'my-icon my-icon-moveUp',
      moveDown: 'my-icon my-icon-moveDown',
      collapse: 'my-icon my-icon-collapse',
      expand: 'my-icon my-icon-expand',
      drag: 'my-icon my-icon-drag',
      info: 'my-icon my-icon-info',
      close: 'my-icon my-icon-close',
      edit: 'my-icon my-icon-edit',
      save: 'my-icon my-icon-save',
      copy: 'my-icon my-icon-copy',
      switcher: 'my-icon my-icon-switcher'
    }
  }
}
// #endregion

const Custom = {
  Editors: [BooleanToggle, TextareaArrayEditor, CheckboxesScalarEditor],
  Bootstrap: CustomBootstrap
}
export default { ...Jedison, Custom }

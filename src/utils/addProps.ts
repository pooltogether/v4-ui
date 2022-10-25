import { cloneElement, isValidElement } from 'react'

export const addPropsToReactElement = (element, props) => {
  if (isValidElement(element)) {
    return cloneElement(element, props)
  }
  return element
}

export const addPropsToChildren = (children, props) => {
  if (!Array.isArray(children)) {
    return addPropsToReactElement(children, props)
  }
  return children.map((childElement) => addPropsToReactElement(childElement, props))
}

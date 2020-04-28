import { useState, useEffect } from 'react'

export const useForm = (stateSchema, submit) => {
  const [state, setState] = useState(stateSchema)
  const [formInError, setFormInError] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [pristineState, setPristineState] = useState({})

  const handleChange = ({ target: { value, name, type, checked } }, formName) => {
    value = type === 'checkbox' ? checked : value
    if (formName) {
      setState(prevState => ({
        ...prevState,
        [formName]: { ...prevState[formName], [name]: { ...state[formName][name], value } }
      }))
    } else {
      setState(prevState => ({
        ...prevState,
        [name]: { ...state[name], value }
      }))
    }
  }

  const setFormField = (value, name, formName) => {
    if (formName) {
      setState(prevState => ({
        ...prevState,
        [formName]: { ...prevState[formName], [name]: { ...state[formName][name], value } }
      }))
    } else {
      setState(prevState => ({
        ...prevState,
        [name]: { ...state[name], value }
      }))
    }
  }

  const setErrorField = (error, name, formName) => {
    if (formName) {
      setState(prevState => ({
        ...prevState,
        [formName]: { ...prevState[formName], [name]: { ...state[formName][name], error } }
      }))
    } else {
      setState(prevState => ({
        ...prevState,
        [name]: { ...state[name], error }
      }))
    }
  }

  const onValidate = ({ target: { name } }, formName) => {
    if (formName) {
      setState(prevState => ({
        ...prevState,
        [formName]: {
          ...prevState[formName],
          [name]: { ...state[formName][name], error: getErrorMessage(state[formName], name) }
        }
      }))
    } else {
      setState(prevState => ({
        ...prevState,
        [name]: { ...state[name], error: getErrorMessage(state, name) }
      }))
    }
  }

  const isFormEmpty = (required, formName) => {
    let isEmpty = true
    if (formName) {
      for (const field in state[formName]) {
        if (required) {
          if (state[formName][field].required && state[formName][field].value) {
            isEmpty = false
          }
        } else {
          if (state[formName][field].value) {
            isEmpty = false
          }
        }
      }
    } else {
      for (const field in state) {
        if (required) {
          if (state[field].required && state[field].value) {
            isEmpty = false
          }
        } else {
          if (state[field].value) {
            isEmpty = false
          }
        }
      }
    }
    return isEmpty
  }

  const isPristine = formName => {
    if (formName) {
      for (const field in pristineState[formName]) {
        if (pristineState[formName][field].value !== state[formName][field].value) {
          return false
        }
      }
    } else {
      for (const field in pristineState) {
        if (pristineState[field].value !== state[field].value) {
          return false
        }
      }
    }
    return true
  }

  const setInitialState = state => {
    setState(state)
    setPristineState(state)
  }

  const validateAllFields = formName => {
    let isInerror = false
    if (formName) {
      for (const fieldName of Object.keys(stateSchema[formName])) {
        onValidate({ target: { name: fieldName } }, formName)
        if (getErrorMessage(state[formName], fieldName)) {
          isInerror = true
        }
      }
    } else {
      for (const fieldName of Object.keys(stateSchema)) {
        onValidate({ target: { name: fieldName } })
        if (getErrorMessage(state, fieldName)) {
          isInerror = true
        }
      }
    }
    setFormInError(isInerror)
  }

  const isFormInerror = formName => {
    let isInerror = false
    if (formName) {
      for (const fieldName of Object.keys(stateSchema[formName])) {
        if (getErrorMessage(state[formName], fieldName)) {
          isInerror = true
        }
      }
    } else {
      for (const fieldName of Object.keys(stateSchema)) {
        if (getErrorMessage(state, fieldName)) {
          isInerror = true
        }
      }
    }
    return isInerror
  }

  const handleReset = schema => {
    setState(schema || stateSchema)
    setFormInError(false)
    setIsSubmitting(false)
  }

  const handleSubmit = (e, formName) => {
    if (e) e.preventDefault()
    if (!formName) {
      validateAllFields()
    }
    setIsSubmitting(true)
  }

  useEffect(() => {
    const submitForm = async () => {
      if (!formInError && isSubmitting) {
        try {
          await submit()
        } catch (e) {
          console.error("Une erreur s'est produite lors de la soumission du formulaire")
        } finally {
          setIsSubmitting(false)
        }
      }
    }
    submitForm()
  }, [formInError, isSubmitting])

  return {
    state,
    handleChange,
    setFormField,
    setErrorField,
    onValidate,
    handleSubmit,
    handleReset,
    isFormEmpty,
    validateAllFields,
    formInError,
    setState,
    isFormInerror,
    setInitialState,
    isPristine
  }
}

const getErrorMessage = (passedState, name) => {
  if (
    passedState[name].required &&
    passedState[name].dependsOn &&
    passedState[passedState[name].dependsOn].value &&
    !passedState[name].value
  ) {
    if (passedState[name].requiredError) {
      return passedState[name].requiredError
    }
    return 'Champ requis'
  }

  if (!passedState[name].dependsOn && passedState[name].required && !passedState[name].value) {
    if (passedState[name].requiredError) {
      return passedState[name].requiredError
    }
    return 'Champ requis'
  }

  if (passedState[name].required && passedState[name].value) {
    if (
      passedState[name].validator &&
      !passedState[name].value.match(passedState[name].validator.regEx)
    ) {
      return passedState[name].validator.error
    }
  }
  if (
    passedState[name].value &&
    passedState[name].validator &&
    !passedState[name].value.match(passedState[name].validator.regEx)
  ) {
    return passedState[name].validator.error
  }

  return ''
}

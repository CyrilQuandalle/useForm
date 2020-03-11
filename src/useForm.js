import { useState, useEffect } from 'react'

export const useForm = (stateSchema, submit) => {
  const [state, setState] = useState(stateSchema)
  const [formInError, setFormInError] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [pristineState, setPristineState] = useState({})

  const handleChange = ({ target: { value, name, type, checked } }) => {
    value = type === 'checkbox' ? checked : value
    setState(prevState => ({
      ...prevState,
      [name]: { ...state[name], value },
    }))
  }

  const setFormField = (value, name) => {
    setState(prevState => ({
      ...prevState,
      [name]: { ...state[name], value },
    }))
  }

  const setErrorField = (error, name) => {
    setState(prevState => ({
      ...prevState,
      [name]: { ...state[name], error },
    }))
  }

  const onValidate = ({ target: { name } }) => {
    setState(prevState => ({
      ...prevState,
      [name]: { ...state[name], error: getErrorMessage(state, name) },
    }))
  }

  const isFormEmpty = required => {
    let isEmpty = true
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
    return isEmpty
  }

  const isPristine = () => {
    for (const field in pristineState) {
      if (pristineState[field].value !== state[field].value) {
        return false
      }
    }
    return true
  }

  const setInitialState = state => {
    setState(state)
    setPristineState(state)
  }

  const validateAllFields = () => {
    let isInerror = false
    for (const fieldName of Object.keys(stateSchema)) {
      onValidate({ target: { name: fieldName } })
      if (getErrorMessage(state, fieldName)) {
        isInerror = true
      }
    }
    setFormInError(isInerror)
  }

  const isFormInerror = () => {
    let isInerror = false
    for (const fieldName of Object.keys(stateSchema)) {
      if (getErrorMessage(state, fieldName)) {
        isInerror = true
      }
    }
    return isInerror
  }

  const handleReset = schema => {
    setState(schema || stateSchema)
    setFormInError(false)
    setIsSubmitting(false)
  }

  const handleSubmit = e => {
    if (e) e.preventDefault()
    validateAllFields()
    setIsSubmitting(true)
  }

  useEffect(() => {
    const submitForm = async () => {
      if (!formInError && isSubmitting) {
        try {
          await submit()
        } catch (e) {
          console.error(
            "Une erreur s'est produite lors de la soumission du formulaire"
          )
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
    isPristine,
  }
}

const getErrorMessage = (state, name) => {
  if (state[name].required && !state[name].value) {
    if (state[name].requiredError) {
      return state[name].requiredError
    }
    return 'Champ requis'
  }

  if (state[name].required && state[name].value) {
    if (
      state[name].validator &&
      !state[name].value.match(state[name].validator.regEx)
    ) {
      return state[name].validator.error
    }
  }
  if (
    state[name].value &&
    state[name].validator &&
    !state[name].value.match(state[name].validator.regEx)
  ) {
    return state[name].validator.error
  }

  return ''
}

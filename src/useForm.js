import { useState, useEffect } from 'react'

export const useForm = (stateSchema, submit) => {
  const [state, setState] = useState(stateSchema)
  const [formInError, setFormInError] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

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

  const onValidate = ({ target: { name } }) => {
    setState(prevState => ({
      ...prevState,
      [name]: { ...state[name], error: getErrorMessage(state, name) },
    }))
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

  const handleReset = (schema = stateSchema) => {
    setState(schema)
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
          console.error('An error occured during form validation')
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
    onValidate,
    handleSubmit,
    handleReset,
    validateAllFields,
  }
}

const getErrorMessage = (state, name) => {
  if (state[name].required && !state[name].value) {
    if (state[name].requiredError) {
      return state[name].requiredError
    }
    return 'Ce champ est obligatoire'
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

import { renderHook, act } from '@testing-library/react-hooks'
import { useForm } from './useForm'

describe('useForm', () => {
  describe('simple form', () => {
    it('should get the field current value', () => {
      const {
        result: {
          current: { state }
        }
      } = renderHook(() => useForm({ myField: { value: 'test' } }))

      expect(state.myField.value).toEqual('test')
    })

    it('should update field value', () => {
      const { result } = renderHook(() => useForm({ myField: { value: 'test' } }))

      expect(result.current.state.myField.value).toEqual('test')

      act(() => {
        result.current.handleChange({ target: { value: 'newValue', name: 'myField' } })
      })

      expect(result.current.state.myField.value).toEqual('newValue')
    })

    it('should display the default error if the field is required and empty with no requiredError key', () => {
      const { result } = renderHook(() =>
        useForm({ myField: { value: '', required: true, error: '' } })
      )
      act(() => {
        result.current.onValidate({ target: { name: 'myField' } })
      })

      expect(result.current.state.myField.error).toEqual('Champ requis')
    })
    it('should display a custom error if the field is required and empty with a requiredError key', () => {
      const { result } = renderHook(() =>
        useForm({
          myField: { value: '', required: true, requiredError: 'customError', error: '' }
        })
      )
      act(() => {
        result.current.onValidate({ target: { name: 'myField' } })
      })

      expect(result.current.state.myField.error).toEqual('customError')
    })

    it('should indicate if the form is in error', () => {
      const { result } = renderHook(() =>
        useForm({ myField: { value: '', required: true, error: '' } })
      )
      act(() => {
        result.current.onValidate({ target: { name: 'myField' } })
      })

      expect(result.current.isFormInerror()).toBeTruthy()
    })

    it('should display a custom error for field with custom validation and wrong value', () => {
      const { result } = renderHook(() =>
        useForm({
          myField: {
            value: 'test@jj',
            required: true,
            error: '',
            validator: {
              regEx: /^[a-z0-9]+([|.|-]{1}[a-z0-9]+)*@[a-z0-9]+([|.|-]{1}[a-z0-9]+)*[.]{1}[a-z]{2,6}$/i,
              error: 'invalid email'
            }
          }
        })
      )

      act(() => {
        result.current.onValidate({ target: { name: 'myField' } })
      })

      expect(result.current.state.myField.error).toEqual('invalid email')
    })

    it('should validate all fields and display their error', () => {
      const { result } = renderHook(() =>
        useForm({
          myField: { value: '', required: true, error: '' },
          email: {
            value: 'test@jj',
            required: true,
            error: '',
            validator: {
              regEx: /^[a-z0-9]+([|.|-]{1}[a-z0-9]+)*@[a-z0-9]+([|.|-]{1}[a-z0-9]+)*[.]{1}[a-z]{2,6}$/i,
              error: 'invalid email'
            }
          }
        })
      )
      act(() => {
        result.current.validateAllFields()
      })

      expect(result.current.state.myField.error).toEqual('Champ requis')
      expect(result.current.state.email.error).toEqual('invalid email')
    })

    it('should display an error if a field which is only required if another field is filled is empty and the other is not', () => {
      const { result } = renderHook(() =>
        useForm({
          myField: { value: 'ee', required: true, error: '' },
          email: {
            value: '',
            required: true,
            error: '',
            dependsOn: 'myField',
            validator: {
              regEx: /^[a-z0-9]+([|.|-]{1}[a-z0-9]+)*@[a-z0-9]+([|.|-]{1}[a-z0-9]+)*[.]{1}[a-z]{2,6}$/i,
              error: 'invalid email'
            }
          }
        })
      )
      act(() => {
        result.current.validateAllFields()
      })

      expect(result.current.state.email.error).toEqual('Champ requis')
    })

    it('should not display an error if a field which is only required if another field is filled is empty and the other is too', () => {
      const { result } = renderHook(() =>
        useForm({
          myField: { value: '', required: true, error: '' },
          email: {
            value: '',
            required: true,
            error: '',
            dependsOn: 'myField',
            validator: {
              regEx: /^[a-z0-9]+([|.|-]{1}[a-z0-9]+)*@[a-z0-9]+([|.|-]{1}[a-z0-9]+)*[.]{1}[a-z]{2,6}$/i,
              error: 'invalid email'
            }
          }
        })
      )
      act(() => {
        result.current.validateAllFields()
      })

      expect(result.current.state.email.error).toEqual('')
    })

    it('shoud indicate the form is empty', () => {
      const { result } = renderHook(() =>
        useForm({
          myField: { value: '', required: true, error: '' },
          email: {
            value: '',
            required: true,
            error: '',
            dependsOn: 'myField',
            validator: {
              regEx: /^[a-z0-9]+([|.|-]{1}[a-z0-9]+)*@[a-z0-9]+([|.|-]{1}[a-z0-9]+)*[.]{1}[a-z]{2,6}$/i,
              error: 'invalid email'
            }
          }
        })
      )

      expect(result.current.isFormEmpty()).toBeTruthy()
    })

    it('shoud indicate the form is not empty', () => {
      const { result } = renderHook(() =>
        useForm({
          myField: { value: 'k', required: true, error: '' },
          email: {
            value: 'o',
            required: true,
            error: '',
            dependsOn: 'myField',
            validator: {
              regEx: /^[a-z0-9]+([|.|-]{1}[a-z0-9]+)*@[a-z0-9]+([|.|-]{1}[a-z0-9]+)*[.]{1}[a-z]{2,6}$/i,
              error: 'invalid email'
            }
          }
        })
      )

      expect(result.current.isFormEmpty()).toBeFalsy()
    })

    it('shoud indicate that the form does not have its required fields empty', () => {
      const { result } = renderHook(() =>
        useForm({
          myField: { value: 'k', required: true, error: '' },
          email: {
            value: 'o',
            required: true,
            error: '',
            dependsOn: 'myField',
            validator: {
              regEx: /^[a-z0-9]+([|.|-]{1}[a-z0-9]+)*@[a-z0-9]+([|.|-]{1}[a-z0-9]+)*[.]{1}[a-z]{2,6}$/i,
              error: 'invalid email'
            }
          }
        })
      )

      expect(result.current.isFormEmpty(true)).toBeFalsy()
    })

    it('shoud indicate that the form has its required fields empty', () => {
      const { result } = renderHook(() =>
        useForm({
          myField: { value: '', required: true, error: '' },
          email: {
            value: '',
            required: true,
            error: '',
            dependsOn: 'myField',
            validator: {
              regEx: /^[a-z0-9]+([|.|-]{1}[a-z0-9]+)*@[a-z0-9]+([|.|-]{1}[a-z0-9]+)*[.]{1}[a-z]{2,6}$/i,
              error: 'invalid email'
            }
          }
        })
      )

      expect(result.current.isFormEmpty(true)).toBeTruthy()
    })

    it('should indicate that the prefilled form has been touched by the user', async () => {
      const { result } = renderHook(() =>
        useForm({
          myField: { value: 'field', required: true, error: '' },
          email: {
            value: 'mail',
            required: true,
            error: '',
            dependsOn: 'myField',
            validator: {
              regEx: /^[a-z0-9]+([|.|-]{1}[a-z0-9]+)*@[a-z0-9]+([|.|-]{1}[a-z0-9]+)*[.]{1}[a-z]{2,6}$/i,
              error: 'invalid email'
            }
          }
        })
      )

      act(() => {
        result.current.setInitialState({
          myField: { value: 'field', required: true, error: '' },
          email: {
            value: 'mail',
            required: true,
            error: '',
            dependsOn: 'myField',
            validator: {
              regEx: /^[a-z0-9]+([|.|-]{1}[a-z0-9]+)*@[a-z0-9]+([|.|-]{1}[a-z0-9]+)*[.]{1}[a-z]{2,6}$/i,
              error: 'invalid email'
            }
          }
        })
      })

      act(() => {
        result.current.handleChange({ target: { value: 'newValue', name: 'myField' } })
      })

      expect(result.current.isPristine()).toBeFalsy()
    })

    it('should indicate that the prefilled form has never been touched by the user', async () => {
      const { result } = renderHook(() =>
        useForm({
          myField: { value: 'field', required: true, error: '' },
          email: {
            value: 'mail',
            required: true,
            error: '',
            dependsOn: 'myField',
            validator: {
              regEx: /^[a-z0-9]+([|.|-]{1}[a-z0-9]+)*@[a-z0-9]+([|.|-]{1}[a-z0-9]+)*[.]{1}[a-z]{2,6}$/i,
              error: 'invalid email'
            }
          }
        })
      )

      act(() => {
        result.current.setInitialState({
          myField: { value: 'field', required: true, error: '' },
          email: {
            value: 'mail',
            required: true,
            error: '',
            dependsOn: 'myField',
            validator: {
              regEx: /^[a-z0-9]+([|.|-]{1}[a-z0-9]+)*@[a-z0-9]+([|.|-]{1}[a-z0-9]+)*[.]{1}[a-z]{2,6}$/i,
              error: 'invalid email'
            }
          }
        })
      })

      expect(result.current.isPristine()).toBeTruthy()
    })

    it('should reset the form correctly', () => {
      const { result } = renderHook(() =>
        useForm({
          myField: { value: '', required: true, error: '' },
          email: {
            value: '',
            required: true,
            error: '',
            validator: {
              regEx: /^[a-z0-9]+([|.|-]{1}[a-z0-9]+)*@[a-z0-9]+([|.|-]{1}[a-z0-9]+)*[.]{1}[a-z]{2,6}$/i,
              error: 'invalid email'
            }
          }
        })
      )

      act(() => {
        result.current.handleChange({ target: { value: 'newValue', name: 'myField' } })
        result.current.handleChange({ target: { value: 'email', name: 'email' } })
      })

      expect(result.current.state.myField.value).toEqual('newValue')
      expect(result.current.state.email.value).toEqual('email')

      act(() => {
        result.current.handleReset()
      })

      expect(result.current.state.myField.value).toEqual('')
      expect(result.current.state.email.value).toEqual('')
    })
  })
  describe('wizard', () => {
    it('should update field value', () => {
      const { result } = renderHook(() =>
        useForm({
          form1: { myField: { value: 'test' } },
          form2: { myField: { value: 'test' } }
        })
      )

      expect(result.current.state.form1.myField.value).toEqual('test')
      expect(result.current.state.form2.myField.value).toEqual('test')

      act(() => {
        result.current.handleChange(
          { target: { value: 'newValue', name: 'myField' } },
          'form1'
        )
      })

      expect(result.current.state.form1.myField.value).toEqual('newValue')
      expect(result.current.state.form2.myField.value).toEqual('test')
    })

    it('should display an error if a field is required and only validate the current form', () => {
      const { result } = renderHook(() =>
        useForm({
          form1: { myField: { value: '', required: true } },
          form2: { myField: { value: '', required: true } }
        })
      )

      act(() => {
        result.current.onValidate({ target: { name: 'myField' } }, 'form1')
      })

      expect(result.current.state.form1.myField.error).toEqual('Champ requis')
      expect(result.current.state.form2.myField.error).toBeFalsy()
    })

    it('should say if a specific form is empty', () => {
      const { result } = renderHook(() =>
        useForm({
          form1: { myField: { value: '' } },
          form2: { myField: { value: 'test' } }
        })
      )
      expect(result.current.isFormEmpty('', 'form1')).toBeTruthy()
      expect(result.current.isFormEmpty('', 'form2')).toBeFalsy()
    })

    it('should say if a specific form is not empty if only the required fields matter and are not empty', () => {
      const { result } = renderHook(() =>
        useForm({
          form1: { myField: { value: 'test', required: true }, otherFirld: { value: '' } },
          form2: { myField: { value: '' } }
        })
      )
      expect(result.current.isFormEmpty(true, 'form1')).toBeFalsy()
      expect(result.current.isFormEmpty('', 'form2')).toBeTruthy()
    })

    it('should say if a specific form is pristine', () => {
      const { result } = renderHook(() =>
        useForm({
          form1: { myField: { value: 'test', required: true }, otherFirld: { value: '' } },
          form2: { myField: { value: '' } }
        })
      )

      act(() => {
        result.current.setInitialState({
          form1: {
            myField: { value: 'field', required: true, error: '' },
            email: {
              value: 'mail'
            }
          },
          form2: { value: 'testField', required: true, error: '' }
        })
      })

      act(() => {
        result.current.handleChange(
          { target: { value: 'newValue', name: 'myField' } },
          'form1'
        )
      })

      expect(result.current.isPristine('form1')).toBeFalsy()
      expect(result.current.isPristine('form2')).toBeTruthy()
    })
  })
})

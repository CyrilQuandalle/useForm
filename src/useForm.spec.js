import { renderHook, act } from '@testing-library/react-hooks'
import { useForm } from './useForm'

describe('useForm', () => {
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

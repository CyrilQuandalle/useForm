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
})

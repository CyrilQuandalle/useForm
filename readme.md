React hook to add form validation quickly

Here is an example of state schema to make it work

```
const stateSchema = {
  mail: {
    required: true,
    value: '',
    error: '',
    validator: {
      regEx: /^[a-z0-9]+([|.|-]{1}[a-z0-9]+)*@[a-z0-9]+([|.|-]{1}[a-z0-9]+)*[.]{1}[a-z]{2,6}$/i,
      error: 'Invalide email',
    },
  },
}
```

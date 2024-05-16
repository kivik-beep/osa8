import { useState } from 'react'
import { useMutation } from '@apollo/client'
import { LOGIN } from '../queries'

const LogIn = ({ setError, setToken }) => {
  const [user, setUser] = useState('')
  const [password, setPassword] = useState('')

  const [login, result] = useMutation(LOGIN, {
    //refetchQueries: [{ query: ALL_BOOKS }, { query: ALL_AUTHORS}],
    onError: (error) => {
      setError(error.graphQLErrors[0].message)
    }
  })

  useEffect(() => {    if ( result.data ) {      
    const token = result.data.login.value      
    setToken(token)      
    localStorage.setItem('user-token', token)    

    }  
  }, [result.data])

  const submit = async (event) => {
    event.preventDefault()

    login({ variables: { username, password } })
  }


  return (
    <div>
      <form onSubmit={submit}>
        <div>
          usermane
          <input
            value={user}
            onChange={({ target }) => setUser(target.value)}
          />
        </div>
        <div>
          password
          <input
            value={password}
            onChange={({ target }) => setPassword(target.value)}
          />
        </div>
        <button type="submit">log in</button>
      </form>
    </div>
  )
}

export default LogIn
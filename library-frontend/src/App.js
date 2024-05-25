import { useQuery, useApolloClient } from '@apollo/client'
import { useState } from 'react'
import Authors from './components/Authors'
import Books from './components/Books'
import NewBook from './components/NewBook'
import LogIn from './components/LogIn'
import Recommendations from './components/Recommendations'
import { ALL_AUTHORS, ALL_BOOKS } from './queries'
import Notify from './components/Notify'

const App = () => {
  const [page, setPage] = useState('authors')
  const [token, setToken] = useState(null)
  const [errorMessage, setErrorMessage] = useState(null)
  const authors = useQuery(ALL_AUTHORS)
  const books = useQuery(ALL_BOOKS)
  const client = useApolloClient()

  if (authors.loading || books.loading) {
    return <div>loading...</div>
  }

  if (authors.error || books.error) {
    return <div>Error: {authors.error ? authors.error.message : books.error.message}</div>
  }

  if (!authors.data || !books.data) {
    return <div>No data available</div>
  }

  const notify = (message) => {
    setErrorMessage(message)
    setTimeout(() => {
      setErrorMessage(null)
    }, 10000)
  }

  const logout = () => {
    setToken(null)
    localStorage.clear()
    client.resetStore()
  }

  return (
    <div>
      <Notify errorMessage={errorMessage} />
      <div>
        <button onClick={() => setPage('authors')}>authors</button>
        <button onClick={() => setPage('books')}>books</button>
        {!token ? (
          <button onClick={() => setPage('login')}>login</button>
        ) : (
          <div>
            <button onClick={() => setPage('add')}>add book</button>
            <button onClick={() => setPage('recommendations')}>recommendations</button>
            <button onClick={logout}>logout</button>
          </div>
        )}
      </div>

      <Authors show={page === 'authors'} authors={authors.data.allAuthors} setError={notify} />
      <Books show={page === 'books'} books={books.data.allBooks} />
      <NewBook show={page === 'add'} setError={notify} />
      <Recommendations show={page === 'recommendations'} />
      <LogIn show={page === 'login'} setToken={setToken} setError={notify} />
    </div>
  )
}

export default App

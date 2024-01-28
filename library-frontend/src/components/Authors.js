import { useQuery, useMutation } from '@apollo/client'
import { ALL_AUTHORS, EDIT_AUTHOR } from '../queries'
import { useState } from 'react'

const Authors = (props) => {
  const { loading, error, data } = useQuery(ALL_AUTHORS)
  const [updateYear] = useMutation(EDIT_AUTHOR, {
    refetchQueries: [{ query: ALL_AUTHORS }],
    onError: (error) => {
      console.error('Error updating birth year:', error)
    }
  })

  const [selectedAuthor, setSelectedAuthor] = useState('')
  const [birthYear, setBirthYear] = useState('')

  const handleAuthorChange = (event) => {
    setSelectedAuthor(event.target.value)
  }

  const handleBirthYearChange = (event) => {
    setBirthYear(event.target.value)
  }

  const handleUpdateBirthYear = async (event) => {
    event.preventDefault()
    if (!selectedAuthor || !birthYear) {
      console.error('Please select an author and enter a birth year')
      return
    }
    try {
      console.log('Updating birth year for:', selectedAuthor);
      console.log('New birth year:', birthYear)
      updateYear({
        variables: { selectedAuthor, birthYear }
      })
      setBirthYear('')
    } catch (error) {
      console.error('Error updating birth year:', error)
    }
  }

  if (!props.show) {
    return null
  }

  if (loading) {
    return <p>Loading...</p>
  }

  if (error) {
    return <p>Error: {error.message}</p>
  }

  const authors = data.allAuthors

  return (
    <div>
      <h2>Authors</h2>
      <table>
        <tbody>
          <tr>
            <th>Name</th>
            <th>Born</th>
            <th>Books</th>
          </tr>
          {authors.map((author) => (
            <tr key={author.name}>
              <td>{author.name}</td>
              <td>{author.born}</td>
              <td>{author.bookCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div>
        <h3>Set birth year</h3>
        <form onSubmit={handleUpdateBirthYear}>
          <select value={selectedAuthor} onChange={handleAuthorChange}>
            <option value="">Select Author</option>
            {authors.map((author) => (
              <option key={author.name} value={author.name}>
                {author.name}
              </option>
            ))}
          </select>
          <input
            type="number"
            placeholder="Birth Year"
            value={birthYear}
            onChange={handleBirthYearChange}
          />
          <button type="submit">OK</button>
        </form>
      </div>
    </div>
  )
}

export default Authors
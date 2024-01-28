import { useQuery, useMutation } from '@apollo/client'
import { ALL_AUTHORS, EDIT_AUTHOR } from '../queries'
import { useState } from 'react'

const Authors = (props) => {
  const { loading, error, data } = useQuery(ALL_AUTHORS)
  const [updateYear, result] = useMutation(EDIT_AUTHOR)

  const [name, setName] = useState('')
  const [year, setYear] = useState('')

  const handleUpdateBirthYear = async (event) => {
    event.preventDefault()

    
      console.log('Updating birth year for:', name);
      console.log('New birth year:', year)
      const yearInInt = parseInt(year)
      updateYear({ variables: { name, yearInInt } })

      setYear('')
      console.log('results:', result.data)
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
          <select value={name} onChange={({ target }) => setName(target.value)}>
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
            value={year}
            onChange={({ target }) => setYear(target.value)}
          />
          <button type="submit">OK</button>
        </form>
      </div>
    </div>
  )
}

export default Authors
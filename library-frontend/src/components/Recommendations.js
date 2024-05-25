import React from 'react'
import { useQuery } from '@apollo/client'
import { ALL_BOOKS, CURRENT_USER } from '../queries'

const Recommendations = (props) => {
  const { data: userData, loading: userLoading } = useQuery(CURRENT_USER)
  const favoriteGenre = userData?.me?.favoriteGenre
  const { loading, error, data } = useQuery(ALL_BOOKS, {
    variables: { genre: favoriteGenre },
    skip: !favoriteGenre
  })

  if (!props.show) {
    return null
  }

  if (userLoading || (favoriteGenre && loading)) {
    return <p>Loading...</p>
  }

  if (error) {
    return <p>Error: {error.message}</p>
  }

  const books = data?.allBooks || []

  return (
    <div>
      <h2>Recommendations</h2>
      <p>Books in your favorite genre: <strong>{favoriteGenre}</strong></p>
      <table>
        <tbody>
          <tr>
            <th>Title</th>
            <th>Author</th>
            <th>Published</th>
          </tr>
          {books.map(book => (
            <tr key={book.id}>
              <td>{book.title}</td>
              <td>{book.author.name}</td>
              <td>{book.published}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default Recommendations

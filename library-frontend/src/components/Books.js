import React, { useState, useEffect } from 'react'
import { useQuery, useLazyQuery } from '@apollo/client'
import { ALL_BOOKS } from '../queries'

const Books = (props) => {
  const [selectedGenre, setSelectedGenre] = useState(null)
  const { loading: initialLoading, error: initialError, data: initialData } = useQuery(ALL_BOOKS)
  const [getBooksByGenre, { loading, error, data }] = useLazyQuery(ALL_BOOKS)

  useEffect(() => {
    if (selectedGenre) {
      getBooksByGenre({ variables: { genre: selectedGenre } })
    }
  }, [selectedGenre, getBooksByGenre])

  if (!props.show) {
    return null
  }

  if (initialLoading) {
    return <p>Loading...</p>
  }

  if (initialError) {
    return <p>Error: {initialError.message}</p>
  }

  const books = selectedGenre && data ? data.allBooks : initialData.allBooks
  const genres = [...new Set(initialData.allBooks.flatMap(book => book.genres))]

  const handleGenreClick = (genre) => {
    setSelectedGenre(genre)
  }
  const handleAllBooksClick = () => {
    setSelectedGenre(null)
  }

  return (
    <div>
      <h2>books</h2>
      {selectedGenre && <p>Showing books in the genre: <strong>{selectedGenre}</strong></p>}
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>
          {books.map((a) => (
            <tr key={a.id}>
              <td>{a.title}</td>
              <td>{a.author.name}</td>
              <td>{a.published}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {genres.map(genre => (
        <button key={genre} onClick={() => handleGenreClick(genre)}>
          {genre}
        </button>
      ))}
      <button onClick={handleAllBooksClick}>all genres</button>
    </div>
  )
}

export default Books

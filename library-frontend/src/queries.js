import { gql } from '@apollo/client'

export const ALL_AUTHORS = gql`
  query {
    allAuthors {
      name
      born
      bookCount
      id
    }
  }
`

export const ALL_BOOKS = gql`
  query {
    allBooks { 
        title 
        author{
          name
          id
          born
          bookCount
        }
        published 
        genres
        id
      }
  }
`

export const ADD_BOOK = gql`
  mutation addBook($title: String!, $author: String!, $published: String!, $genres: [String!]!){
    addBook(
      title: $title,
      author: $author,
      published: $published,
      genres: $genres
    ){
      title
      author{
        name
        id
        born
        bookCount
      }
      published
      genres
      id
    }
  }
`

export const EDIT_AUTHOR = gql`
  mutation editAuthor($name: String!, $setBornTo: Int!) {
    editAuthor(
      name: $name
      setBornTo: $setBornTo
    ) {
      name
      born
      bookCount
      id
    }
  }
`

export const LOGIN = gql`
  mutation logIn($username: String!, $password: String!) {
    login(
      username: $username
      password: $password
    ) {
      value
    }
  }
`

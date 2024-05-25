const { ApolloServer } = require('@apollo/server')
const { startStandaloneServer } = require('@apollo/server/standalone')
const { GraphQLError } = require('graphql')
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
mongoose.set('strictQuery', false)

const Author = require('./models/author')
const Book = require('./models/book')
const User = require('./models/user')

require('dotenv').config()

const MONGODB_URI = process.env.MONGODB_URI
const JWT_SECRET = process.env.JWT_SECRET

console.log('connecting to', MONGODB_URI)

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connection to MongoDB:', error.message)
  })

const typeDefs = `
  type Book {
    title: String!
    author: Author!
    published: String!
    genres: [String!]!
    id: ID!
  }

  type Author {
    name: String!
    born: Int
    bookCount: Int!
    id: ID!
  }

  type User {
    username: String!
    favoriteGenre: String
    id: ID!
  }
  
  type Token {
    value: String!
  }

  type Query {
    bookCount: Int!
    authorCount: Int!
    allBooks(author: String, genre: String): [Book!]!
    allAuthors: [Author!]!
    me: User
  }

  type Mutation {
    addBook(
      title: String!
      author: String!
      published: String!
      genres: [String!]!
    ): Book,
    editAuthor(
      name: String!
      setBornTo: Int!
    ): Author,
    createUser(
      username: String!
      favoriteGenre: String!
    ): User,
    login(
      username: String!
      password: String!
    ): Token
  }
`

const resolvers = {
  Query: {
    bookCount: () => Book.collection.countDocuments(),
    authorCount: () => Author.collection.countDocuments(),
    allBooks: async (root, args) => {
      if (args.author && args.genre) {
        const author = await Author.findOne({ name: args.author })
        if (!author) return []
        return Book.find({ author: author._id, genres: { $in: [args.genre] } }).populate('author')
      } else if (args.author) {
        const author = await Author.findOne({ name: args.author })
        if (!author) return []
        return Book.find({ author: author._id }).populate('author')
      } else if (args.genre) {
        return Book.find({ genres: { $in: [args.genre] } }).populate('author')
      } else {
        return Book.find({}).populate('author')
      }
    },
    allAuthors: async () => Author.find({}),
    me: (root, args, context) => context.currentUser,
  },
  Author: {
    bookCount: async (root) => {
      const books = await Book.find({ author: root._id })
      return books.length
    },
  },
  Mutation: {
    addBook: async (root, args, context) => {
      const currentUser = context.currentUser
      if (!currentUser) {
        throw new GraphQLError("not authenticated, login required", {
          extensions: {
            code: "BAD_USER_INPUT",
          }
        })
      }

      let author = await Author.findOne({ name: args.author })
      if (!author) {
        author = new Author({ name: args.author })
        try {
          await author.save()
        } catch (error) {
          throw new GraphQLError("failed to save author", {
            extensions: {
              code: "BAD_USER_INPUT",
              invalidArgs: args,
              error
            }
          })
        }
      }

      const book = new Book({ ...args, author: author._id })
      try {
        await book.save()
        return book.populate('author')
      } catch (error) {
        throw new GraphQLError("failed to save book", {
          extensions: {
            code: "BAD_USER_INPUT",
            invalidArgs: args,
            error
          }
        })
      }
    },
    editAuthor: async (root, args, context) => {
      const currentUser = context.currentUser
      if (!currentUser) {
        throw new GraphQLError("not authenticated, login required", {
          extensions: {
            code: "BAD_USER_INPUT",
          }
        })
      }

      const author = await Author.findOne({ name: args.name })
      if (!author) {
        throw new GraphQLError("Author not found", {
          extensions: {
            code: "BAD_USER_INPUT",
          }
        })
      }

      author.born = args.setBornTo
      try {
        await author.save()
        return author;
      } catch (error) {
        throw new GraphQLError("failed to save author", {
          extensions: {
            code: "BAD_USER_INPUT",
            invalidArgs: args,
            error
          }
        })
      }
    },
    createUser: async (root, args) => {
      const user = new User({ username: args.username, favoriteGenre: args.favoriteGenre })
      try {
        await user.save()
        return user;
      } catch (error) {
        throw new GraphQLError('creating user failed', {
          extensions: {
            code: 'BAD_USER_INPUT',
            invalidArgs: args,
            error
          }
        })
      }
    },
    login: async (root, args) => {
      const user = await User.findOne({ username: args.username })
      if (!user || args.password !== 'secret') {
        throw new GraphQLError('wrong credentials', {
          extensions: { code: 'BAD_USER_INPUT' }
        })
      }

      const userForToken = {
        username: user.username,
        id: user._id,
      }

      return { value: jwt.sign(userForToken, JWT_SECRET) }
    }
  }
}

resolvers.Query.allBooks = async (root, args) => {
  if (args.genre) {
    return Book.find({ genres: args.genre }).populate('author');
  } else {
    if (args.author && args.genre) {
      const author = await Author.findOne({ name: args.author })
      if (!author) return []
      return Book.find({ author: author._id, genres: { $in: [args.genre] } }).populate('author')
    } else if (args.author) {
      const author = await Author.findOne({ name: args.author })
      if (!author) return []
      return Book.find({ author: author._id }).populate('author')
    } else if (args.genre) {
      return Book.find({ genres: { $in: [args.genre] } }).populate('author')
    } else {
      return Book.find({}).populate('author')
    }
  }
}

const server = new ApolloServer({
  typeDefs,
  resolvers
})

startStandaloneServer(server, {
  listen: { port: 4000 },
  context: async ({ req }) => {
    const auth = req ? req.headers.authorization : null
    if (auth && auth.toLowerCase().startsWith('bearer ')) {
      const decodedToken = jwt.verify(auth.substring(7), JWT_SECRET)
      const currentUser = await User.findById(decodedToken.id)
      return { currentUser }
    }
    return {}
  },
}).then(({ url }) => {
  console.log(`Server ready at ${url}`)
})

const { ApolloServer, gql } = require('apollo-server');
const { RESTDataSource } = require('apollo-datasource-rest');

const typeDefs = gql`
  # Comments in GraphQL are defined with the hash (#) symbol.
  # The "Query" type is the root of all GraphQL queries.
  # (A "Mutation" type will be covered later on.)
  type Query {
    characters(id: ID): [Character]
  }
  
  type Character {
    id: ID
    name: String
    image: String
    gender: String
    location: Location
    status: String
    episodes: [Episode]
    numEpisodes: Int
  }
  
  type Location {
    id: ID
    name: String
    type: String
    dimension: String
  }
  
  type Episode {
    id: ID
    name: String
    airDate: String
    created: String
    season: String
  }
  
`;

class RickAndMortyAPI extends RESTDataSource {
  constructor() {
    super()
    this.baseURL = 'https://rickandmortyapi.com/api/'
  }

  async getCharacters() {
    return this.get('character/')
  }

  async getCharacter(id) {
    return this.get(`character/${id}`)
  }

  async getByUri(uri) {
    return this.get(uri)
  }
}

const resolvers = {
  Query: {
    characters: async (parent, { id }, context) => {
      const api = context.dataSources.rickAndMortyAPI
      let result = null
      if (id) {
        result = [await api.getCharacter(id)]
      } else {
        result = (await api.getCharacters()).results
      }
      return result
    },
  },
  Character: {
    numEpisodes: character => character.episode.length,
    episodes: character => character.episode
  },
  Episode: {
    id: async (episodeUri, args, context) => {
      const api = context.dataSources.rickAndMortyAPI
      const result = await api.getByUri(episodeUri)
      return result.id
    },
    name: async (episodeUri, args, context) => {
      const api = context.dataSources.rickAndMortyAPI
      const result = await api.getByUri(episodeUri)
      return result.name
    },
    airDate: async (episodeUri, args, context) => {
      const api = context.dataSources.rickAndMortyAPI
      const result = await api.getByUri(episodeUri)
      return result.air_date
    },
    season: async (episodeUri, args, context) => {
      const api = context.dataSources.rickAndMortyAPI
      const result = await api.getByUri(episodeUri)
      return result.episode
    },
    created: async (episodeUri, args, context) => {
      const api = context.dataSources.rickAndMortyAPI
      const result = await api.getByUri(episodeUri)
      return result.created
    },
  },
  Location: {
    id: async (parent, args, context) => {
      const api = context.dataSources.rickAndMortyAPI
      const result = await api.getByUri(parent.url)
      return result.id
    },
    type: async (parent, args, context) => {
      const api = context.dataSources.rickAndMortyAPI
      const result = await api.getByUri(parent.url)
      return result.type
    },
    dimension: async (parent, args, context) => {
      const api = context.dataSources.rickAndMortyAPI
      const result = await api.getByUri(parent.url)
      return result.dimension
    },
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  dataSources: () => {
    return {
      rickAndMortyAPI: new RickAndMortyAPI(),
    }
  },
  // mocks: true
});

// This `listen` method launches a web-server.  Existing apps
// can utilize middleware options, which we'll discuss later.
server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});
const { makeExecutableSchema } = require("graphql-tools");

const fetch = require("node-fetch");

const gql = String.raw;

// Construct a schema, using GraphQL schema language
const typeDefs = gql`
  type Query {
    myFavoritePlants: [Plant]
  }

  type Plant @cacheControl(maxAge: 60) {
    id: ID
    taxon: String
    verName: String
    uuid: String
    slug: String
    image: String
    collections: [Collection]
  }

  type Collection @cacheControl(maxAge: 60) {
    title: String
    image: String
  }
`;

const resolvers = {
  Query: {
    myFavoritePlants: (root, args, context) => {
      return Promise.all(
        myFavoritePlants.map(({ taxon, slug }) => {
          return fetch(`https://api.vegebase.io/v1/plantes/${slug}`)
            .then(res => res.json())
            .then(data => {
              return Object.assign({ taxon, slug }, data.plante);
            });
        })
      );
    }
  },
  Plant: {
    verName: plante => {
      return plante.nom;
    },
    image: plante => plante.image,
    collections: (plante, args, context) => {
      return fetch(
        `https://api.vegebase.io/v1/plantes/${plante.id}/collections`
      )
        .then(res => res.json())
        .then(data => {
          // Sometimes, there are no upcoming events
          return data.collections || [];
        });
    }
  },
  Collection: {
    image: collection => collection.image,
    title: collection => collection.title
  }
};

// Required: Export the GraphQL.js schema object as "schema"
const schema = makeExecutableSchema({
  typeDefs,
  resolvers
});

const myFavoritePlants = [
  {
    taxon: "Quercus robur",
    slug: "quercus-robur"
  },
  {
    taxon: "Poncirus",
    slug: "poncirus-trifoliata"
  }
];

module.exports = { schema };

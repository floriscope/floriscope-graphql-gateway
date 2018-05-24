const express = require("express");
const { graphqlExpress, graphiqlExpress } = require("apollo-server-express");
const bodyParser = require("body-parser");
const { ApolloEngine } = require("apollo-engine");

const { schema } = require("./schema");

const app = express();

// if (!process.env.VGB_API_KEY) {
//   throw new Error(
//     "Please provide an API key for Vegebase in the environment variable TM_API_KEY."
//   );
// }

if (!process.env.ENGINE_API_KEY) {
  throw new Error(
    "Please provide an API key for Apollo Engine in the environment variable ENGINE_API_KEY."
  );
}

app.post(
  "/graphql",
  bodyParser.json(),
  graphqlExpress({
    schema,
    tracing: true,
    cacheControl: true,
    context: {
      secrets: {
        TM_API_KEY: process.env.TM_API_KEY
      }
    }
  })
);

const gql = String.raw;

app.get(
  "/graphiql",
  graphiqlExpress({
    endpointURL: "/graphql",
    query: gql`
      query UpcomingEvents {
        myFavoriteArtists {
          name
          twitterUrl
          events {
            name
            startDateTime
          }
        }
      }
    `
  })
);

app.use(express.static("public"));

const PORT = process.env.PORT || 3000;

const engine = new ApolloEngine({
  apiKey: process.env.ENGINE_API_KEY,
  stores: [
    {
      name: "publicResponseCache",
      inMemory: {
        cacheSize: 10485760
      }
    }
  ],
  queryCache: {
    publicFullQueryStore: "publicResponseCache"
  }
});

// Start the app
engine.listen(
  {
    port: PORT,
    expressApp: app
  },
  () => {
    console.log(`Go to http://localhost:${PORT}/graphiql to run queries!`);
  }
);

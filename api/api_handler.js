const fs = require('fs');
const { ApolloServer } = require('apollo-server-express');
const GraphQLDate = require('./graphql_date');
const about = require('./about');
const issue = require('./issue');

const typeDefs = fs.readFileSync('./schema.graphql', 'utf-8');

const resolvers = {
  Query: {
    about: about.getMessage,
    issueList: issue.list,
    issue: issue.get,
  },
  Mutation: {
    setAboutMessage: about.setMessage,
    issueAdd: issue.add,
    issueUpdate: issue.update,
  },
  GraphQLDate,
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  formatError: (error) => {
    console.log(error);
    return error;
  },
});

function installHandler(app) {
  const enableCors = (process.env.ENABLE_CORS || 'true') === 'true';
  console.log('CORS setting:', enableCors);
  server.applyMiddleware({ app, path: '/graphql', cors: enableCors });
}

module.exports = { installHandler };

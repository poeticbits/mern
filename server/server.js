const fs = require('fs');
const express = require('express');
const { ApolloServer } = require('apollo-server-express');

let aboutMessage = "Issue Tracker API v1.0";

const typeDefs = fs.readFileSync('./server/schema.graphql', 'utf-8');

const resolvers = {
    Query: {
        about: () => aboutMessage,
    },
    Mutation: {
        setAboutMessage,
    },
};

function setAboutMessage(_, { message }) {
    aboutMessage = message;
    return true;
}

const server = new ApolloServer({
    typeDefs,
    resolvers,
})
const app = express();
server.applyMiddleware({ app, path: '/graphql' });
app.use(express.static('public'));

app.listen(3000, function () {
    console.log('App started on port 3000');
});

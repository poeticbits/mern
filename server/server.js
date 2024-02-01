const fs = require('fs');
const express = require('express');
const { ApolloServer } = require('apollo-server-express');

let aboutMessage = "Issue Tracker API v1.0";
const issuesDB = [
    {
        id: 1,
        status: 'New',
        owner: 'Ravan',
        effort: 5,
        created: new Date('2018-08-15'),
        due: undefined,
        title: 'Error in console when clikcing Add',
    },
    {
        id: 2,
        status: 'Assigned',
        owner: 'Eddie',
        effort: 14,
        created: new Date('2018-08-16'),
        due: new Date('2018-08-30'),
        title: 'Missing bottom border on panel',
    },
];

const typeDefs = fs.readFileSync('./server/schema.graphql', 'utf-8');

const resolvers = {
    Query: {
        about: () => aboutMessage,
        issueList,
    },
    Mutation: {
        setAboutMessage,
    },
};

function issueList() {
    return issuesDB;
}

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

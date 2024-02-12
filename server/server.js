const fs = require('fs');
const express = require('express');
const { ApolloServer, UserInputError } = require('apollo-server-express');
const { GraphQLScalarType } = require('graphql');
const { Kind } = require('graphql/language');

const GraphQLDate = new GraphQLScalarType({
    name: 'GraphQLDate',
    description: 'A Date() type in GraphQL as a scalar',
    serialize(value) {
        return value.toISOString();
    },
    parseValue(value) {
        const dateValue = new Date(value);
        return isNaN(dateValue) ? undefined : dateValue; 
    },
    parseLiteral(ast) {
        if (ast.kind == Kind.STRING) {
            const dateValue = new Date(ast.value);
            return isNaN(dateValue) ? undefined : dateValue;
        }
    },
});

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
        issueAdd,
    },
    GraphQLDate,
};

function issueList() {
    return issuesDB;
}

function setAboutMessage(_, { message }) {
    aboutMessage = message;
    return true;
}

function issueAdd(_, { issue }) {
    validateIssue(issue);
    issue.created = new Date();
    issue.id = issuesDB.length + 1;

    if (issue.status == undefined) issue.status = 'New';

    issuesDB.push(issue);
    return issue;
}

function validateIssue(issue) {
    const errors = [];
    if (issue.title.length < 3) {
        errors.push('Field "title" must be at least 3 characters long.');
    }
    if (issue.status == 'Assigned' && !issue.owner) {
        errors.push('Field "Owner" is required when status is "Assigned"');
    }
    if (errors.length > 0) {
        throw new UserInputError('Invalid inputs', { errors });
    }
}

const server = new ApolloServer({
    typeDefs,
    resolvers,
    formatError: error => {
        console.log(error);
        return error;
    },
})
const app = express();
server.applyMiddleware({ app, path: '/graphql' });
app.use(express.static('public'));

app.listen(3000, function () {
    console.log('App started on port 3000');
});

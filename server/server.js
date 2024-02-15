const fs = require('fs');
const express = require('express');
const { ApolloServer, UserInputError } = require('apollo-server-express');
const { GraphQLScalarType } = require('graphql');
const { Kind } = require('graphql/language');
const { MongoClient } = require('mongodb');

let aboutMessage = "Issue Tracker API v1.0";

function setAboutMessage(_, { message }) {
    aboutMessage = message;
    return true;
}

const url = "mongodb+srv://poeticbits:TY5wy1Et38snidLu@cluster0.zblreui.mongodb.net/?retryWrites=true&w=majority";
let db;

async function issueList() {
    const issues = await db.collection('issues').find({}).toArray();
    return issues;
}

async function connectToDb() {
    const client = new MongoClient(url, { useNewUrlParser: true });
    await client.connect();
    console.log('Connected to MongoDB at', url);
    db = client.db();
}

async function issueAdd(_, { issue }) {
    validateIssue(issue);
    issue.created = new Date();

    issue.id = await getNextSequence('issues');

    if (issue.status == undefined) issue.status = 'New';
    
    const result = await db.collection('issues').insertOne(issue);
    const savedIssue = await db.collection('issues').findOne({ _id: result.insertedId});
    return savedIssue;
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

const app = express();

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

const server = new ApolloServer({
    typeDefs,
    resolvers,
    formatError: error => {
        console.log(error);
        return error;
    },
})

server.applyMiddleware({ app, path: '/graphql' });

app.use(express.static('public'));

async function getNextSequence(name) {
    const result = await db.collection('counters').findOneAndUpdate(
        { _id: name },
        { $inc: { current: 1 } },
        { returnOriginal: false },
    );
    return result.value.current;
}

(async function () {
    try {
        await connectToDb();
        app.listen(3000, function () {
            console.log('App started on port 3000');
        });
    } catch (err) {
        console.log('ERROR:', err);
    }
})();
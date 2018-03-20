'usse strict';

const express = require('express');
const graphqlHTTP = require('express-graphql');
const {
    GraphQLBoolean,
    GraphQLID,
    GraphQLInt,
    GraphQLList,
    GraphQLNonNull,
    GraphQLObjectType,
    GraphQLSchema,
    GraphQLString,
} = require('graphql');
const { getVideoById, getVideos } = require('./src/data');

const PORT = process.env.PORT || 3000;
const server = express();

const videoType = new GraphQLObjectType({
    name: 'Video',
    description: 'A video on Egghead.io',
    fields: {
        id: {
            type: GraphQLID,
            description: 'The id of the video'
        },
        title: {
            type: GraphQLString,
            description: 'The title of the video.'
        },
        duration: {
            type: GraphQLInt,
            description: 'The duration of the video (in seconds).'
        },
        watched: {
            type: GraphQLBoolean,
            description: 'Whether or not the viewer has watched the video.'
        }
    }
});

const queryType = new GraphQLObjectType({
    name: 'QueryType',
    description: 'The root query type.',
    fields: {
        video: {
            type: videoType,
            args: {
                id: {
                    type: new GraphQLNonNull(GraphQLID),
                    description: 'The id of the video.',
                }
            },
            resolve: (_, args) => getVideoById(args.id)
        },
        videos: {
            type: new GraphQLList(videoType),
            resolve: getVideos,
        }
    }
});

const schema = new GraphQLSchema({
    query: queryType
});

server.use(
    '/graphql',
    graphqlHTTP({
        schema,
        graphiql: true,
    })
);

server.listen(PORT, () => {
    console.log(`Listening on http://localhost:${PORT}`);
});

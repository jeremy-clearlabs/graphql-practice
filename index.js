'usse strict';

const express = require('express');
const graphqlHTTP = require('express-graphql');
const {
    GraphQLBoolean,
    GraphQLID,
    GraphQLInputObjectType,
    GraphQLInt,
    GraphQLList,
    GraphQLNonNull,
    GraphQLObjectType,
    GraphQLSchema,
    GraphQLString
} = require('graphql');
const { globalIdField } = require('graphql-relay');

const { getVideoById, getVideos, createVideo } = require('./src/data');
const { nodeInterface, nodeField } = require('./src/node');

const PORT = process.env.PORT || 3000;
const server = express();

const videoType = new GraphQLObjectType({
    name: 'Video',
    description: 'A video on Egghead.io',
    fields: {
        id: globalIdField(),
        title: {
            type: GraphQLString,
            description: 'The title of the video.'
        },
        duration: {
            type: GraphQLInt,
            description: 'The duration of the video (in seconds).'
        },
        released: {
            type: GraphQLBoolean,
            description: 'Whether or not the video is release for the public.'
        }
    },
    interfaces: [nodeInterface]
});

exports.videoType = videoType;

const queryType = new GraphQLObjectType({
    name: 'QueryType',
    description: 'The root query type.',
    fields: {
        node: nodeField,
        videos: {
            type: new GraphQLList(videoType),
            resolve: getVideos
        },
        video: {
            type: videoType,
            args: {
                id: {
                    type: new GraphQLNonNull(GraphQLID),
                    description: 'The id of the video.'
                }
            },
            resolve: (_, args) => {
                return getVideoById(args.id);
            }
        }
    }
});
const videoInputType = new GraphQLInputObjectType({
    name: 'VideoInput',
    fields: {
        title: {
            type: GraphQLString,
            description: 'The title of the video.'
        },
        duration: {
            type: GraphQLInt,
            description: 'The duration of the video (in seconds).'
        },
        released: {
            type: GraphQLBoolean,
            description: 'Whether or not the video is release for the public.'
        }
    }
});

const mutationType = new GraphQLObjectType({
    name: 'Mutation',
    description: 'The root Mutation type.',
    fields: {
        createVideo: {
            type: videoType,
            args: {
                video: {
                    type: new GraphQLNonNull(videoInputType)
                }
            },
            resolve: (_, args) => createVideo(args.video)
        }
    }
});

const schema = new GraphQLSchema({
    query: queryType,
    mutation: mutationType
});

server.use(
    '/graphql',
    graphqlHTTP({
        schema,
        graphiql: true
    })
);

server.listen(PORT, () => {
    console.log(`Listening on http://localhost:${PORT}`);
});

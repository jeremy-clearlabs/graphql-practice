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
const {
    globalIdField,
    connectionDefinitions,
    connectionFromPromisedArray,
    connectionArgs,
    mutationWithClientMutationId,
} = require('graphql-relay');

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

const { connectionType: VideoConnection } = connectionDefinitions({
    nodeType: videoType,
    connectionFields: () => ({
        totalCount: {
            type: GraphQLInt,
            description: 'A count of the total number of objects in this connection.',
            resolve: conn => conn.edges.length
        }
    })
});

const queryType = new GraphQLObjectType({
    name: 'QueryType',
    description: 'The root query type.',
    fields: {
        node: nodeField,
        videos: {
            type: VideoConnection,
            args: connectionArgs,
            resolve: (_, args) => connectionFromPromisedArray(getVideos(), args)
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

const videoMutation = mutationWithClientMutationId({
    name: 'AddVideo',
    inputFields: {
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
    outputFields: {
        video: {
            type: videoType,
        },
    },
    mutateAndGetPayload: args => new Promise((resolve, reject) => {
        Promise.resolve(createVideo(args))
            .then(video => resolve({ video}))
            .catch(reject);
    })
});

const mutationType = new GraphQLObjectType({
    name: 'Mutation',
    description: 'The root Mutation type.',
    fields: {
        createVideo: videoMutation
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

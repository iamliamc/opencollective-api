import { GraphQLInt, GraphQLNonNull, GraphQLObjectType, GraphQLString } from 'graphql';

import models from '../../../models';
import { ApplicationType } from '../enum';
import { idEncode } from '../identifiers';
import Account from '../interface/Account';
import { OAuthAuthorization } from '../object/OAuthAuthorization';

export const Application = new GraphQLObjectType({
  name: 'Application',
  description: 'An oAuth application or a personal token',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLString),
      resolve(order) {
        return idEncode(order.id, 'order');
      },
    },
    legacyId: {
      type: new GraphQLNonNull(GraphQLInt),
      resolve(order) {
        return order.id;
      },
    },
    type: {
      type: ApplicationType,
      resolve(application) {
        return application.type;
      },
    },
    name: {
      type: GraphQLString,
      resolve(application) {
        return application.name;
      },
    },
    description: {
      type: GraphQLString,
      resolve(application) {
        return application.description;
      },
    },
    apiKey: {
      type: GraphQLString,
      resolve(application, args, req) {
        if (req.remoteUser && req.remoteUser.CollectiveId === application.CollectiveId) {
          return application.apiKey;
        }
      },
    },
    clientId: {
      type: GraphQLString,
      resolve(application, args, req) {
        if (req.remoteUser && req.remoteUser.CollectiveId === application.CollectiveId) {
          return application.clientId;
        }
      },
    },
    clientSecret: {
      type: GraphQLString,
      resolve(application, args, req) {
        if (req.remoteUser && req.remoteUser.CollectiveId === application.CollectiveId) {
          return application.clientSecret;
        }
      },
    },
    callbackUrl: {
      type: GraphQLString,
      resolve(application, args, req) {
        if (req.remoteUser && req.remoteUser.CollectiveId === application.CollectiveId) {
          return application.callbackUrl;
        }
      },
    },
    account: {
      type: new GraphQLNonNull(Account),
      resolve(application) {
        return application.getCollective();
      },
    },
    oauthAuthorization: {
      type: OAuthAuthorization,
      async resolve(application, args, req) {
        if (!req.remoteUser) {
          return null;
        }
        const userToken = await models.UserToken.findOne({
          where: { ApplicationId: application.id, UserId: req.remoteUser.id },
        });
        if (userToken) {
          return {
            account: userToken.user.getCollective(),
            application: userToken.client,
            expiresAt: userToken.accessTokenExpiresAt,
            createdAt: userToken.createdAt,
            updatedAt: userToken.updatedAt,
          };
        }
      },
    },
  }),
});
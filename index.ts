import { GraphQLResolveInfo } from "graphql";
import { AllowedFields } from "types";
import { accessControl } from "utils/control";

/**
 * Middleware implementing full access control on fields of objects returned by the incoming GraphQL
 * operations. If an object is entered with its fields, it means that any query, mutation or subscription
 * will have to limit its data fetching to those fields, in other words they can fetch less but not more.
 * Furthemore, if a data object is not included in this middleware, there will be no restrictions on it
 *
 * @param fields AllowedFields
 * @returns resolver
 */
export const secure = (fields: AllowedFields) => {
    return async (resolve: Function, root: any, args: any, ctx: any, info: GraphQLResolveInfo) => {
        accessControl(info, fields);
        return await resolve(root, args, ctx, info);
    }
}
import { QueryValidationError } from "./error";
import { GraphQLResolveInfo } from "graphql";
import { AllowedFields, IMiddlewareFunction, IMiddlewareResolver } from "./types";
import { accessControl } from "./src/control";

/**
 * Middleware implementing full access control on fields of data types returned by the incoming GraphQL
 * operations. If a data type is entered with its fields, it means that any query, mutation or subscription
 * will have to limit its data fetching to those fields, in other words they can fetch less but not more.
 * Furthemore, if a data type is not included in this middleware, there will be no restrictions on it as
 * far as this middleware is concerned
 *
 * @param fieldsTree AllowedFields
 * @returns resolver
 */

export const secure = (fieldsTree: AllowedFields): IMiddlewareResolver => {
    return (resolve: Function, root: any, args: any, ctx: any, info: GraphQLResolveInfo): Promise<any> => {
        return new Promise((fulfill, reject) => {
            try {
                accessControl(info, fieldsTree);
            } catch (err) {
                reject(err as QueryValidationError);
            }
            fulfill(resolve(root, args, ctx, info));
        });
    }
}
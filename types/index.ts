import { GraphQLResolveInfo } from "graphql";
import { QueryValidationError } from "../error";
export type AllowedFields = Record<string, string | (string | AllowedFields)[]>;
export type ParsedFields = Record<string, string | string[]>;
export type IMiddlewareFunction = (resolve: Function, root: any, args: any, ctx: any, info: GraphQLResolveInfo) => Promise<any> | QueryValidationError

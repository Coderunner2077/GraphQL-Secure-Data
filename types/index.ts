import { GraphQLResolveInfo } from "graphql";
import { QueryValidationError } from "../error";
export type AllowedFields = Record<string, string | (string | AllowedFields)[]>;
export type ParsedFields = Record<string, string | string[]>;
//export type IMiddlewareFunction = (resolve: Function, root: any, args: any, ctx: any, info: GraphQLResolveInfo) => Promise<any> | QueryValidationError;

export declare type IMiddlewareResolver<
    TSource = any,
    TContext = any,
    TArgs = any
> = (
    resolve: (
        source?: TSource,
        args?: TArgs,
        context?: TContext,
        info?: GraphQLResolveInfo,
    ) => any,
    parent: TSource,
    args: TArgs,
    context: TContext,
    info: GraphQLResolveInfo,
) => Promise<any>

export declare type IMiddlewareFragment = string

export interface IMiddlewareWithOptions<
    TSource = any,
    TContext = any,
    TArgs = any
> {
    fragment?: IMiddlewareFragment
    fragments?: IMiddlewareFragment[]
    resolve?: IMiddlewareResolver<TSource, TContext, TArgs>
}

export type IMiddlewareFunction<TSource = any, TContext = any, TArgs = any> =
    | IMiddlewareWithOptions<TSource, TContext, TArgs>
    | IMiddlewareResolver<TSource, TContext, TArgs>
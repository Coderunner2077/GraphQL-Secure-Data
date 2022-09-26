import { GraphQLError, GraphQLErrorExtensions } from 'graphql';

export class QueryValidationError extends GraphQLError {
    extensions: GraphQLErrorExtensions;
    constructor(message: string, fields: string[]) {
        super(message);
        this.extensions = {
            statusCode: 403,
            code: "QUERY_VALIDATION_FAILED",
            fields
        };
        this.stack = "Hidden";
    }
}
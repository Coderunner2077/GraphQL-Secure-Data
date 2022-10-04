import { GraphQLError, GraphQLResolveInfo } from "graphql";
import { getRelevantQueries, filterAllowedFields } from "./filter";
import { parseNextQueries, parseAllowedFields } from "./parse";
import { ParsedFields, AllowedFields } from "../types";
import { checkAllFields } from "./check";
import { QueryValidationError } from "../error";

/**
 * Main function verifying whether a given query, mutation or subscription complies with
 * the eventual restrictions on the objects.
 * Returns true if there are no errors thrown, meaning all fields are allowed
 *
 * @remark Here the AllowedFields denomination could be misleading, as any object that is not
 * included in the AllowedFields will not be limited or constrained by this library.
 * @remark Throwing error in the loop without catching it later doesn't seem like best practice
 * @param info GraphQLResolveInfo
 * @param fields AllowedFields
 * @returns boolean
 * @internal
 */
export const accessControl = (info: GraphQLResolveInfo, fields: AllowedFields): boolean => {
    const relevantQueries = getRelevantQueries(info, fields);
    const filteredAllowedFields = filterAllowedFields(info, fields);

    if (relevantQueries.length === 0) return true;
    for (const queryFields of relevantQueries) {
        let parsedQueries: Record<string, string[]>[] = [];
        parsedQueries = parseNextQueries(parsedQueries, queryFields);
        let parsedFields: ParsedFields[] = []
        parsedFields = parseAllowedFields(parsedFields, filteredAllowedFields);
        let [isValid, invalid, depth, childrenOf]: [boolean, string[], number, string[]] = [true, [], 0, []];
        [isValid, invalid, depth, childrenOf] = checkAllFields(depth, parsedFields, parsedQueries);

        if (!isValid && childrenOf.length > 0) throw new Error(`Access Control: cannot fetch subfields of '${childrenOf.join(", ")}' at depth ${depth} in '${queryFields.__parent__}'`);
        if (!isValid && invalid.length > 0) throw new Error(`Access Control: cannot fetch '${invalid.join(", ")}' at depth ${depth} in '${queryFields.__parent__}'`);
    }

    return true;
}
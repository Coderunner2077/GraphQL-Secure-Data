import { GraphQLResolveInfo, SelectionNode } from "graphql";
import { parseReturnType } from "./parse";
import { AllowedFields } from "../types";

/**
 * Filters relevant queries among different incoming queries. Only those operations that return restricted
 * data are considered as relevant
 *
 * @param info GraphQLResolveInfo
 * @param fields AllowedFields
 * @returns Record<string, SelectionNode[]>[]
 * @internal
 */
export const getRelevantQueries = (info: GraphQLResolveInfo, fields: AllowedFields): Record<string, SelectionNode[]>[] => {
    const allowedTypes = getRestrictedTypes(fields);
    const returnType: string = parseReturnType(info);
    if (!allowedTypes.includes(returnType))
        return [];

    const queryName = info.path.key;
    let filteredQueries: Record<string, SelectionNode[]>[] = [];

    const querySet: readonly SelectionNode[] = info.operation.selectionSet.selections;

    for (const query of querySet) { // @ts-ignore
        if (query.alias?.value === queryName || query.name.value === queryName) // @ts-ignore
            filteredQueries.push({ [returnType]: query.selectionSet.selections, __parent__: queryName });
    }

    return filteredQueries;
}

/**
 * Returns first keys of the allowed fields, i.e. the names of data objects that are being restricted
 *
 * @param fields
 * @returns string[]
 * @internal
 */
export const getRestrictedTypes = (fields: AllowedFields): string[] => {
    return Object.keys(fields);
}

/**
 * Filters allowed fields so that we don't have to loop over irrelevant allowed fields.
 * We look if the incoming operation has a matching returned type
 *
 * @param info
 * @param fields
 * @returns AllowedFields
 * @internal
 */
export const filterAllowedFields = (info: GraphQLResolveInfo, fields: AllowedFields): AllowedFields => {
    let filteredFields: AllowedFields = {};
    const returnType = parseReturnType(info);
    for (const type in fields)
        if (type === returnType)
            filteredFields[type] = fields[type];
    return filteredFields;
}
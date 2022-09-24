import { GraphQLResolveInfo, SelectionNode } from "graphql";
import { isEmpty } from "./utils";
import { ParsedFields, AllowedFields } from "../types";

/**
 * Parses return type of the incoming graphql operation to turn it into a string.
 * We remove following characters: "[", "]", "!" (which can be found in GraphQL return types).
 * This allows further exploitation of this data to filter allowed types and incoming queries
 *
 * @param info GraphQLResolveInfo
 * @returns string
 * @internal
 */
export const parseReturnType = (info: GraphQLResolveInfo): string => {
    return `${info.returnType.toString().replace(/(\[|\]|!)/g, "")}`;
}

/**
 * Parses objects of allowed fields into exploitable objects of fields in order to
 * be able to loop over those objects while going further down the depth.
 * This is a recursive function
 *
 * @param parsed ParsedFields[]
 * @param fields AllowedFields
 * @returns ParsedFields[]
 * @internal
 */
export const parseAllowedFields = (parsed: ParsedFields[], fields: AllowedFields): ParsedFields[] => {
    let nextCheck: ParsedFields = {};
    let subfields: AllowedFields = {};
    for (const key in fields) {
        nextCheck[key] = [];
        if (typeof fields[key] === "string") { nextCheck[key] = fields[key] as string; }
        else
            for (const subfield of fields[key]) {
                if (typeof subfield === "string") (nextCheck[key] as string[]).push(subfield);
                else {
                    const subKeys = Object.keys(subfield);
                    for (const subKey of subKeys)
                        (nextCheck[key] as string[]).push(subKey);
                    for (const subfieldKey in subfield)
                        subfields[`${key}:${subfieldKey}`] = subfield[subfieldKey];
                }
            }
    }
    parsed.push(nextCheck);
    if (!isEmpty(subfields))
        parseAllowedFields(parsed, subfields);

    return parsed;
}

/**
 * Parses objects of SeletionNodes from queries into exploitable objects of auery fields in order to
 * be able to loop over those objects while going further down the depth.
 * This is a recursive function
 *
 * @param queries Record<string, string[]>[]
 * @param selections Record<string, SelectionNode[]>
 * @returns Record<string, string[]>[]
 * @internal
 */
export const parseNextQueries = (queries: Record<string, string[]>[], selections: Record<string, SelectionNode[]>): Record<string, string[]>[] => {
    let nextCheck: Record<string, string[]> = {};
    let subselections: Record<string, SelectionNode[]> = {};
    for (let key in selections) {
        if (key === "__parent__") continue;
        nextCheck[key] = [];
        for (const subfield of selections[key]) { //@ts-ignore
            nextCheck[key].push(subfield.name.value); // @ts-ignore
            if (subfield["selectionSet"] !== undefined) {// @ts-ignore
                subselections[`${key}:${subfield.name.value}`] = subfield.selectionSet.selections;
            }

        }
    }
    queries.push(nextCheck);
    if (!isEmpty(subselections))
        parseNextQueries(queries, subselections);

    return queries;
}

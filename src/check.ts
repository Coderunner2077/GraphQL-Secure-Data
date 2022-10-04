import { ParsedFields } from "../types";

/**
 * Checks whether query fields of a given depth are included in allowed fields, i.e. valid. Returns array of:
 * - boolean (true if valid)
 * - array of invalid fields (empty array if no invalid fields)
 *
 * @param acceptedFields ParsedFields | undefined
 * @param queryFields Record<string, string[]>
 * @returns [boolean, string[]]
 * @internal
 */
export const checkFields = (acceptedFields: ParsedFields | undefined, queryFields: Record<string, string[]>): [boolean, string[], string[]] => {
    let invalid = [];
    let childrenOf = [];
    for (let queryKey in queryFields) {
        let wildcardKey = queryKey.replace(/:\w+/gi, ":*");
        if (!acceptedFields || (acceptedFields[queryKey] === undefined && acceptedFields[wildcardKey] === undefined)) {
            childrenOf.push(queryKey.substring(queryKey.lastIndexOf(":") + 1));
            continue;
        }
        if (acceptedFields[wildcardKey] !== undefined && (acceptedFields[wildcardKey] === "*" || (Array.isArray(acceptedFields[wildcardKey]) && acceptedFields[wildcardKey].includes("*"))))
            continue;
        if (acceptedFields[queryKey] === "*" || (Array.isArray(acceptedFields[queryKey]) && acceptedFields[queryKey].includes("*")))
            continue;
        for (let querySubfield of queryFields[queryKey])
            if ((typeof acceptedFields[queryKey] === "string" && acceptedFields[queryKey] !== querySubfield) || (Array.isArray(acceptedFields[queryKey]) && !acceptedFields[queryKey].includes(querySubfield)))
                invalid.push(querySubfield);
    }

    return [invalid.length === 0 && childrenOf.length === 0, invalid, childrenOf];
}

/**
 * Checks if totality of query fields for a given object are included in its respective allowed fields.
 * @param depth
 * @param acceptedFields
 * @param queryFields
 * @returns [isValid: boolean, invalidFields: string[], depth: number]
 * @internal
 */
export const checkAllFields = (depth: number, acceptedFields: ParsedFields[], queryFields: Record<string, string[]>[]): [boolean, string[], number, string[]] => {
    for (let i = 0; i < queryFields.length; i++) {
        depth++;
        let [isValid, invalid, childrenOf] = checkFields(acceptedFields[i], queryFields[i]);
        if (!isValid) return [isValid, invalid, depth, childrenOf];
    }
    return [true, [], depth, []];
}
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
export const checkFields = (acceptedFields: ParsedFields | undefined, queryFields: Record<string, string[]>): [boolean, string[]] => {
    let invalid = [];
    for (let queryKey in queryFields) {
        if (!acceptedFields || acceptedFields[queryKey] === undefined)
            invalid.push(queryKey);
        else
            for (let querySubfield of queryFields[queryKey])
                if ((typeof acceptedFields[queryKey] === "string" && acceptedFields[queryKey] !== querySubfield) || (Array.isArray(acceptedFields[queryKey]) && !acceptedFields[queryKey].includes(querySubfield)))
                    invalid.push(querySubfield);


    }

    return [invalid.length === 0, invalid];
}

/**
 * Checks if totality of query fields for a given object are included in its respective allowed fields.
 * @param depth
 * @param acceptedFields
 * @param queryFields
 * @returns [isValid: boolean, invalidFields: string[], depth: number]
 * @internal
 */
export const checkAllFields = (depth: number, acceptedFields: ParsedFields[], queryFields: Record<string, string[]>[]): [boolean, string[], number] => {
    for (let i = 0; i < queryFields.length; i++) {
        depth++;
        let [isValid, invalid] = checkFields(acceptedFields[i], queryFields[i]);
        if (!isValid) return [isValid, invalid, depth];
    }
    return [true, [], depth];
}
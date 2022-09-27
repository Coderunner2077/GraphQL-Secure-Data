
/**
 * Checks whether an object is empty
 * @param obj object
 * @returns boolean
 */
export function isEmpty(obj: object) {
    for (let key in obj) return false;
    return true;
}

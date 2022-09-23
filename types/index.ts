export type AllowedFields = Record<string, string | (string | AllowedFields)[]>;
export type ParsedFields = Record<string, string | string[]>;
# GraphQL Secure Data
> Thin layer of abstraction for GraphQL Server to secure data from excessive/abusive fetching


# Overview

GraphQL Secure Data protects your application from excessive and/or abusive data fetching. Using an intuitive restrictions layer, you'll be able to secure your data from unintended queries by specifying the maximum allowed nested fields for your data types. These restrictions are applied to all of the  queries, mutations and subscriptions that return the specified data types.

## Features

-   😎  **Less is more:**  Small middleware inspired by  [GraphQL Middleware](https://github.com/prismagraphql/graphql-middleware).
-   ⚡  **Easy to use:**  An intuitive, yet familiar API that you will pick up instantly
-   💪  **Powerful:**  Applies to all of your queries, mutations and subscriptions
-   ✔️  **Compatible:**  Works with any GraphQL Server
-   🎯  **Per-Type and Per-Depth:**  Write restrictions for your types and permissions for fields as deep as you'd like (check the example below).

## New Features

By using wildcards, two new features have been added:
-   ✨  **Depth limit Per-Type:** Allow all fields up to a certain depth for a given type
-   🚀 **Use of Wildcard Per-Depth :** Allow all non-nested fields at a given depth with a single wildcard (**"*"**)

## Install

```
yarn add graphql-secure-data graphql-middleware
```

## Example
### GraphQL Yoga

```javascript
import { createServer } from '@graphql-yoga/node'
import { applyMiddleware } from 'graphql-middleware'
import { secure } from 'graphql-secure-data'
import { makeExecutableSchema } from '@graphql-tools/schema'
import { resolvers } from "./resolvers";

const typeDefs = `
  type Query {
    getUser: User
    getMessage: Message
    allMessages: [Message!]
    allUsers: [User!]
  }
  type Mutation {
    addMessage: Message
  }
  type User {
    id: ID!
    username: String!
    password: String!
    messagesSent: [Message!]
    messagesReceived: [Message!]
  }
  type Message {
    id: ID!
    content: String!
    sender: User!
    receiver: User!
  }
`
// Your schema
const schema = makeExecutableSchema({ typeDefs, resolvers })

// Restrictions

/* Only specify the object types that you want to restrict, and
fields and nested fields that you want to allow  */

const  restrictions = secure({
  Message: [
    "id",
    "content",
    { sender: ["id", "username"] },
    { receiver: ["id", "username"] }
  ],
  User: [
    "*", // wildcard allowing all non-nested subfields
    {
      messagesSent: [
        "id",
        "content",
        { receiver: "id" }
      ],
      messagesReceived: [
        "id",
        "content",
        { sender: ["id", "username"] }
      ]
    }
  ]
})

const server = createServer({
  schema: applyMiddleware(schema, restrictions),
})

server.start()
```

## API

### Types

```javascript
// Restricted types AND allowed fields tree type
export type  AllowedFields = Record<string, string | (string | AllowedFields)[]>

declare  function  secure(fieldsTree: AllowedFields): IMiddlewareFunction
```

### `secure(fieldsMap?)`

> Returns a GraphQL Middleware layer from your fields tree object.

#### `fieldsMap`

The fields map must match your schema types, at least partially.
If a data type is entered with its fields, it means that any query, mutation or
subscription will have to limit its data fetching to those fields, in other words they can fetch less but not more. Furthemore, if a data type is not included
in this parameter, there will be no restrictions on it as far as this middleware
is concerned.

##### Constraints
This parameter requires to enter a nested object containing at each of its depth the
following :
-  `String` representing a single field.  For example:   ` secure({ User: "id" })`
-  `Array of strings` representing multiple fields.
    Example `secure({ User: ["id", "username"] })`
-  `Array of more nested object(s)` containing either of the above.  Example:
   `secure({ User: [{ messagesSent: "id", messagesReceived: "id" } ])`

>  Naturally you can keep going as far as you'd like in the fields
>  permissions
>
>  Note: Any field that you omit at a given depth (starting at 1+) is going to
>  be  forbidden to be fetched and an error will be thrown indicating which
>  field could not be fetched.
>
> Note 2: Any type (specified at the very top of the tree) that you omit is
> fully allowed to be fetched as it is considered as not requiring any
> restrictions.

##### Use of wildcards

Any of the strings contained in the nested object can be wildcards. Here are the two use cases of the wildcard:

- Wildcard(s) at the base of a type specifies the depth limit up to which all fields and nested fields are allowed for a given type.
Example:
```
secure({
  Message: "**", // Depth limit 2: Message fields and subfields allowed
  User: "***" // Depth limit 3
})
```
- Wildcard at a given depth allows all direct non-nested subfields to be fetched without having to name them all. It doesn't include nested subfields.
Example:
```javasript
secure({
  User: [
    "*",    // id, username, password subfields are allowed
    {
      messagesSent: "*",    // id, content subfields are allowed
      messagesReceived: [
        "*",    // id, content subfields are allowed
        { sender: "*" }  // id, username, password subfields are allowed
      ]    // receiver NOT allowed
    }
  ]
})
```

> Note : Use of multiple wildcards to signify allowed depth limit will only work when entered as a UNIQUE child at the base of a type field (at the TOP of the object)
>
> Note 2: And for nested fields only single wildcards will have an effect (which is allowing all non-nested subfields at that depth)

##### Custom Errors
By default, in case of a forbidden field, an error is thrown, then caught AND
returned instead of executing the underlying query resolver. This way we can be 100% sure none of your internal logic can be exposed to the client if he
queries more data than he was supposed to.

## Contributing

I welcome people willing to help me grow  `graphql-secure-data`!
If you have an issue, feature request, or pull request, let me know!

## License

MIT @ Guillaume Coderunner
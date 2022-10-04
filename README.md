# GraphQL Secure Data
> Thin layer of abstraction for GraphQL Server to secure data from excessive/malicious fetching


# Overview

GraphQL Secure Data protects your application from excessive and/or malicious data fetching. Using an intuitive restrictions layer, you'll be able to secure your data from unintended queries by specifying the maximum allowed nested fields for your data types. These restrictions are applied to all of the  queries, mutations and subscriptions that return the specified data types.

## Features

-   😎  **Less is more:**  Small middleware inspired by  [GraphQL Middleware](https://github.com/prismagraphql/graphql-middleware).
-   ⚡  **Easy to use:**  An intuitive, yet familiar API that you will pick up instantly
-   💪  **Powerful:**  Applies to all of your queries, mutations and subscriptions
-   ✔️  **Compatible:**  Works with any GraphQL Schema.
-   🎯  **Per-Type and Per-Depth:**  Write restrictions for your types and permissions for fields as deep as you'd like (check the example below).

## Install

```
yarn add graphql-secure-data
```

## Example
### GraphQL Yoga

```javascript
import { GraphQLServer } from 'graphql-yoga'
import { ContextParameters } from 'graphql-yoga/dist/types'
import { secure } from '@coderunner/graphql-secure'
import { resolvers } from "./resolvers";

const typeDefs = `
  type Query {
    getUser: User
    getMessage: Message
    allMessages: [Message]!
    allUsers: [User]!
  }
  type Mutation {
    addMessage: Message
  }
  type User {
    id: ID!
    username: String!
    password: String!
    messagesSent: [Message]!
    messagesReceived: [Message]!
  }
  type Message {
    id: ID!
    content: String!
    sender: User!
    receiver: User!
  }
`
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
    "id",
    "username",
    "password",
    {
      messagesSent: [
        "id",
        "content",
        { receiver: "id" }
      ]
    },
    {
      messagesReceived: [
        "id",
        "content",
        { receiver: "id" }
      ]
    }
  ]
});

const server = new GraphQLServer({
  typeDefs,
  resolvers,
  middlewares: [restrictions]
});

server.start(() => console.log('Server is running on http://localhost:4000'));
```

### Others, using  `graphql-middleware`
```javascript
// Restrictions...

// Apply permissions middleware with applyMiddleware
// Giving any schema (instance of GraphQLSchema)

import { applyMiddleware } from 'graphql-middleware'
// schema definition...
schema = applyMiddleware(schema, restrictions)
```

## API

### Types

```javascript
// Restricted types AND allowed fields tree type
export type  AllowedFields = Record<string, string | (string | AllowedFields)[]>

export type IMiddlewareFunction<TSource = any, TContext = any, TArgs = any> =
    | IMiddlewareWithOptions<TSource, TContext, TArgs>
    | IMiddlewareResolver<TSource, TContext, TArgs>

declare function secure(fieldsTree: AllowedFields): IMiddlewareFunction
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
-   `String` representing a single field.  For example:   ` secure({ User: "id" })`
-   `Array of strings` representing multiple fields.
    Example `secure({ User: ["id", "username"] })`
- `Array of more nested object(s)` containing either of the above.  Example:
  `secure({ User: [{messagesSent: "id"}, { messagesReceived: ["id"] } ])`



>  Naturally you can keep going as far as you'd like in the fields
>  permissions

>  Note: Any field that you omit at a given depth (starting at 1+) is going to
>  be  forbidden to be fetched and an error will be thrown indicating which
>  field could not be fetched.

> Note 2: Any type (specified at the very top of the tree) that you omit is
> fully allowed to be fetched as it is considered as not requiring any
> restrictions.

##### Custom Errors
By default, in case of a forbidden field, an error is thrown, then caught AND
returned instead of executing the underlying query resolver. This way we can be 100% sure none of your internal logic can be exposed to the client if he
queries more data than he was supposed to.

## Contributing

I'm always looking for people to help me grow  `graphql-secure-data`!
This module (my first published) can be improved with features like being able
to explicitly forbid certain query fields, as well as adding a caching system
especially if `graphql-secure-data` starts to grow in complexity.
If you have an issue, feature request, or pull request, let me know!

## License

MIT @ Guillaume Coderunner

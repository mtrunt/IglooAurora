import React from "react"
import ReactDOM from "react-dom"
import "./index.css"
import App from "./App"
import registerServiceWorker from "./registerServiceWorker"
import {ApolloClient} from "apollo-client"
import {HttpLink} from "apollo-link-http"
import {InMemoryCache} from "apollo-cache-inmemory"
import {ApolloProvider} from "react-apollo"

const client = new ApolloClient({
    // By default, this client will send queries to the
    //  `/graphql` endpoint on the same host
    link: new HttpLink({
        uri: "https://iglooql.herokuapp.com/graphql",
        headers: {
            Authorization:
                "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJleHAiOjE1MTQ1NjE4NTUsInVzZXJJZCI6ImYxODk0OWMzLTEzNTgtNDhmYi05OWNkLWMwZWU0NDcyZmFlMSJ9.GXCyYsvmMjftrSrI7vuS87JOwu8t6mQCyPxTYnJ2ujt0V1xHVjT9GhABQlgeeZr24Tx61QW-WXOdi92FSolnEg",
        },
    }),
    cache: new InMemoryCache(),
})

ReactDOM.render(
    <ApolloProvider client={client}>
        <App />
    </ApolloProvider>,
    document.getElementById("root")
)
registerServiceWorker()

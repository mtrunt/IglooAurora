import React from "react"
import ReactDOM from "react-dom"
import "./index.css"
import App from "./App"
import registerServiceWorker from "./registerServiceWorker"
import {ApolloClient} from "apollo-client"
import {HttpLink} from "apollo-link-http"
import {InMemoryCache} from "apollo-cache-inmemory"
import {ApolloProvider} from "react-apollo"
import {WebSocketLink} from "apollo-link-ws"
import {split} from "apollo-link"
import {getMainDefinition} from "apollo-utilities"

const bearer =
    "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJleHAiOjE1MTQ2NDAyNTEsInVzZXJJZCI6IjBiMGEwNDZjLWE2ZjAtNDUxMC05MTRjLTUxM2Y4YzUxMDU5NiJ9.osk32koebLZ12Pf7gvOKmVb00JACs_eyw7hok4a1ky54ZJA7Es40G2qF_kAmnjOySEWtQA1U4geoeDGofOLSWg"

const wsLink = new WebSocketLink({
    uri: `ws://localhost:3000/subscriptions`,
    options: {
        reconnect: true,
        connectionParams: {
            Authorization: "Bearer " + bearer,
        },
    },
})

const httpLink = new HttpLink({
    uri: "http://localhost:3000/graphql",
    headers: {
        Authorization: "Bearer " + bearer,
    },
})

const link = split(
    // split based on operation type
    ({query}) => {
        const {kind, operation} = getMainDefinition(query)
        return kind === "OperationDefinition" && operation === "subscription"
    },
    wsLink,
    httpLink
)

const client = new ApolloClient({
    // By default, this client will send queries to the
    //  `/graphql` endpoint on the same host
    link,
    cache: new InMemoryCache(),
})

ReactDOM.render(
    <ApolloProvider client={client}>
        <App />
    </ApolloProvider>,
    document.getElementById("root")
)
registerServiceWorker()

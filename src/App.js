import React from "react"
import "./App.css"
import { ApolloClient } from "apollo-client"
import { InMemoryCache } from "apollo-cache-inmemory"
import { HttpLink } from "apollo-link-http"
import { useQuery } from "@apollo/react-hooks"
import gql from "graphql-tag"

export const client = new ApolloClient({
  link: new HttpLink({
    uri: "https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v2",
  }),
  fetchOptions: {
    mode: "no-cors",
  },
  cache: new InMemoryCache(),
})

const DAI_QUERY = gql`
  query tokens($tokenAddress: Bytes!) {
    tokens(where: { id: $tokenAddress }) {
      derivedETH
      totalLiquidity
    }
  }
`

const ETH_PRICE_QUERY = gql`
  query bundles {
    bundles(where: { id: "1" }) {
      ethPrice
    }
  }
`

function App() {
  const { loading: ethLoading, data: ethPriceData } = useQuery(ETH_PRICE_QUERY)
  const { loading: daiLoading, data: daiData } = useQuery(DAI_QUERY, {
    variables: {
      tokenAddress: "0x6b175474e89094c44da98b954eedeac495271d0f",
    },
  })

  const daiPriceInEth = daiData && daiData.tokens[0].derivedETH
  const daiTotalLiquidity = daiData && daiData.tokens[0].totalLiquidity
  const ethPriceInUSD = ethPriceData && ethPriceData.bundles[0].ethPrice

  return (
    <div>
      <div>
        Dai price:{" "}
        {ethLoading || daiLoading
          ? "Loading token data..."
          : "$" +
            // parse responses as floats and fix to 2 decimals
            (parseFloat(daiPriceInEth) * parseFloat(ethPriceInUSD)).toFixed(2)}
      </div>
      <div>
        Dai total liquidity:{" "}
        {daiLoading
          ? "Loading token data..."
          : // display the total amount of DAI spread across all pools
            parseFloat(daiTotalLiquidity).toFixed(0)}
      </div>
      <iframe
        src="https://app.uniswap.org/"
        height="660px"
        width="100%"
        // style="    border: 0;    margin: 0 auto;    display: block;    border-radius: 10px;    max-width: 600px;    min-width: 300px;  "
        id="myId"
      />
    </div>
  )
}

export default App

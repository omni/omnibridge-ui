# Omnibridge

The OmniBridge [multi-token extension](https://docs.tokenbridge.net/eth-xdai-amb-bridge/multi-token-extension) for the Arbitrary Message Bridge between Ethereum and the xDai chain is the simplest way to transfer ANY ERC20/ERC677/ERC827 token to the xDai chain.

## Project Structure

This project is a monorepo created with [Yarn Workspaces](https://classic.yarnpkg.com/en/docs/workspaces/) and [Create Eth App](https://github.com/paulrberg/create-eth-app).

[comment]: # 'git ls-tree -r --name-only HEAD | tree --fromfile'

```
xdai-omnibridge
├── .eslintrc.json
├── .firebaserc
├── .github
│   └── workflows
│       ├── sokol.yml
│       └── staging.yml
├── .gitignore
├── .prettierrc.json
├── README.md
├── firebase.json
├── package.json
├── packages
│   ├── react-app
│   │   ├── package.json
│   │   ├── public
│   │   │   ├── android-chrome-192x192.png
│   │   │   ├── android-chrome-512x512.png
│   │   │   ├── apple-touch-icon.png
│   │   │   ├── browserconfig.xml
│   │   │   ├── favicon-16x16.png
│   │   │   ├── favicon-32x32.png
│   │   │   ├── favicon.ico
│   │   │   ├── index.html
│   │   │   ├── manifest.json
│   │   │   ├── mstile-150x150.png
│   │   │   ├── robots.txt
│   │   │   └── safari-pinned-tab.svg
│   │   └── src
│   │       ├── App.jsx
│   │       ├── Routes.jsx
│   │       ├── assets
│   │       │   ├── advanced.svg
│   │       │   ├── alert.svg
│   │       │   ├── blue-tick.svg
│   │       │   ├── change-network.png
│   │       │   ├── claim.svg
│   │       │   ├── close.svg
│   │       │   ├── confirm-transfer.svg
│   │       │   ├── custom-token.svg
│   │       │   ├── details.svg
│   │       │   ├── down-triangle.svg
│   │       │   ├── drop-down.svg
│   │       │   ├── error.svg
│   │       │   ├── eth-logo.png
│   │       │   ├── eth.png
│   │       │   ├── info.svg
│   │       │   ├── loading.svg
│   │       │   ├── logo.svg
│   │       │   ├── multiple-claim.svg
│   │       │   ├── no-history.svg
│   │       │   ├── right-arrow.svg
│   │       │   ├── search.svg
│   │       │   ├── settings.svg
│   │       │   ├── transfer.svg
│   │       │   ├── unlock.svg
│   │       │   ├── up-triangle.svg
│   │       │   └── xdai-logo.png
│   │       ├── components
│   │       │   ├── AdvancedMenu.jsx
│   │       │   ├── BridgeHistory.jsx
│   │       │   ├── BridgeLoadingModal.jsx
│   │       │   ├── BridgeTokens.jsx
│   │       │   ├── ClaimTokensModal.jsx
│   │       │   ├── ClaimTransferModal.jsx
│   │       │   ├── ConfirmTransferModal.jsx
│   │       │   ├── ConnectWeb3.jsx
│   │       │   ├── CustomTokenModal.jsx
│   │       │   ├── DaiWarning.jsx
│   │       │   ├── ErrorBoundary.jsx
│   │       │   ├── Footer.jsx
│   │       │   ├── FromToken.jsx
│   │       │   ├── Header.jsx
│   │       │   ├── HistoryItem.jsx
│   │       │   ├── HistoryPagination.jsx
│   │       │   ├── Layout.jsx
│   │       │   ├── LoadingModal.jsx
│   │       │   ├── Logo.jsx
│   │       │   ├── NeedsConfirmationModal.jsx
│   │       │   ├── NeedsTransactions.jsx
│   │       │   ├── NoHistory.jsx
│   │       │   ├── ProgressRing.jsx
│   │       │   ├── ReverseWarning.jsx
│   │       │   ├── SelectTokenModal.jsx
│   │       │   ├── SystemFeedback.jsx
│   │       │   ├── TermsOfServiceModal.jsx
│   │       │   ├── ToToken.jsx
│   │       │   ├── TokenSelectorModal.jsx
│   │       │   ├── TransferButton.jsx
│   │       │   ├── TxLink.jsx
│   │       │   ├── UnlockButton.jsx
│   │       │   ├── UpdateSettings.jsx
│   │       │   └── WalletSelector.jsx
│   │       ├── contexts
│   │       │   ├── BridgeContext.jsx
│   │       │   └── Web3Context.jsx
│   │       ├── hooks
│   │       │   ├── useCurrentDay.js
│   │       │   ├── useFeeType.js
│   │       │   ├── useRewardAddress.js
│   │       │   ├── useTotalConfirms.js
│   │       │   └── useTransactionStatus.js
│   │       ├── icons
│   │       │   ├── DownArrowIcon.jsx
│   │       │   ├── ErrorIcon.jsx
│   │       │   ├── GithubIcon.jsx
│   │       │   ├── HistoryIcon.jsx
│   │       │   ├── LeftIcon.jsx
│   │       │   ├── NetworkIcon.jsx
│   │       │   ├── OmniBridgeIcon.jsx
│   │       │   ├── PlusIcon.jsx
│   │       │   ├── RaidGuildIcon.jsx
│   │       │   ├── RightIcon.jsx
│   │       │   ├── SettingsIcon.jsx
│   │       │   ├── TelegramIcon.jsx
│   │       │   ├── TwitterIcon.jsx
│   │       │   ├── WalletFilledIcon.jsx
│   │       │   ├── WalletIcon.jsx
│   │       │   └── XDaiIcon.jsx
│   │       ├── index.jsx
│   │       ├── lib
│   │       │   ├── amb.js
│   │       │   ├── bridge.js
│   │       │   ├── constants.js
│   │       │   ├── ethPrice.js
│   │       │   ├── gasPrice.js
│   │       │   ├── helpers.js
│   │       │   ├── history.js
│   │       │   ├── overrides.js
│   │       │   ├── providers.js
│   │       │   ├── proxy.js
│   │       │   ├── token.js
│   │       │   └── tokenList.js
│   │       ├── pages
│   │       │   ├── History.jsx
│   │       │   └── Home.jsx
│   │       └── theme.js
│   └── subgraph
│       ├── config
│       │   ├── kovan.json
│       │   ├── mainnet.json
│       │   ├── sokol.json
│       │   └── xdai.json
│       ├── package.json
│       ├── schema.graphql
│       ├── src
│       │   ├── abis
│       │   │   ├── amb.json
│       │   │   ├── mediator.json
│       │   │   └── token.json
│       │   └── mappings
│       │       ├── amb.ts
│       │       ├── bridge.ts
│       │       └── helpers.ts
│       └── subgraph.template.yaml
└── yarn.lock
```

Owing to this dependency on Yarn Workspaces, xdai-omnibridge can't be used with npm.

## Available Scripts

In the project directory, you can run:

### React App

#### `yarn react-app:start`

Runs the React app in development mode.<br>
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will automatically reload if you make changes to the code.<br>
You will see the build errors and lint warnings in the console.

#### `yarn react-app:test`

Runs the React test watcher in an interactive mode.<br>
By default, runs tests related to files changed since the last commit.

#### `yarn react-app:build`

Builds the React app for production to the `build` folder.<br />
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br />
Your app is ready to be deployed!

### Subgraph

#### `yarn subgraph:auth`

```sh
GRAPH_ACCESS_TOKEN=your-access-token-here yarn subgraph:auth
```

#### `yarn subgraph:prepare-<network>`

Generates subgraph.yaml for particular network.
Supported networks are kovan, sokol, xdai and mainnet.

#### `yarn subgraph:codegen`

Generates AssemblyScript types for smart contract ABIs and the subgraph schema.

#### `yarn subgraph:build`

Compiles the subgraph to WebAssembly.

#### `yarn subgraph:deploy-<network>`

Deploys the subgraph for particular network to the official Graph Node.<br/>

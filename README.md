# PoolTogether V4 UI

The user interface for interacting with V4 of the PoolTogether prize-savings protocol.

## 💾 &nbsp; Installation

Install dependencies: 

```
yarn
```

Make sure you have `direnv` installed and copy `.envrc.example` to `.envrc`:

```
cp .envrc.example .envrc
```

Fill in your own values for `.envrc`, then run:

```
direnv allow
```

Download the localizations:

```
yarn locize:download
```


To run the local server, run:

```
yarn dev
```

## Developer

### Tools

- [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)
- [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
- [Locize](https://locize.io/login)

### Localization

- Be sure to download latest copy locally. This is done automatically on build.
- To add strings they must be manually added to Locize. t(key, defaultValue) isn't fully set up for `next-i18next`

### PoolTogether Repos

Some configs are shared across multiple repos. Be sure to update across all if you make changes.

### Wallets

Want your wallet in our app? We rely on [RainbowKit](https://www.rainbowkit.com/) and [WAGMI](https://wagmi.sh) for wallet connection. If you have a suitable [wallet connector](https://github.com/rainbow-me/rainbowkit/tree/main/packages/rainbowkit/src/wallets/walletConnectors) we can add your wallet and give you a custom link to highlight your wallet for your users.

Append `?wallet=<wallet key>` to any `app.pooltogether.com` link to highlight connecting your wallet. Keys are visible [here](https://github.com/pooltogether/v4-ui/blob/main/src/utils/services/walletConnection.ts).

#### Repos
- v4-ui
- governance-ui
- tools-ui

#### Shared
- /public/fonts
- /styles/index.css
- eslintrc.json
- .gitignore
- .nvmrc
- .prettierrc
- .prettierignore
- some .envrc
- tsconfig.json
- next-i18next.config.js

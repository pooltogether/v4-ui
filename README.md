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

#### Developer Tools

- [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)
- [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
- [Locize](https://locize.io/login)

### Localization

- Be sure to download latest copy locally. This is done automatically on build.
- To add strings they must be manually added to Locize. t(key, defaultValue) isn't fully set up for `next-i18next`

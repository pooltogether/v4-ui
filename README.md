# PoolTogether Skeleton UI

A simple React app to standardize core apps across the PoolTogether ecosystem.

# Setup

Install dependencies:

```bash
$ yarn
```

Make sure you have `direnv` installed and copy `.envrc.example` to `.envrc`:

```bash
$ cp .envrc.example .envrc
```

Fill in your own values for `.envrc`, then run:

```bash
$ direnv allow
```

To run the local server, run:

```
$ yarn dev
```

# Usage

- Choose what layout you want (`DefaultLayout` or `SimpleLayout`)
- Add supported networks to `useSupportedNetworks`
- Remember to wrap your pages with `<Layout>`

#### Developer Tools

- [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)

import Head from 'next/head'

export const Meta = ({ title }) => {
  const defaultTitle = 'PoolTogether - v4'
  title = title ? `${title} - ${defaultTitle}` : defaultTitle

  let url = `https://v4.pooltogether.com`
  if (typeof window !== 'undefined') {
    url = window.location.href
  }
  const description = `PoolTogether is a crypto-powered savings protocol based on Premium Bonds. Save money and have a chance to win every day.`
  const keywords = 'ethereum polygon celo bsc binance avalanche dapp'
  const twitterHandle = '@PoolTogether_'

  return (
    <>
      <Head>
        <>
          <meta name='description' content={description} />
          <meta name='keywords' content={keywords} />

          <meta property='og:title' content={title} />
          <meta property='og:description' content={description} />
          <meta property='og:site_name' content={title} />
          <meta property='og:url' content={url} />

          <meta property='twitter:title' content={title} />
          <meta property='twitter:site' content={twitterHandle} />
          <meta property='twitter:url' content={url} />
          <meta property='twitter:creator' content={twitterHandle} />
        </>
      </Head>
    </>
  )
}

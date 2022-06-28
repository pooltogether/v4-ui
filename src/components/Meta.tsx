import Head from 'next/head'

export const Meta = (props: { title?: string }) => {
  const fullTitle = props.title ? `${props.title} - PoolTogether` : 'PoolTogether'

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

          <meta property='og:title' content={fullTitle} />
          <meta property='og:description' content={description} />
          <meta property='og:site_name' content={fullTitle} />
          <meta property='og:url' content={url} />

          <meta property='twitter:title' content={fullTitle} />
          <meta property='twitter:site' content={twitterHandle} />
          <meta property='twitter:url' content={url} />
          <meta property='twitter:creator' content={twitterHandle} />
        </>
      </Head>
    </>
  )
}

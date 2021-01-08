import Head from 'next/head'

export const Meta = ({ title }) => {
  const defaultTitle = 'PoolTogether'
  title = title ? `${title} - ${defaultTitle}` : defaultTitle

  let url = `https://app.pooltogether.com`
  if (typeof window !== 'undefined') {
    url = window.location.href
  }
  const description = `PoolTogether`
  const keywords = 'ethereum'
  const twitterHandle = '@PoolTogether_'

  return (
    <>
      <Head>
        <>
          <title>{title}</title>

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
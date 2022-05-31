// _document is only rendered on the server side and not on the client side
// Event handlers like onClick can't be added to this file

import { Meta } from '@components/Meta'
import Document, { Html, Head, Main, NextScript } from 'next/document'

class MyDocument extends Document {
  static async getInitialProps(ctx) {
    const initialProps = await Document.getInitialProps(ctx)
    return { ...initialProps }
  }

  render() {
    const title = 'PoolTogether - v4'
    const url = `https://pooltogether.com`
    const description = `A new way to save money and have a chance to win every week.`
    const keywords = 'ethereum polygon avalanche prize savings win save protocol'
    const twitterHandle = '@PoolTogether_'

    return (
      <Html>
        <Head>
          <>
            <title>{title}</title>

            <link rel='icon' href='/favicon.png' type='image/x-icon' />

            <meta name='theme-color' content='#1e0b43' />
            <meta name='description' content={description} />
            <meta name='keywords' content={keywords} />
            <meta name='author' content='PoolTogether' />

            <meta property='og:title' content={title} />
            <meta property='og:description' content={description} />
            <meta property='og:site_name' content={title} />
            <meta property='og:url' content={url} />
            <meta property='og:type' content='website' />
            <meta
              property='og:image'
              content={`${url}/pooltogether-facebook-share-image-1200-630@2x.png`}
            />
            <meta property='og:rich_attachment' content='true' />
            <meta property='og:image:width' content='1200' />
            <meta property='og:image:height' content='630' />

            <meta property='twitter:title' content={title} />
            <meta property='twitter:description' content={description} />
            <meta property='twitter:card' content='summary_large_image' />
            <meta property='twitter:site' content={twitterHandle} />
            <meta
              property='twitter:image:src'
              content={`${url}/pooltogether-twitter-share-image-1200-675@2x.png`}
            />
            <meta property='twitter:url' content={url} />
            <meta property='twitter:creator' content={twitterHandle} />

            <link rel='manifest' href='manifest.json' />
          </>
        </Head>
        <body className='bg-body text-inverse'>
          <Meta />

          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}

export default MyDocument

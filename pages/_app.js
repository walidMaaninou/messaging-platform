/* pages/_app.js */
import '../styles/globals.css'
import Link from 'next/link'

function MyApp({ Component, pageProps }) {
  return (
    <div>
      <nav className="border-b p-6">
        <p className="text-4xl font-bold">Messaging Platform</p>
        <div className="flex mt-4">
          <Link href="/">
            <a className="mr-4 text-pink-500">
              Home
            </a>
          </Link>
          <Link href="/send">
            <a className="mr-6 text-pink-500">
              Send Message
            </a>
          </Link>
          <Link href="/sent">
            <a className="mr-6 text-pink-500">
              Sent Messages
            </a>
          </Link>
          <Link href="/received">
            <a className="mr-6 text-pink-500">
              Received Messages
            </a>
          </Link>
        </div>
      </nav>
      <Component {...pageProps} />
    </div>
  )
}

export default MyApp
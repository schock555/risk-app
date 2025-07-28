import Head from 'next/head'

export default function Home() {
  return (
    <>
      <Head>
        <title>Earth Risk Dashboard</title>
        <meta name="description" content="Check real-time environmental and disaster risks for any location" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-16">
          <h1 className="text-4xl font-bold text-center mb-8">
            Earth Risk Dashboard
          </h1>
          <p className="text-center text-gray-600 mb-12">
            Check real-time environmental and disaster risks for any location
          </p>
          {/* Search bar and map will go here */}
        </div>
      </main>
    </>
  )
}
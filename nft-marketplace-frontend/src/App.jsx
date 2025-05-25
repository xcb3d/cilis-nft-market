import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { Toaster } from 'react-hot-toast'
import Layout from './components/layout/Layout'
import './App.css'
import { Web3ReactProvider } from '@web3-react/core'
import { ethers } from 'ethers'
import { Web3Provider as Web3ContextProvider } from './contexts/Web3Context'
import { NFTTransferProvider } from './contexts/NFTTransferContext'

const Home = lazy(() => import('./pages/Home'))
const Explore = lazy(() => import('./pages/Explore'))
const Create = lazy(() => import('./pages/Create'))
const Profile = lazy(() => import('./pages/Profile'))
const Collection = lazy(() => import('./pages/Collection'))
const NFTDetail = lazy(() => import('./pages/NFTDetail'))

function getLibrary(provider) {
  return new ethers.providers.Web3Provider(provider)
}

function App() {
  return (
    <Web3ReactProvider getLibrary={getLibrary}>
      <Web3ContextProvider>
        <NFTTransferProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<Suspense fallback={<div>Loading...</div>}><Home /></Suspense>} />
                <Route path="explore" element={<Suspense fallback={<div>Loading...</div>}><Explore /></Suspense>} />
                <Route path="create" element={<Suspense fallback={<div>Loading...</div>}><Create /></Suspense>} />
                <Route path="profile" element={<Suspense fallback={<div>Loading...</div>}><Profile /></Suspense>} />
                <Route path="collection/:address" element={<Suspense fallback={<div>Loading...</div>}><Collection /></Suspense>} />
                <Route path="nft/:collectionAddress/:tokenId" element={<NFTDetail />} />
              </Route>
            </Routes>
            <Toaster position="top-right" />
          </BrowserRouter>
        </NFTTransferProvider>
      </Web3ContextProvider>
    </Web3ReactProvider>
  )
}

export default App

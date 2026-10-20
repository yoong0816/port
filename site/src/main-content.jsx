import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import introBase from './data/intro-base.json'
import introContent from './data/intro-content.json'

const { interestReplacements = {}, ...contentOverrides } = introContent

const intro = {
  ...introBase,
  ...contentOverrides,
  interests: introBase.interests.map((interest) => ({
    ...interest,
    items: interest.items.map((item) => interestReplacements[item] ?? item),
  })),
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App intro={intro} />
  </StrictMode>,
)

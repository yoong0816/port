import { useEffect, useState } from 'react'
import introBase from './data/intro-base.json'
import introKpop from './data/intro-kpop.json'
import categories from './data/categories.json'
import './App.css'

const defaultIntro = { ...introBase, ...introKpop }

// 화면(screen)이 넓을 때만 true. 모바일·인쇄(PDF)에서는 false.
const WIDE_QUERY = 'screen and (min-width: 651px)'

function useWide() {
  const [wide, setWide] = useState(() => window.matchMedia(WIDE_QUERY).matches)
  useEffect(() => {
    const mq = window.matchMedia(WIDE_QUERY)
    const onChange = () => setWide(mq.matches)
    mq.addEventListener('change', onChange)
    onChange()
    return () => mq.removeEventListener('change', onChange)
  }, [])
  return wide
}

function imgSrc(src) {
  return `${import.meta.env.BASE_URL}${src.replace(/^\//, '')}`
}

function linkHref(url) {
  return /^https?:\/\//.test(url) ? url : imgSrc(url)
}

function DescriptionLine({ text }) {
  const idx = text.indexOf(' : ')
  if (idx === -1) return text
  return (
    <>
      <strong>{text.slice(0, idx)}</strong>
      {text.slice(idx)}
    </>
  )
}

function WorkItem({ item }) {
  return (
    <article className="work-item">
      {item.images?.length === 1 && (
        <div className="banner-image">
          <img src={imgSrc(item.images[0])} alt={item.title} />
        </div>
      )}
      {item.images?.length > 1 && (
        <div className="image-grid">
          {item.images.map((src, i) => (
            <div className="image-box" key={i}>
              <img src={imgSrc(src)} alt={`${item.title} 이미지 ${i + 1}`} />
            </div>
          ))}
        </div>
      )}

      <div className="work-item-body">
        <div className="work-item-header">
          <h3>{item.title}</h3>
          {item.period && <span className="period">{item.period}</span>}
        </div>
        {item.role && <p className="role">{item.role}</p>}
        {Array.isArray(item.description) ? (
          <ul className="description-list">
            {item.description.map((d, i) => (
              <li key={i}>
                <DescriptionLine text={d} />
              </li>
            ))}
          </ul>
        ) : (
          item.description && <p className="description">{item.description}</p>
        )}

        {item.reportLinks?.length > 0 && (
          <div className="report-thumb-list">
            {item.reportLinks.map((link, i) => (
              <a
                key={i}
                className="report-thumb"
                href={linkHref(link.url)}
                target="_blank"
                rel="noreferrer"
              >
                <img src={imgSrc(link.thumbnail)} alt={`${link.label} 미리보기`} />
                <span>{link.label} ↗</span>
              </a>
            ))}
          </div>
        )}

        {item.links?.length > 0 && (
          <ul className="link-list">
            {item.links.map((link, i) => (
              <li key={i}>
                <a href={linkHref(link.url)} target="_blank" rel="noreferrer">
                  {link.label} ↗
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </article>
  )
}

function CategorySection({ category }) {
  const wide = useWide()
  // featuredFirst: 첫 항목은 가로 전체로, 나머지는 아래에 왼쪽·오른쪽 번갈아 배치
  const featured = category.featuredFirst ? category.items[0] : null
  const rest = featured ? category.items.slice(1) : category.items

  return (
    <section className="category-section" id={category.id}>
      <h2>{category.title}</h2>
      {category.summary && <p className="category-summary">{category.summary}</p>}
      {category.categoryPeriod && <p className="category-period">{category.categoryPeriod}</p>}
      {featured && (
        <div className="work-item-featured">
          <WorkItem item={featured} />
        </div>
      )}
      {featured && wide ? (
        <div className="work-item-columns">
          {[0, 1].map((col) => (
            <div className="work-item-col" key={col}>
              {rest
                .filter((_, i) => i % 2 === col)
                .map((item) => (
                  <WorkItem key={item.title} item={item} />
                ))}
            </div>
          ))}
        </div>
      ) : (
        <div className="work-item-list">
          {rest.map((item, i) => (
            <WorkItem key={i} item={item} />
          ))}
        </div>
      )}
    </section>
  )
}

function App({ intro = defaultIntro }) {
  const navItems = [
    ...categories.map((c) => ({ id: c.id, title: c.title })),
    ...(intro.interests?.length > 0 ? [{ id: 'interests', title: '관심 분야' }] : []),
    ...(intro.values?.length > 0 ? [{ id: 'values', title: '가치관' }] : []),
  ]

  return (
    <div className="page">
      <nav className="site-nav">
        <a className="site-nav-name" href="#top">
          {intro.name}
        </a>
        <div className="site-nav-links">
          {navItems.map((n) => (
            <a key={n.id} href={`#${n.id}`}>
              {n.title}
            </a>
          ))}
        </div>
      </nav>

      <header className="intro" id="top">
        <div className="profile-row">
          {intro.photo && (
            <img className="profile-photo" src={imgSrc(intro.photo)} alt={intro.name} />
          )}
          <div>
            <p className="eyebrow">PORTFOLIO</p>
            <h1>{intro.headline}</h1>
          </div>
        </div>

        {intro.summary && <p className="summary">{intro.summary}</p>}

        {intro.paragraphs?.map((p, i) => (
          <p key={i} className="intro-paragraph">
            {p}
          </p>
        ))}

        <div className="contact-row">
          {intro.contact?.email && (
            <a className="chip" href={`mailto:${intro.contact.email}`}>
              ✉ {intro.contact.email}
            </a>
          )}
          {intro.contact?.links?.map((link, i) => (
            <a key={i} className="chip" href={link.url} target="_blank" rel="noreferrer">
              {link.label}
            </a>
          ))}
        </div>
      </header>

      <main>
        {categories.map((category) => (
          <CategorySection key={category.id} category={category} />
        ))}

        {intro.interests?.length > 0 && (
          <section className="category-section" id="interests">
            <h2>관심 분야</h2>
            <ul className="interests-list">
              {intro.interests.map((interest, i) => (
                <li key={i}>
                  <h3>{interest.title}</h3>
                  <ul className="interest-detail-list">
                    {interest.items.map((t, j) => (
                      <li key={j}>{t}</li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </section>
        )}

        {intro.values?.length > 0 && (
          <section className="category-section" id="values">
            <h2>가치관</h2>
            <ul className="values-list">
              {intro.values.map((v, i) => (
                <li key={i}>{v}</li>
              ))}
            </ul>
          </section>
        )}

        {intro.education?.length > 0 && (
          <footer className="education">
            <h2>학력</h2>
            <ul>
              {intro.education.map((e, i) => (
                <li key={i}>{e}</li>
              ))}
            </ul>
          </footer>
        )}
      </main>
    </div>
  )
}

export default App

import { Fragment, useEffect, useRef, useState } from 'react'
import introBase from './data/intro-base.json'
import introKpop from './data/intro-kpop.json'
import categories from './data/categories.json'
import works from './data/works.json'
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

const hasWorks = works.items?.length > 0

// "다른 작업물 보기" 버튼: 작업물 목록 팝업 열기
function openWorks() {
  const dlg = document.getElementById('works-dialog')
  if (dlg && !dlg.open) dlg.showModal()
}

function WorksList() {
  return (
    <ul className="works-list">
      {works.items.map((w, i) => (
        <li key={i}>
          <a className="works-row" href={linkHref(w.file)} target="_blank" rel="noreferrer">
            {w.thumbnail && <img src={imgSrc(w.thumbnail)} alt={`${w.title} 미리보기`} />}
            <span className="works-row-text">
              <strong>{w.title}</strong>
              {w.description && <em>{w.description}</em>}
            </span>
            <span className="works-row-open">열기 ↗</span>
          </a>
        </li>
      ))}
    </ul>
  )
}

// 화면에서는 팝업(dialog)으로만 보이고, 인쇄·PDF에서는 아래 WorksPrintSection으로 대신 보임
function WorksDialog() {
  const ref = useRef(null)
  if (!hasWorks) return null
  return (
    <dialog
      ref={ref}
      id="works-dialog"
      className="works-dialog"
      aria-labelledby="works-dialog-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) e.currentTarget.close()
      }}
    >
      <div className="works-dialog-inner">
        <header className="works-dialog-header">
          <div>
            <h2 id="works-dialog-title">
              {works.title}
              <span className="works-count">{works.items.length}개</span>
            </h2>
            {works.summary && <p>{works.summary}</p>}
          </div>
          <button
            type="button"
            className="works-dialog-close"
            aria-label="닫기"
            onClick={() => ref.current.close()}
          >
            ✕
          </button>
        </header>
        <WorksList />
      </div>
    </dialog>
  )
}

function WorksPrintSection() {
  if (!hasWorks) return null
  return (
    <section className="category-section works-print">
      <h2>{works.title}</h2>
      {works.summary && <p className="category-summary">{works.summary}</p>}
      <WorksList />
    </section>
  )
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

        {(item.links?.length > 0 || (item.showWorksButton && hasWorks)) && (
          <ul className="link-list">
            {item.links?.map((link, i) => (
              <li key={i}>
                <a href={linkHref(link.url)} target="_blank" rel="noreferrer">
                  {link.label} ↗
                </a>
              </li>
            ))}
            {item.showWorksButton && hasWorks && (
              <li>
                <button type="button" className="works-link" onClick={openWorks}>
                  다른 작업물 보기
                </button>
              </li>
            )}
          </ul>
        )}
      </div>
    </article>
  )
}

function CategorySection({ category }) {
  const wide = useWide()
  // featuredFirst: 첫 항목은 가로 전체로 놓고, 나머지는 아래에 두 줄로 배치
  //  - 기본: 왼쪽·오른쪽 번갈아 배치
  //  - restLayout: "balanced" 이면 두 줄의 높이가 비슷해지도록 자동으로 나눔
  const featured = category.featuredFirst ? category.items[0] : null
  const rest = featured ? category.items.slice(1) : category.items
  const alternate = featured && wide && category.restLayout !== 'balanced'

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
      {alternate ? (
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

        {intro.paragraphs?.length > 0 && (
          <details className="intro-more">
            <summary>
              <span className="intro-more-label when-closed">자기소개서 전체 보기</span>
              <span className="intro-more-label when-open">자기소개서 접기</span>
              <span className="intro-more-chevron" aria-hidden="true">
                ▾
              </span>
            </summary>
            <div className="intro-more-body">
              {intro.paragraphs.map((p, i) => (
                <p key={i} className="intro-paragraph">
                  {p}
                </p>
              ))}
            </div>
          </details>
        )}

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
          <Fragment key={category.id}>
            <CategorySection
              category={{ ...category, ...intro.categoryOverrides?.[category.id] }}
            />
            {category.id === 'content-planning' && <WorksPrintSection />}
          </Fragment>
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

      <WorksDialog />
    </div>
  )
}

export default App

import intro from './data/intro.json'
import categories from './data/categories.json'
import './App.css'

function WorkItem({ item }) {
  return (
    <article className="work-item">
      <div className="work-item-header">
        <h3>{item.title}</h3>
        {item.period && <span className="period">{item.period}</span>}
      </div>
      {item.role && <p className="role">{item.role}</p>}
      {item.description && <p className="description">{item.description}</p>}

      {item.images?.length > 0 && (
        <div className="image-grid">
          {item.images.map((src, i) => (
            <img key={i} src={src} alt={`${item.title} 이미지 ${i + 1}`} />
          ))}
        </div>
      )}

      {item.links?.length > 0 && (
        <ul className="link-list">
          {item.links.map((link, i) => (
            <li key={i}>
              <a href={link.url} target="_blank" rel="noreferrer">
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      )}
    </article>
  )
}

function CategorySection({ category }) {
  return (
    <section className="category-section" id={category.id}>
      <h2>{category.title}</h2>
      {category.summary && <p className="category-summary">{category.summary}</p>}
      <div className="work-item-list">
        {category.items.map((item, i) => (
          <WorkItem key={i} item={item} />
        ))}
      </div>
    </section>
  )
}

function App() {
  return (
    <div className="page">
      <header className="intro">
        <h1>{intro.name}</h1>
        <p className="headline">{intro.headline}</p>
        {intro.paragraphs?.map((p, i) => (
          <p key={i} className="intro-paragraph">
            {p}
          </p>
        ))}
      </header>

      <nav className="category-nav">
        {categories.map((c) => (
          <a key={c.id} href={`#${c.id}`}>
            {c.title}
          </a>
        ))}
      </nav>

      <main>
        {categories.map((category) => (
          <CategorySection key={category.id} category={category} />
        ))}
      </main>
    </div>
  )
}

export default App

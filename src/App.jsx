import { useState, useEffect, useRef } from 'react'
import './App.css'

// ── Particules flottantes Hero ──────────────────────────────────────────────
function Particles() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let animId

    const resize = () => {
      canvas.width  = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const COLORS = ['#6dd8f0','#f5c842','#d98fbf','#ffffff','#5db87a']
    const particles = Array.from({ length: 55 }, () => ({
      x:     Math.random() * canvas.width,
      y:     Math.random() * canvas.height,
      r:     Math.random() * 1.8 + 0.4,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      vx:    (Math.random() - 0.5) * 0.35,
      vy:    (Math.random() - 0.5) * 0.35,
      alpha: Math.random() * 0.5 + 0.2,
      pulse: Math.random() * Math.PI * 2,
    }))

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.forEach(p => {
        p.pulse += 0.018
        p.x += p.vx
        p.y += p.vy
        if (p.x < 0) p.x = canvas.width
        if (p.x > canvas.width) p.x = 0
        if (p.y < 0) p.y = canvas.height
        if (p.y > canvas.height) p.y = 0
        const a = p.alpha * (0.7 + 0.3 * Math.sin(p.pulse))
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = p.color
        ctx.globalAlpha = a
        ctx.fill()
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r * 3, 0, Math.PI * 2)
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 3)
        grad.addColorStop(0, p.color)
        grad.addColorStop(1, 'transparent')
        ctx.fillStyle = grad
        ctx.globalAlpha = a * 0.25
        ctx.fill()
      })
      ctx.globalAlpha = 1
      animId = requestAnimationFrame(draw)
    }
    draw()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute', inset: 0,
        width: '100%', height: '100%',
        pointerEvents: 'none', zIndex: 2,
      }}
    />
  )
}

// ── Séparateur décoratif ────────────────────────────────────────────────────
function SectionDivider() {
  return (
    <div className="section-divider" aria-hidden="true">
      <div className="section-divider-line" />
      <div className="section-divider-gem">
        <svg width="18" height="18" viewBox="0 0 18 18">
          <polygon points="9,0 18,9 9,18 0,9" fill="none" stroke="url(#dg)" strokeWidth="1.2"/>
          <polygon points="9,3 15,9 9,15 3,9" fill="url(#dg2)" opacity="0.4"/>
          <defs>
            <linearGradient id="dg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#f5c842"/>
              <stop offset="50%" stopColor="#6dd8f0"/>
              <stop offset="100%" stopColor="#d98fbf"/>
            </linearGradient>
            <linearGradient id="dg2" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#f5c842"/>
              <stop offset="100%" stopColor="#6dd8f0"/>
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div className="section-divider-line" />
    </div>
  )
}

function getYouTubeId(url) {
  if (!url) return null
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  )
  return match ? match[1] : null
}

// ── Modal Projet ────────────────────────────────────────────────────────────
function ProjectModal({ project, onClose }) {
  const [galleryIndex, setGalleryIndex] = useState(0)

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') setGalleryIndex(i => (i + 1) % (project.images?.length || 1))
      if (e.key === 'ArrowLeft')  setGalleryIndex(i => (i - 1 + (project.images?.length || 1)) % (project.images?.length || 1))
    }
    document.addEventListener('keydown', handleKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
    }
  }, [onClose, project])

  if (!project) return null

  const ytId       = getYouTubeId(project.youtubeUrl)
  // Galerie si images[] présent, sinon vidéo seule, sinon image simple
  const hasGallery = project.images && project.images.length > 0

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Fermer">✕</button>

        {/* Image / vidéo / galerie */}
        <div className="modal-media">
          {hasGallery ? (
            <div className="modal-gallery">
              <div className="modal-gallery-main">
                <img
                  src={project.images[galleryIndex]}
                  alt={`${project.title} — vue ${galleryIndex + 1}`}
                  className="modal-img"
                />
                {project.images.length > 1 && <>
                  <button
                    className="modal-gallery-arrow modal-gallery-arrow--left"
                    onClick={() => setGalleryIndex(i => (i - 1 + project.images.length) % project.images.length)}
                    aria-label="Image précédente"
                  >❮</button>
                  <button
                    className="modal-gallery-arrow modal-gallery-arrow--right"
                    onClick={() => setGalleryIndex(i => (i + 1) % project.images.length)}
                    aria-label="Image suivante"
                  >❯</button>
                  <span className="modal-gallery-counter">{galleryIndex + 1} / {project.images.length}</span>
                </>}
              </div>
              {project.images.length > 1 && (
                <div className="modal-gallery-thumbs">
                  {project.images.map((src, i) => (
                    <button
                      key={i}
                      className={`modal-gallery-thumb ${i === galleryIndex ? 'modal-gallery-thumb--active' : ''}`}
                      onClick={() => setGalleryIndex(i)}
                      aria-label={`Vue ${i + 1}`}
                    >
                      <img src={src} alt={`miniature ${i + 1}`} />
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : ytId ? (
            <iframe
              src={`https://www.youtube.com/embed/${ytId}`}
              title={project.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="modal-iframe"
            />
          ) : project.image ? (
            <img src={project.image} alt={project.title} className="modal-img" />
          ) : null}
        </div>

        {/* Contenu */}
        <div className="modal-body">
          <span className="section-tag" style={{ fontSize: '0.7rem' }}>{project.category}</span>
          <h2 className="modal-title">{project.title}</h2>
          <p className="modal-desc">{project.details || project.description}</p>
          <div className="modal-tech">
            {project.tech.map((t, i) => (
              <span key={i} className="tech-tag">{t}</span>
            ))}
          </div>
          <div className="modal-links">
            {project.itchUrl && (
              <a href={project.itchUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary modal-btn">
                Voir sur itch.io ↗
              </a>
            )}
            {project.youtubeUrl && (
              <a href={project.youtubeUrl} target="_blank" rel="noopener noreferrer" className="btn btn-secondary modal-btn">
                ▶ Voir sur YouTube
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Modal Mentions Légales ──────────────────────────────────────────────────
function MentionsLegalesModal({ onClose }) {
  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel modal-panel--legal" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Fermer">✕</button>
        <div className="modal-body">
          <span className="section-tag" style={{ fontSize: '0.7rem' }}>// Légal</span>
          <h2 className="modal-title" style={{ marginBottom: '2rem' }}>Mentions Légales</h2>

          <div className="legal-block">
            <h3 className="legal-heading">Éditeur du site</h3>
            <p>Ce portfolio est édité à titre personnel par <strong>Alexandre Bely</strong>, étudiant en Game Design à l'école Brassart.</p>
            <p>Contact : <a href="mailto:alex.bely515@gmail.com" className="legal-link">alex.bely515@gmail.com</a></p>
          </div>

          <div className="legal-block">
            <h3 className="legal-heading">Hébergement</h3>
            <p>Ce site est hébergé par <strong>Vercel Inc.</strong> — 340 Pine Street, Suite 701, San Francisco, CA 94104, USA.<br/>
            Site : <a href="https://vercel.com" target="_blank" rel="noopener noreferrer" className="legal-link">vercel.com</a></p>
          </div>

          <div className="legal-block">
            <h3 className="legal-heading">Propriété intellectuelle</h3>
            <p>L'ensemble des contenus présents sur ce site (textes, images, visuels de projets) est la propriété exclusive d'Alexandre Bely, sauf mention contraire. Toute reproduction est interdite sans autorisation préalable.</p>
            <p>Les images de projets hébergés sur itch.io ou YouTube restent la propriété de leurs auteurs respectifs.</p>
          </div>

          <div className="legal-block">
            <h3 className="legal-heading">Données personnelles</h3>
            <p>Ce site ne collecte aucune donnée personnelle. Aucun cookie de suivi ni outil d'analytics n'est utilisé.</p>
            <p>L'adresse e-mail visible sur ce site est utilisée uniquement à des fins de prise de contact professionnel.</p>
          </div>

          <div className="legal-block">
            <h3 className="legal-heading">Liens externes</h3>
            <p>Ce site contient des liens vers des plateformes tierces (itch.io, YouTube, LinkedIn, GitHub). Alexandre Bely ne saurait être tenu responsable du contenu de ces sites externes.</p>
          </div>

          <p className="legal-footer-note">Dernière mise à jour : janvier 2026</p>
        </div>
      </div>
    </div>
  )
}

// ── App principal ────────────────────────────────────────────────────────────
function App() {
  const [scrolled, setScrolled]                   = useState(false)
  const [skillIndex, setSkillIndex]               = useState(0)
  const [selectedSkill, setSelectedSkill]         = useState(null)
  const [carouselIndex, setCarouselIndex]         = useState(0)
  const [carouselPaused, setCarouselPaused]       = useState(false)
  const [emailRevealed, setEmailRevealed]         = useState(false)
  const [activeProject, setActiveProject]         = useState(null)
  const [showMentions, setShowMentions]           = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const projects = [
    {
      title: "Asteroid Field",
      category: "Programmation",
      tech: ["Unity", "C#"],
      image: "https://img.itch.zone/aW1nLzI0MzI2MDI4LnBuZw==/315x250%23c/85I6PP.png",
      itchUrl: "https://poulet-gourmand.itch.io/asteroid-field",
      description: "Game Jam de 36h sur le thème Alien — développement d'un jeu d'astéroïdes",
      details: `Réalisé lors d'une Game Jam de 36 heures sur le thème « Alien », Asteroid Field est un jeu de survie inspiré du classique Asteroids.

Le joueur pilote un vaisseau et doit détruire les astéroïdes qui fondent sur lui tout en évitant d'être touché. Les astéroïdes se fragmentent en morceaux plus petits à chaque impact, augmentant progressivement la difficulté.

Ce projet m'a permis de pratiquer le prototypage rapide sous contrainte de temps, la gestion des collisions, le système de score et les effets visuels en C# sous Unity.`
    },
    {
      title: "Double Trouble",
      category: "Système Design Ennemis",
      tech: ["Unity", "C#"],
      youtubeUrl: "https://www.youtube.com/watch?v=G2ia7PcqPoQ",
      description: "Projet inspiré de la licence Harry Potter — développement du système d'ennemis",
      details: `Double Trouble est un projet de Système Design réalisé dans un univers inspiré de Harry Potter.

L'objectif était de concevoir et implémenter un système d'ennemis complet : comportements de patrouille, détection du joueur, phases d'attaque et de retraite, et transitions entre les états via une machine à états finie.

Ce projet m'a permis d'approfondir ma maîtrise de l'IA comportementale en Unity, en pensant chaque ennemi comme un acteur cohérent dans son environnement plutôt qu'un simple obstacle.`
    },
    {
      title: "The Silence",
      category: "Level Design",
      tech: ["UE5", "Modeling"],
      image: "https://img.itch.zone/aW1nLzE5OTMyODY0LnBuZw==/315x250%23c/p9OWjZ.png",
      itchUrl: "https://yuseless.itch.io/the-silence",
      description: "Création d'un niveau sur Unreal Engine 5",
      details: `The Silence est un projet de Level Design réalisé sur Unreal Engine 5. L'objectif était de concevoir un niveau cohérent, lisible et immersif à partir de zéro.

J'ai travaillé sur le flow du niveau, le placement des éléments de décor pour guider le joueur de manière implicite, ainsi que sur l'ambiance générale à travers le lighting et la composition des espaces.

Les outils de modélisation intégrés d'UE5 ont été utilisés pour créer certains éléments environnementaux sur mesure. Ce projet m'a appris à penser l'espace de jeu comme un langage visuel à part entière.`
    },
    {
      title: "cntxt.exe",
      category: "Level Design",
      tech: ["UE5", "Modeling", "Lumen", "Shaders"],
      image: "/cntxt-1.png",
      images: ["/cntxt-1.png", "/cntxt-2.png", "/cntxt-3.png", "/cntxt-4.png"],
      description: "Musée virtuel interactif sur le thème du contexte — conçu pour une classe de fac de lettres",
      details: `cntxt.exe est un musée virtuel réalisé sur Unreal Engine 5, conçu à destination d'une classe de faculté de lettres dans le cadre d'une exposition sur le thème du contexte.

L'objectif était de créer un espace muséal crédible et immersif, où chaque salle pose la question : « Si le contexte peut créer ou détruire une œuvre... que regardons-nous vraiment ? »

Le projet met en scène plusieurs salles thématiques : une entrée épurée avec identité visuelle forte, une salle conceptuelle avec sculpture sur socle, une salle immersive autour de Tchernobyl et la presse, et une galerie photo contextuelle.

Techniquement, j'ai utilisé le Modeling Mode d'UE5 pour modéliser les éléments architecturaux sur mesure, des shaders personnalisés pour les matériaux, et Lumen pour un éclairage dynamique et réaliste qui amplifie l'atmosphère de chaque espace.`
    },
    {
      title: "Unjudged",
      category: "Projet de Fin d'Année",
      tech: ["UE5", "Blueprints", "Destruction", "Behaviour Tree"],
      image: "/unjudged-1.png",
      images: ["/unjudged-1.png", "/unjudged-2.png", "/unjudged-3.png"],
      youtubeUrl: "https://youtu.be/obGpQriPBVY",
      description: "Jeu de combat en groupe — projet de fin d'année avec système de destruction sur UE5",
      details: `Unjudged est un projet de fin d'année réalisé en groupe sur Unreal Engine 5.

Unjudged est un beat'em all en vue du dessus dans lequel vous incarnez Simon, une personne fraîchement morte se retrouvant au Paradis. D'après les anges, vous avez été un salaud — mais vous n'êtes pas de cet avis, et vous êtes bien décidé à le faire savoir. Vous fuyez votre jugement, et votre corps ainsi que votre esprit se dissocient en deux entités distinctes. Vous devrez affronter des hordes d'anges à l'aide des compétences propres à chacune de vos entités afin de retourner dans le monde réel.

Le projet intègre un système de destruction dynamique : les éléments du décor peuvent être détruits en temps réel pendant les combats, modifiant l'espace de jeu et forçant les joueurs à adapter leur stratégie.

J'ai conçu et implémenté cinq ennemis distincts, chacun avec son propre comportement et caractère, en utilisant les Behaviour Trees d'Unreal Engine 5.`,
    },
  ]

  // Carrousel automatique
  useEffect(() => {
    if (carouselPaused) return
    const timer = setInterval(() => {
      setCarouselIndex(i => (i + 1) % projects.length)
    }, 3000)
    return () => clearInterval(timer)
  }, [carouselPaused, projects.length])

  // ── COMPÉTENCES ──────────────────────────────────────────────────────────
  const VS_CODE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#007ACC"><path d="M23.15 2.587L18.21.21a1.494 1.494 0 0 0-1.705.29l-9.46 8.63-4.12-3.128a.999.999 0 0 0-1.276.057L.327 7.261A1 1 0 0 0 .326 8.74L3.899 12 .326 15.26a1 1 0 0 0 .001 1.479L1.65 17.94a.999.999 0 0 0 1.276.057l4.12-3.128 9.46 8.63a1.492 1.492 0 0 0 1.704.29l4.942-2.377A1.5 1.5 0 0 0 24 19.88V4.12a1.5 1.5 0 0 0-.85-1.533zM16.618 19.88L9.3 12l7.318-7.88v15.76z"/></svg>`

  const skills = [
    { logos: [{ src: "https://cdn.simpleicons.org/unity/ffffff", alt: "Unity" }], name: "Unity", desc: "Développement de mécaniques de jeu 2D/3D, scripting en C#, prototypage rapide de mécaniques de jeu, utilisation de ProBuilder." },
    { logos: [{ src: "https://cdn.simpleicons.org/unrealengine/ffffff", alt: "Unreal Engine" }], name: "Unreal Engine 5", desc: "Conception de niveaux en Level Design, utilisation des outils de modélisation." },
    { svg: VS_CODE_SVG, name: "Visual Studio Code", desc: "Éditeur principal pour le scripting C# sur Unity." },
    { logos: [{ src: "https://cdn.simpleicons.org/miro/FFD02F", alt: "Miro" }], name: "Miro", desc: "Création de moodboards, de systèmes et de gestion de projets." },
    { logos: [{ src: "https://cdn.simpleicons.org/git/F05032", alt: "Git" }], name: "Git", desc: "Gestion de version en équipe, organisation des branches de développement." },
    { logos: [{ src: "https://cdn.simpleicons.org/google/4285F4", alt: "Google" }], name: "Google Suite", desc: "Rédaction de Game Doc (FSO), suivi de production sur tableurs (Sheets)." },
    { fallback: { label: "inky", color: "#00d9ff" }, name: "Inky", desc: "Écriture de dialogues et récits branchiaux avec le langage Ink." },
    { fallback: { label: "Twine", color: "#8b5cf6" }, name: "Twine", desc: "Prototypage de jeux narratifs et d'arbres de décision interactifs." },
    { fallback: { label: "SVN", color: "#609926" }, name: "TortoiseSVN", desc: "Versioning de projets Unreal Engine." }
  ]

  const SKILLS_VISIBLE = 5
  const canPrev = skillIndex > 0
  const canNext = skillIndex < skills.length - SKILLS_VISIBLE

  return (
    <div className="portfolio">

      {/* ── Modals ── */}
      {activeProject && <ProjectModal project={activeProject} onClose={() => setActiveProject(null)} />}
      {showMentions  && <MentionsLegalesModal onClose={() => setShowMentions(false)} />}

      {/* ── Navigation ── */}
      <nav className={`nav ${scrolled ? 'nav-scrolled' : ''}`}>
        <div className="nav-container">
          <div className="nav-logo">
            <span className="logo-bracket">{'['}</span>
            <span className="logo-text">Portfolio</span>
            <span className="logo-bracket">{']'}</span>
          </div>
          <ul className="nav-links">
            <li><a href="#accueil">Accueil</a></li>
            <li><a href="#apropos">Profil</a></li>
            <li><a href="#projets">Projets</a></li>
            <li><a href="#competences">Outils</a></li>
            <li><a href="#contact">Me Contacter</a></li>
            <li>
              <a href="/cv.pdf" target="_blank" rel="noopener noreferrer" className="nav-cv-link">
                CV ↓
              </a>
            </li>
          </ul>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section id="accueil" className="hero">
        <div className="hero-background" style={{ backgroundImage: `url('/preview.png')` }}></div>
        <Particles />
        <div className="hero-content">
          <div className="hero-tag">Game Designer</div>
          <h1 className="hero-title">
            Spécialisé dans le{' '}
            <span className="hero-title-accent">Système Design</span> & le{' '}
            <span className="hero-title-accent">Level Design</span>
          </h1>
          <p className="hero-subtitle">
            Je maîtrise plusieurs logiciels et je sais prototyper mes idées rapidement.
          </p>
          <div className="hero-cta">
            <a href="#projets" className="btn btn-primary">Explorer mes travaux</a>
            <a href="/cv.pdf" target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
              Télécharger mon CV
            </a>
          </div>
        </div>
        <div className="hero-scroll">Défiler</div>
      </section>

      <SectionDivider />

      {/* ── À propos ── */}
      <section id="apropos" className="about">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">// Profil</span>
            <h2 className="section-title">À propos</h2>
          </div>

          <div className="about-content">
            <div className="about-photo-col">
              <div className="about-photo-frame">
                <div className="about-photo-placeholder">
                  <span>🧑‍💻</span>
                  <span>Ta photo ici</span>
                  <span style={{ fontSize: '0.72rem', opacity: 0.6 }}>src="/ta-photo.jpg"</span>
                </div>
              </div>
              <span className="about-badge">Disponible pour projets</span>
            </div>

            <div className="about-text-col">
              <p>
                Étudiant en <strong>Game Design à Brassart</strong>, je me spécialise dans le
                <strong> Système Design</strong> et le <strong>Level Design</strong>, avec une
                touche de programmation pour donner vie à mes idées.
              </p>
              <p>
                J'aime concevoir des <strong>mécaniques de jeu fun et surprenantes</strong>,
                puis construire les niveaux qui les mettent en valeur — des espaces où le joueur
                sourit sans savoir pourquoi.
              </p>
              <p>
                Passionné par les jeux depuis tout petit, mon moteur c'est simple :
                <strong> transmettre cette passion</strong> à travers chaque projet que je crée.
              </p>

              <div className="passions-header">
                <div className="passions-line" />
                <span className="passions-title">Passions</span>
                <div className="passions-line" />
              </div>
              <div className="passions-grid">
                {[
                  { label: 'Film',       color: 'cyan'  },
                  { label: 'Game Design',     color: 'gold'  },
                  { label: 'Musique',         color: 'rose'  },
                  { label: 'Manga/Anime', color: 'green' },
                ].map((p, i) => (
                  <div key={i} className={`passion-card passion-card--${p.color}`}>
                    <span className="passion-label">{p.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <SectionDivider />

      {/* ── Projets ── */}
      <section id="projets" className="projects">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">// Projets</span>
            <h2 className="section-title">Mes Réalisations</h2>
          </div>

          <div
            className="carousel-wrapper"
            onMouseEnter={() => setCarouselPaused(true)}
            onMouseLeave={() => setCarouselPaused(false)}
          >
            <div
              className="carousel-track"
              style={{ transform: `translateX(calc(-${carouselIndex * (100 / 3)}% - ${carouselIndex * (1.75 / 3)}rem))` }}
            >
              {[...projects, ...projects].map((project, index) => {
                const ytId = getYouTubeId(project.youtubeUrl)
                // Dans le carrousel : si images[] présent, on affiche image locale, sinon thumbnail YT
                const showYtThumb = !project.images && !!ytId

                return (
                  <div
                    key={index}
                    className="project-card carousel-card"
                    onClick={() => setActiveProject(project)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="project-image">
                      {showYtThumb ? (
                        <>
                          <img src={`https://img.youtube.com/vi/${ytId}/hqdefault.jpg`} alt={project.title} />
                          <div className="project-yt-overlay">
                            <div className="project-yt-play">&#9654;</div>
                          </div>
                          <span className="project-yt-badge">▶ YouTube</span>
                        </>
                      ) : (
                        <>
                          <img src={project.image} alt={project.title} />
                          <span className="project-itch-badge">Voir plus ↗</span>
                        </>
                      )}
                    </div>
                    <div className="project-content">
                      <span className="section-tag" style={{ fontSize: '0.7rem' }}>{project.category}</span>
                      <h3>{project.title}</h3>
                      <p>{project.description}</p>
                      <div className="project-tech">
                        {project.tech.map((t, i) => (
                          <span key={i} className="tech-tag">{t}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="carousel-dots">
            {projects.map((_, i) => (
              <button
                key={i}
                className={`carousel-dot ${i === carouselIndex % projects.length ? 'carousel-dot-active' : ''}`}
                onClick={() => { setCarouselIndex(i); setCarouselPaused(true); setTimeout(() => setCarouselPaused(false), 5000) }}
                aria-label={`Projet ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      <SectionDivider />

      {/* ── Compétences ── */}
      <section id="competences" className="skills">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">// Outils</span>
            <h2 className="section-title">Logiciels utilisés</h2>
          </div>

          <div className="skills-box">
            <button
              className={`skills-arrow skills-arrow-left ${!canPrev ? 'skills-arrow-disabled' : ''}`}
              onClick={() => canPrev && setSkillIndex(i => i - 1)}
              aria-label="Précédent"
            >❮</button>

            <div className="skills-slider-track">
              {skills.slice(skillIndex, skillIndex + SKILLS_VISIBLE).map((skill, index) => (
                <div
                  key={skillIndex + index}
                  className={`skill-pill ${selectedSkill?.name === skill.name ? 'skill-pill-active' : ''}`}
                  onClick={() => setSelectedSkill(selectedSkill?.name === skill.name ? null : skill)}
                >
                  <div className="skill-pill-icon">
                    {skill.svg
                      ? <img src={`data:image/svg+xml;utf8,${encodeURIComponent(skill.svg)}`} alt={skill.name} className="skill-pill-logo" />
                      : skill.logos
                        ? <img src={skill.logos[0].src} alt={skill.logos[0].alt} className="skill-pill-logo" />
                        : <span className="skill-pill-fallback" style={{ borderColor: skill.fallback.color, color: skill.fallback.color }}>{skill.fallback.label}</span>
                    }
                  </div>
                  <span className="skill-pill-name">{skill.name}</span>
                </div>
              ))}
            </div>

            <button
              className={`skills-arrow skills-arrow-right ${!canNext ? 'skills-arrow-disabled' : ''}`}
              onClick={() => canNext && setSkillIndex(i => i + 1)}
              aria-label="Suivant"
            >❯</button>
          </div>

          {selectedSkill && (
            <div className="skill-desc-panel">
              <span className="skill-desc-name">{selectedSkill.name}</span>
              <p className="skill-desc-text">{selectedSkill.desc}</p>
            </div>
          )}

          <div className="skills-dots">
            {Array.from({ length: skills.length - SKILLS_VISIBLE + 1 }).map((_, i) => (
              <button
                key={i}
                className={`skills-dot ${i === skillIndex ? 'skills-dot-active' : ''}`}
                onClick={() => setSkillIndex(i)}
                aria-label={`Aller à la position ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      <SectionDivider />

      {/* ── Contact ── */}
      <section id="contact" className="contact">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">// Me Contacter</span>
            <h2 className="section-title">Disponible pour des projets</h2>
          </div>
          <div className="contact-methods">
            <div className="contact-link-email-wrapper">
              <div
                className="contact-link contact-link-email"
                onClick={() => setEmailRevealed(!emailRevealed)}
              >
                <span>✉ Email</span>
              </div>
              <div className={`email-slide ${emailRevealed ? 'email-slide--open' : ''}`}>
                <a href="mailto:alex.bely515@gmail.com">alex.bely515@gmail.com</a>
              </div>
            </div>
            <a href="https://www.linkedin.com/feed/" className="contact-link" target="_blank" rel="noopener noreferrer">LinkedIn</a>
            <a href="https://github.com/AshiHu" className="contact-link" target="_blank" rel="noopener noreferrer">GitHub</a>
            <a href="https://ashi15.itch.io" className="contact-link" target="_blank" rel="noopener noreferrer">Itch.io</a>
            <a href="/cv.pdf" target="_blank" rel="noopener noreferrer" className="contact-link contact-link-cv">
              📄 Télécharger mon CV
            </a>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="footer">
        <p>© 2026 — Portfolio Game Designer</p>
        <button className="footer-mentions" onClick={() => setShowMentions(true)}>
          Mentions légales
        </button>
      </footer>

    </div>
  )
}

export default App

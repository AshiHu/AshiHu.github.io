import { Fragment, useEffect, useRef, useState } from 'react'

// ═══════════════════════════════════════════════════════════════════════════
//  RÉGLAGES D'ÉQUILIBRAGE — modifie ces valeurs pour régler la difficulté
// ═══════════════════════════════════════════════════════════════════════════
export const GEMS_PER_PROJECT    = 1   // gemmes gagnées à la 1re ouverture d'un projet
export const GEMS_PER_HIDDEN_GEM = 2   // gemmes gagnées par gemme cachée trouvée (4 en tout)
export const GEMS_PER_GATE       = 2   // gemmes gagnées en réussissant un mini-jeu (pas si on le passe)

// Porte -> section qu'elle débloque, et succès obtenu en réussissant le mini-jeu
export const GATE_TARGET      = { g1: 'projets', g2: 'competences', g3: 'contact' }
export const GATE_ACHIEVEMENT = { g1: 'hunt',    g2: 'memory',      g3: 'puzzle' }

// Les 4 axes du radar. Chaque projet donne des points (0 à 5) dans chaque axe,
// voir le champ `stats` de chaque projet dans App.jsx.
export const AXES = [
  { key: 'sys',  label: 'Système' },
  { key: 'lvl',  label: 'Level' },
  { key: 'prog', label: 'Programmation' },
  { key: 'narr', label: 'Narratif' },
]


// ═══════════════════════════════════════════════════════════════════════════
//  SUCCÈS
// ═══════════════════════════════════════════════════════════════════════════
export const ACHIEVEMENTS = {
  quest:     { icon: '🗺️', title: 'Première quête',     text: 'Tu as ouvert ton premier projet.' },
  collector: { icon: '📚', title: 'Collectionneur',     text: 'Tu as consulté 3 projets différents.' },
  inspector: { icon: '🛠️', title: 'Apprenti',           text: 'Tu as appris ton premier outil.' },
  tree:      { icon: '🌳', title: 'Arbre complet',      text: 'Tu as appris tous les outils.' },
  gem:       { icon: '💎', title: 'Chasseur de gemmes', text: 'Tu as trouvé une gemme cachée.' },
  vault:     { icon: '🗝️', title: 'Coffre ouvert',      text: 'Tu as débloqué un contenu bonus.' },
  hunt:      { icon: '🎯', title: 'Bon réflexe',        text: 'Tu as réussi la chasse aux gemmes.' },
  memory:    { icon: '🧠', title: 'Bonne mémoire',      text: 'Tu as retrouvé toutes les paires.' },
  puzzle:    { icon: '🧩', title: 'Verrou crocheté',    text: 'Tu as résolu la grille.' },
  contact:   { icon: '✉️', title: 'Message reçu',       text: 'Tu as révélé mon adresse e-mail.' },
  end:       { icon: '🏁', title: 'Fin du niveau',      text: 'Tu as défilé jusqu’en bas de la page.' },
}
export const TOTAL_ACHIEVEMENTS = Object.keys(ACHIEVEMENTS).length

export function AchievementToast({ id, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3500)
    return () => clearTimeout(t)
  }, [id, onDone])
  const a = ACHIEVEMENTS[id]
  if (!a) return null
  return (
    <div className="achievement-toast" role="status">
      <span className="achievement-icon">{a.icon}</span>
      <div>
        <strong>Succès débloqué : {a.title}</strong>
        <p>{a.text}</p>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
//  BARRE D'XP (haut de page) + HUD (bas gauche)
// ═══════════════════════════════════════════════════════════════════════════
export function XpBar({ progress }) {
  return (
    <div
      className="xp-bar"
      role="progressbar"
      aria-label="Progression dans la page"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(progress * 100)}
    >
      <div className="xp-bar-fill" style={{ width: `${progress * 100}%` }} />
    </div>
  )
}

export function Hud({ level, gems, achievements }) {
  return (
    <div className="hud" aria-label="État de la partie">
      <span title="Niveau : une porte franchie = un niveau">Niv. {level}/4</span>
      <span key={gems} className="hud-gems" title="Gemmes">💎 {gems}</span>
      <span title="Succès">🏆 {achievements}/{TOTAL_ACHIEVEMENTS}</span>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
//  RADAR DE COMPÉTENCES
// ═══════════════════════════════════════════════════════════════════════════
export function Radar({ projects, seen }) {
  const totals = {}
  const mine = {}
  AXES.forEach(a => {
    totals[a.key] = projects.reduce((n, p) => n + (p.stats?.[a.key] || 0), 0)
    mine[a.key] = projects
      .filter(p => seen.includes(p.title))
      .reduce((n, p) => n + (p.stats?.[a.key] || 0), 0)
  })

  const cx = 150, cy = 120, R = 80
  const angle = (i) => -Math.PI / 2 + i * (Math.PI * 2 / AXES.length)
  const point = (i, v) => [cx + Math.cos(angle(i)) * R * v, cy + Math.sin(angle(i)) * R * v]
  const polygon = (valueOf) =>
    AXES.map((a, i) => point(i, valueOf(a.key)).map(n => n.toFixed(1)).join(',')).join(' ')
  const ratio = (k) => (totals[k] ? mine[k] / totals[k] : 0)
  const anchorOf = (i) => (i === 1 ? 'start' : i === 3 ? 'end' : 'middle')

  const summary = AXES.map(a => `${a.label} ${Math.round(ratio(a.key) * 100)} %`).join(', ')

  return (
    <svg className="radar" viewBox="0 0 300 240" role="img" aria-label={`Radar de compétences : ${summary}`}>
      {[0.33, 0.66, 1].map(r => (
        <polygon key={r} className="radar-ring" points={polygon(() => r)} />
      ))}
      {AXES.map((a, i) => {
        const [x, y] = point(i, 1)
        return <line key={a.key} className="radar-axis" x1={cx} y1={cy} x2={x} y2={y} />
      })}
      <polygon className="radar-ghost" points={polygon(() => 1)} />
      <polygon className="radar-fill" points={polygon(k => Math.max(ratio(k), 0.04))} />
      {AXES.map((a, i) => {
        const [x, y] = point(i, 1.22)
        return (
          <text
            key={a.key}
            x={x} y={y + 4}
            textAnchor={anchorOf(i)}
            className="radar-label"
          >
            {a.label}
          </text>
        )
      })}
    </svg>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
//  COFFRE DE BONUS
//  Pour ajouter un contenu : copie un bloc ci-dessous, change id / title / cost
//  et écris ce qui doit s'afficher dans render().
// ═══════════════════════════════════════════════════════════════════════════
export const BONUS = [
  {
    id: 'speakup-coulisses',
    title: 'Coulisses de Speak Up',
    teaser: 'Comment le mini-jeu Mirror a été fabriqué.',
    cost: 2,
    render: () => (
      <ul className="vault-list-points">
        <li>Stage de deux mois, entièrement en télétravail, avec une équipe de game designers et de web designers.</li>
        <li>Un point de suivi chaque lundi pour partager l’avancement.</li>
        <li>Mirror est l’un des trois mini-jeux du projet.</li>
        <li>Côté technique : Unity WebGL intégré au site, communication WebSocket avec les web designers, serveur local pour tester.</li>
      </ul>
    ),
  },
  {
    id: 'cntxt-salles',
    title: 'Plan des salles de cntxt.exe',
    teaser: 'Le parcours du visiteur dans le musée.',
    cost: 2,
    render: () => (
      <ol className="vault-list-points">
        <li>Une entrée épurée, avec une identité visuelle forte.</li>
        <li>Une salle conceptuelle avec une sculpture sur socle.</li>
        <li>Une salle immersive autour de Tchernobyl et de la presse.</li>
        <li>Une galerie photo contextuelle.</li>
      </ol>
    ),
  },
  {
    id: 'doubletrouble-ia',
    title: 'Schéma d’IA de Double Trouble',
    teaser: 'La machine à états des ennemis.',
    cost: 3,
    render: () => (
      <div>
        <div className="state-flow">
          <span>Patrouille</span><i>→</i>
          <span>Détection du joueur</span><i>→</i>
          <span>Attaque</span><i>→</i>
          <span>Retraite</span><i>↺</i>
        </div>
        <p className="vault-note">Schéma simplifié de la machine à états finie des ennemis.</p>
      </div>
    ),
  },
  // Modèle à copier. Tant que `render` est absent, le contenu reste invisible :
  // {
  //   id: 'unjudged-ennemis',
  //   title: 'Les 5 ennemis d’Unjudged',
  //   teaser: 'Un comportement par ennemi.',
  //   cost: 3,
  //   render: () => <p>Ton texte ici.</p>,
  // },
]

export function Vault({ balance, openIds, onUnlock }) {
  return (
    <div className="vault">
      <h3 className="player-sheet-title">Coffre de bonus</h3>
      <p className="player-sheet-caption">
        Gemmes : <strong>{balance} 💎</strong>. Tu en gagnes en explorant les projets
        et en trouvant les gemmes cachées entre les sections.
      </p>
      <ul className="vault-list">
        {BONUS.filter(b => b.render).map(b => {
          const open = openIds.includes(b.id)
          const canBuy = balance >= b.cost
          return (
            <li key={b.id} className={`vault-item ${open ? 'vault-item--open' : ''}`}>
              <div className="vault-item-head">
                <span className="vault-item-icon" aria-hidden="true">{open ? '🔓' : '🔒'}</span>
                <div className="vault-item-text">
                  <strong>{b.title}</strong>
                  <span>{b.teaser}</span>
                </div>
                {!open && (
                  <button
                    type="button"
                    className="vault-buy"
                    disabled={!canBuy}
                    onClick={() => onUnlock(b)}
                    title={canBuy ? 'Débloquer ce contenu' : `Il te manque ${b.cost - balance} gemme(s)`}
                  >
                    {b.cost} 💎
                  </button>
                )}
              </div>
              {open && <div className="vault-item-body">{b.render()}</div>}
            </li>
          )
        })}
      </ul>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
//  ARBRE DE COMPÉTENCES
// ═══════════════════════════════════════════════════════════════════════════
function SkillIcon({ skill }) {
  if (skill.svg) {
    return <img src={`data:image/svg+xml;utf8,${encodeURIComponent(skill.svg)}`} alt="" className="skill-pill-logo" />
  }
  if (skill.logos) {
    return <img src={skill.logos[0].src} alt="" className="skill-pill-logo" />
  }
  return (
    <span className="skill-pill-fallback" style={{ borderColor: skill.fallback.color, color: skill.fallback.color }}>
      {skill.fallback.label}
    </span>
  )
}

export function SkillTree({ branches, learned, onLearn }) {
  const [selected, setSelected] = useState(null)
  const [shaking, setShaking] = useState(null)
  const [hint, setHint] = useState('')
  const total = branches.reduce((n, b) => n + b.skills.length, 0)

  const handleClick = (skill, prev) => {
    const isLearned = learned.includes(skill.name)
    const available = !prev || learned.includes(prev.name)
    if (isLearned) { setSelected(skill); setHint(''); return }
    if (!available) {
      setShaking(skill.name)
      setHint(`Apprends d’abord « ${prev.name} » pour débloquer « ${skill.name} ».`)
      setTimeout(() => setShaking(null), 400)
      return
    }
    onLearn(skill)
    setSelected(skill)
    setHint('')
  }

  return (
    <div className="tree">
      <p className="tree-counter">{learned.length}/{total} outils appris. Clique sur un outil pour l’apprendre.</p>
      <div className="tree-branches">
        {branches.map(branch => (
          <div key={branch.name} className="tree-branch">
            <h3 className="tree-branch-title">{branch.name}</h3>
            {branch.skills.map((skill, i) => {
              const prev = i > 0 ? branch.skills[i - 1] : null
              const isLearned = learned.includes(skill.name)
              const available = !prev || learned.includes(prev.name)
              const state = isLearned ? 'learned' : available ? 'available' : 'locked'
              return (
                <Fragment key={skill.name}>
                  {prev && <div className={`tree-link ${learned.includes(prev.name) ? 'tree-link--on' : ''}`} />}
                  <button
                    type="button"
                    className={`tree-node tree-node--${state} ${shaking === skill.name ? 'tree-node--shake' : ''} ${selected?.name === skill.name ? 'tree-node--selected' : ''}`}
                    aria-disabled={state === 'locked'}
                    onClick={() => handleClick(skill, prev)}
                  >
                    <span className="skill-pill-icon"><SkillIcon skill={skill} /></span>
                    <span className="tree-node-name">{skill.name}</span>
                    {state === 'locked' && <span className="tree-lock" aria-hidden="true">🔒</span>}
                  </button>
                </Fragment>
              )
            })}
          </div>
        ))}
      </div>

      <p className="tree-hint" aria-live="polite">{hint}</p>

      {selected && (
        <div className="skill-desc-panel">
          <span className="skill-desc-name">{selected.name}</span>
          <p className="skill-desc-text">{selected.desc}</p>
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
//  PORTES : chaque nouvelle partie du portfolio se débloque par un mini-jeu
// ═══════════════════════════════════════════════════════════════════════════
export function Gate({ id, level, title, intro, onSkip, children }) {
  return (
    <section id={`porte-${id}`} className="gate" aria-labelledby={`porte-${id}-titre`}>
      <div className="container gate-inner">
        <span className="section-tag">// Niveau {level}</span>
        <h2 id={`porte-${id}-titre`} className="section-title">{title}</h2>
        <p className="gate-intro">{intro}</p>
        <div className="gate-play">{children}</div>
        <button type="button" className="gate-skip" onClick={onSkip}>Passer cette étape</button>
      </div>
    </section>
  )
}

// ── Mini-jeu 1 : chasse aux gemmes (réflexes) ───────────────────────────────
const GEM_GOAL = 5
const GEM_LIFETIME = 1500 // ms avant que la gemme change de place
const randomPos = () => ({ x: 10 + Math.random() * 80, y: 12 + Math.random() * 76 })

export function GemHunt({ onWin }) {
  const [started, setStarted] = useState(false)
  const [hits, setHits] = useState(0)
  const [misses, setMisses] = useState(0)
  const [pos, setPos] = useState(randomPos)
  const done = hits >= GEM_GOAL

  useEffect(() => {
    if (!started || done) return
    const t = setTimeout(() => { setMisses(m => m + 1); setPos(randomPos()) }, GEM_LIFETIME)
    return () => clearTimeout(t)
  }, [started, done, pos])

  useEffect(() => {
    if (!done) return
    const t = setTimeout(onWin, 700)
    return () => clearTimeout(t)
  }, [done]) // eslint-disable-line react-hooks/exhaustive-deps

  const hit = () => { setHits(h => h + 1); setPos(randomPos()) }

  return (
    <div>
      <p className="hunt-hud" aria-live="polite">
        <span>💎 {hits}/{GEM_GOAL}</span>
        <span>{done ? 'Porte ouverte !' : `Gemmes ratées : ${misses}`}</span>
      </p>
      <div className="hunt-field">
        {!started && (
          <button type="button" className="hunt-start" onClick={() => setStarted(true)}>Jouer</button>
        )}
        {started && !done && (
          <button
            key={`${pos.x}-${pos.y}`}
            type="button"
            className="hunt-gem"
            style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
            onClick={hit}
            aria-label="Attraper la gemme"
          >💎</button>
        )}
      </div>
    </div>
  )
}

// ── Mini-jeu 2 : memory des outils (mémoire) ────────────────────────────────
function shuffle(list) {
  const a = [...list]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function MemoryGame({ tools, onWin }) {
  const [deck] = useState(() => shuffle([...tools, ...tools].map((tool, uid) => ({ uid, tool }))))
  const [flipped, setFlipped] = useState([])
  const [matched, setMatched] = useState([])
  const [moves, setMoves] = useState(0)
  const busy = useRef(false)
  const timer = useRef(null)
  const won = matched.length === tools.length

  useEffect(() => () => clearTimeout(timer.current), [])
  useEffect(() => {
    if (!won) return
    const t = setTimeout(onWin, 700)
    return () => clearTimeout(t)
  }, [won]) // eslint-disable-line react-hooks/exhaustive-deps

  const flip = (i) => {
    if (busy.current || flipped.includes(i) || matched.includes(deck[i].tool.name)) return
    const next = [...flipped, i]
    setFlipped(next)
    if (next.length < 2) return
    setMoves(m => m + 1)
    const [a, b] = next
    if (deck[a].tool.name === deck[b].tool.name) {
      setMatched(m => [...m, deck[a].tool.name])
      setFlipped([])
    } else {
      busy.current = true
      timer.current = setTimeout(() => { setFlipped([]); busy.current = false }, 800)
    }
  }

  return (
    <div>
      <p className="hunt-hud" aria-live="polite">
        <span>Paires : {matched.length}/{tools.length}</span>
        <span>{won ? 'Porte ouverte !' : `Coups : ${moves}`}</span>
      </p>
      <div className="memory-grid">
        {deck.map((card, i) => {
          const isMatched = matched.includes(card.tool.name)
          const shown = isMatched || flipped.includes(i)
          return (
            <button
              key={card.uid}
              type="button"
              data-key={card.tool.name}
              className={`memory-card ${shown ? 'memory-card--shown' : ''} ${isMatched ? 'memory-card--matched' : ''}`}
              aria-label={shown ? card.tool.name : 'Carte face cachée'}
              onClick={() => flip(i)}
            >
              {shown ? (
                <>
                  <span className="skill-pill-icon"><SkillIcon skill={card.tool} /></span>
                  <span className="memory-card-name">{card.tool.name}</span>
                </>
              ) : <span className="memory-card-back" aria-hidden="true">?</span>}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ── Mini-jeu 3 : grille « allume tout » (logique) ───────────────────────────
function pressCell(grid, i) {
  const next = [...grid]
  const r = Math.floor(i / 3), c = i % 3
  ;[[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dr, dc]) => {
    const rr = r + dr, cc = c + dc
    if (rr >= 0 && rr < 3 && cc >= 0 && cc < 3) next[rr * 3 + cc] = !next[rr * 3 + cc]
  })
  return next
}

function newPuzzle() {
  // On part de la grille résolue et on appuie sur 4 cases distinctes :
  // appuyer sur les mêmes cases résout toujours la grille.
  let grid = Array(9).fill(true)
  shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8]).slice(0, 4).forEach(i => { grid = pressCell(grid, i) })
  return grid
}

export function LightsOut({ onWin }) {
  const [grid, setGrid] = useState(newPuzzle)
  const [moves, setMoves] = useState(0)
  const solved = grid.every(Boolean)

  useEffect(() => {
    if (!solved) return
    const t = setTimeout(onWin, 600)
    return () => clearTimeout(t)
  }, [solved]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="lock">
      <p className="lock-help">Allume toutes les cases. Chaque case change aussi ses voisines (haut, bas, gauche, droite).</p>
      <div className="lock-grid">
        {grid.map((on, i) => (
          <button
            key={i}
            type="button"
            className={`lock-cell ${on ? 'lock-cell--on' : ''}`}
            aria-label={`Case ${i + 1}, ${on ? 'allumée' : 'éteinte'}`}
            disabled={solved}
            onClick={() => { setGrid(g => pressCell(g, i)); setMoves(m => m + 1) }}
          />
        ))}
      </div>
      <p className="lock-moves" aria-live="polite">{solved ? 'Porte ouverte !' : `Coups : ${moves}`}</p>
      <button type="button" className="lock-btn" onClick={() => { setGrid(newPuzzle()); setMoves(0) }}>
        Nouvelle grille
      </button>
    </div>
  )
}

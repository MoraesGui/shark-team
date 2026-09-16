import { useEffect, useRef, useState, type MouseEvent, type ReactNode } from 'react';
import { ArrowDown, ArrowUpRight, Menu, X } from 'lucide-react';
import { motion, useReducedMotion, useScroll } from 'motion/react';
import EditorialGallery from './EditorialGallery';
import MagneticCarousel from './MagneticCarousel';

const LOGO = '/images/85BBXwF.png';
const WHATSAPP = 'https://wa.me/5519981017575?text=' + encodeURIComponent('Olá, Shark! Quero agendar uma aula experimental em Indaiatuba.');
const INSTAGRAM = 'https://instagram.com/sharkmma_';
const trainingImages: Record<string, string> = {
  mma: '/images/mma-treinos.jpg',
  boxe: '/images/boxe-treinos.jpg',
  'muay-thai': '/images/muay-treinos.jpg',
};
const trainingVideos: Record<string, string> = {
  mma: '/videos/mma_training.mp4',
  boxe: '/videos/boxing.mp4',
  'muay-thai': '/videos/muay-thai.mp4',
};
const navigation = [
  ['home', 'INÍCIO'], ['treinos', 'TREINOS'], ['sobre', 'SOBRE'], ['contato', 'CONTATO'],
];
const disciplines = [
  { id: 'mma', number: '01', name: 'MMA', image: '/images/editorial-mma.jpg', alt: 'Shark aplicando uma técnica de solo no ringue', short: 'Um jogo completo. Corpo e mente trabalhando juntos.', slogan: <>FORÇA.<br />TÉCNICA.<br />COMBATE.</>, description: 'Conecte os fundamentos da luta. Desenvolva técnica, leitura de movimento e controle para construir um jogo cada vez mais completo.', details: ['Fundamentos de combate', 'Coordenação e controle', 'Preparação física'] },
  { id: 'boxe', number: '02', name: 'BOXE', image: '/images/editorial-boxe.jpg', alt: 'Shark em uma sequência de socos durante o treino', short: 'Cada movimento conta. Cada golpe tem uma intenção.', slogan: <>PRECISÃO.<br />VELOCIDADE.<br />POTÊNCIA.</>, description: 'Guarda, golpes e jogo de pernas. Aprenda a se movimentar com intenção, melhorar o tempo de reação e encontrar potência na técnica.', details: ['Combinações de golpes', 'Esquivas e movimentação', 'Ritmo e precisão'] },
  { id: 'muay-thai', number: '03', name: 'MUAY THAI', image: '/images/editorial-muay-thai.jpg', alt: 'Shark em treino de manoplas', short: 'Presença, resistência e a força de continuar.', slogan: <>DISCIPLINA.<br />RESISTÊNCIA.<br />IMPACTO.</>, description: 'Trabalhe golpes, combinações e distância. Um treino que une concentração e intensidade para desenvolver seu condicionamento a cada round.', details: ['Golpes e combinações', 'Equilíbrio e distância', 'Resistência e foco'] },
];
const benefits = [
  { title: 'PERFORMANCE', description: 'Evolução construída a cada treino.' },
  { title: 'DISCIPLINA', description: 'Consistência para ir além da vontade.' },
  { title: 'CONDICIONAMENTO', description: 'Mais preparo para sustentar seu ritmo.' },
  { title: 'TÉCNICA', description: 'Precisão antes de força. Fundamento sempre.' },
  { title: 'CONFIANÇA', description: 'Conheça sua capacidade. Supere seus limites.' },
];

function Reveal({ children, className = '' }: { children: ReactNode; className?: string; key?: string }) {
  const reduced = useReducedMotion();
  return <motion.div className={className} initial={{ opacity: reduced ? 1 : 0, y: reduced ? 0 : 22 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .1 }} transition={{ duration: .55 }}>{children}</motion.div>;
}

function TrainingLink({ children = 'TREINE COM O SHARK', dark = false, className = '', withSharkLogo = false }: { children?: ReactNode; dark?: boolean; className?: string; withSharkLogo?: boolean }) {
  return <a className={`action-button ${dark ? 'action-dark' : ''} ${withSharkLogo ? 'action-with-logo' : ''} ${className}`} href={WHATSAPP} target="_blank" rel="noopener noreferrer">{withSharkLogo && <img className="action-button-logo" src="/images/shark-mentalidade.png" alt="" width="48" height="32" />}<span>{children}</span>{!withSharkLogo && <ArrowUpRight size={19} aria-hidden="true" />}</a>;
}

export default function Campaign() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const trigger = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll();

  useEffect(() => {
    let frame = 0;
    const sections = [...document.querySelectorAll<HTMLElement>('main section[id]')];
    const update = () => {
      frame = 0;
      const current = [...sections].reverse().find(section => section.getBoundingClientRect().top <= innerHeight * .35);
      setActiveSection(current?.id || 'home');
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => { cancelAnimationFrame(frame); window.removeEventListener('scroll', schedule); window.removeEventListener('resize', schedule); };
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    menu.current?.querySelector('a')?.focus();
    const key = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { setMenuOpen(false); trigger.current?.focus(); }
      if (event.key !== 'Tab') return;
      const links = menu.current?.querySelectorAll('a');
      const lastLink = links?.[links.length - 1];
      if (!event.shiftKey && document.activeElement === lastLink) { event.preventDefault(); trigger.current?.focus(); }
      if (event.shiftKey && document.activeElement === trigger.current) { event.preventDefault(); lastLink?.focus(); }
    };
    const desktop = matchMedia('(min-width: 1100px)');
    const close = () => { if (desktop.matches) setMenuOpen(false); };
    document.addEventListener('keydown', key);
    desktop.addEventListener('change', close);
    return () => { document.body.style.overflow = previous; document.removeEventListener('keydown', key); desktop.removeEventListener('change', close); };
  }, [menuOpen]);

  function navigate(event: MouseEvent<HTMLAnchorElement>, id: string) {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
    const target = document.getElementById(id);
    if (!target) return;
    event.preventDefault();
    setMenuOpen(false);
    history.pushState(null, '', `#${id}`);
    requestAnimationFrame(() => {
      target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
      target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
    });
  }

  return <div className="shark-site">
    <a className="skip-link" href="#home" onClick={event => navigate(event, 'home')}>Pular para o conteúdo</a>
    <header className="site-header">
      <motion.div className="header-progress" style={{ scaleX: scrollYProgress }} aria-hidden="true" />
      <div className="header-inner">
        <a className="brand" href="#home" onClick={event => navigate(event, 'home')} aria-label="Shark — início"><img src={LOGO} width="116" height="58" alt="SHARK" /></a>
        <nav className="desktop-nav" aria-label="Navegação principal">{navigation.map(([id, label]) => <a key={id} href={`#${id}`} aria-current={activeSection === id ? 'location' : undefined} onClick={event => navigate(event, id)}>{label}</a>)}</nav>
        <TrainingLink className="header-cta">COMECE AGORA</TrainingLink>
        <button ref={trigger} className="menu-toggle" aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'} aria-expanded={menuOpen} aria-controls="mobile-menu" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X /> : <Menu />}</button>
      </div>
      {menuOpen && <div ref={menu} id="mobile-menu" className="mobile-menu"><nav aria-label="Navegação móvel">{navigation.map(([id, label], index) => <a key={id} href={`#${id}`} onClick={event => navigate(event, id)}><span>0{index + 1}</span>{label}<ArrowUpRight size={24} aria-hidden="true" /></a>)}</nav><TrainingLink>COMECE AGORA</TrainingLink></div>}
    </header>

    <main>
      <section id="home" className="campaign-hero">
        <video className="hero-background-video" autoPlay loop muted playsInline preload="auto" disablePictureInPicture aria-hidden="true" tabIndex={-1}>
          <source src="/videoshark.mp4" type="video/mp4" />
        </video>
        <div className="hero-video-shade" aria-hidden="true" />
        <div className="hero-grain" aria-hidden="true" />
        <div className="hero-layout section-wrap">
          <div className="hero-intro"><span className="eyebrow"><i /> INDAIATUBA / SHARK TEAM</span><span className="hero-edition">MENTALIDADE DE LUTA.</span></div>
          <div className="hero-heading"><h1>VENHA SE<br />TORNAR UM<br /><span>TUBARÃO.</span></h1><p className="hero-subtitle">AULAS DE MMA, BOXE E MUAY THAI</p><TrainingLink /></div>
          <div className="hero-bottom"><p>Treinamento para quem quer evoluir, ganhar confiança<br className="desktop-break" /> e superar seus próprios limites.</p></div>
        </div>
      </section>

      <section id="treinos" className="start-section section-space">
        <div className="section-wrap">
          <Reveal className="section-heading"><div><h2>COMECE AQUI<span className="red-dot">.</span></h2></div></Reveal>
          <div className="discipline-grid">{disciplines.map(item => <Reveal className="discipline-card" key={item.id}><a className="discipline-image" href={`#${item.id}`} onClick={event => navigate(event, item.id)} aria-label={`Conheça o treino de ${item.name}`}><img src={trainingImages[item.id]} alt={`Treino de ${item.name}`} loading="lazy" width="720" height="960" /><span className="discipline-number">{item.number}</span></a><a className="discipline-name" href={`#${item.id}`} onClick={event => navigate(event, item.id)}><h3>{item.name}</h3></a><a className="text-link" href={`#${item.id}`} onClick={event => navigate(event, item.id)}>SAIBA MAIS <ArrowDown size={15} aria-hidden="true" /></a></Reveal>)}</div>
        </div>
      </section>

      <div className="programs">{disciplines.map(item => <section id={item.id} className={`program-section program-${item.id}`} key={item.id}><div className="section-wrap program-layout"><Reveal className="program-copy"><span className="eyebrow">{item.number} / {item.name}</span><h2>{item.slogan}</h2><p className="body-copy">{item.description}</p><ul className="program-details">{item.details.map(detail => <li key={detail}>{detail}</li>)}</ul><a className="text-link" href={WHATSAPP} target="_blank" rel="noopener noreferrer">QUERO TREINAR {item.name} <ArrowUpRight size={18} aria-hidden="true" /></a></Reveal><Reveal className="program-visual"><div className="program-video-frame"><video autoPlay muted loop playsInline preload="metadata" poster={item.image} disablePictureInPicture tabIndex={-1} aria-label={`Vídeo de treino de ${item.name}`}><source src={trainingVideos[item.id]} type="video/mp4" /></video></div><span className="program-word" aria-hidden="true">{item.name}</span><span className="program-caption">SHARK TEAM / {item.name}</span></Reveal></div></section>)}</div>

      <section id="sobre" className="about-section section-space">
        <div className="about-backdrop" aria-hidden="true"><img src="/sharkcostas.png" alt="" loading="lazy" width="1024" height="1536" /></div>
        <div className="section-wrap about-layout">
          <Reveal className="about-copy">
            <span className="eyebrow">03 / A MENTALIDADE SHARK</span>
            <h2>ATLETA NO RINGUE.<br /><span className="outline-type">SHARK NA VIDA.</span></h2>
            <p className="body-copy">Shark é atleta profissional. A luta faz parte da sua vida — na preparação, na disciplina e na forma de encarar cada desafio.</p>
            <p className="body-copy">É essa vivência que ele leva às aulas de MMA, Boxe e Muay Thai em Indaiatuba. Um contato direto com quem vive o esporte, com atenção à técnica e respeito ao ritmo de cada aluno.</p>
            <a className="text-link" href={INSTAGRAM} target="_blank" rel="noopener noreferrer">CONHEÇA MAIS DO SHARK <ArrowUpRight size={18} aria-hidden="true" /></a>
          </Reveal>
          <Reveal className="about-gallery"><MagneticCarousel /></Reveal>
        </div>
      </section>

      <section id="metodologia" className="method-section light-section angled-section section-space">
        <div className="section-wrap method-layout">
          <Reveal className="method-photo"><img src="/images/DaVFG8h.jpeg" alt="Shark no ringue com sua equipe" width="2304" height="1296" loading="lazy" /><span className="image-caption">NO TREINO. NO RINGUE. NA VIDA.</span><span className="photo-stamp" aria-hidden="true">SHARK<br />MENTALITY</span></Reveal>
          <Reveal className="method-copy"><h2>TREINE COMO<br />UM TUBARÃO.</h2><p className="body-copy">O próximo nível começa no básico bem feito. Treino com intenção, atenção à técnica e disciplina para continuar. A evolução é sua. O trabalho, a gente faz junto.</p><ol className="benefit-list">{benefits.map(({ title, description }, index) => <li key={title}><span className="benefit-number">{String(index + 1).padStart(2, '0')}</span><div><h3>{title}</h3><p>{description}</p></div></li>)}</ol></Reveal>
        </div>
      </section>

      <section id="alunos" className="experience-section section-space" aria-label="Shark Team Indaiatuba — registros do tatame"><div className="section-wrap"><EditorialGallery /></div></section>

      <section id="contato" className="final-section section-space"><img src={LOGO} className="final-logo" aria-hidden="true" alt="" /><Reveal className="section-wrap"><h2>TORNE-SE UM<br />TUBARÃO.</h2><p>MMA <span>•</span> BOXE <span>•</span> MUAY THAI</p><TrainingLink withSharkLogo /></Reveal></section>
    </main>

    <footer className="site-footer"><div className="section-wrap"><div className="footer-main"><a href="#home" onClick={event => navigate(event, 'home')} aria-label="Voltar ao início"><img src={LOGO} alt="SHARK" width="150" height="75" /></a><nav aria-label="Links do rodapé"><a href="#treinos" onClick={event => navigate(event, 'treinos')}>TREINOS</a><a href="#sobre" onClick={event => navigate(event, 'sobre')}>SOBRE</a><a href="#alunos" onClick={event => navigate(event, 'alunos')}>NOSSO TIME</a></nav><div><a href={INSTAGRAM} target="_blank" rel="noopener noreferrer">INSTAGRAM ↗</a><a href={WHATSAPP} target="_blank" rel="noopener noreferrer">WHATSAPP ↗</a></div><p>INDAIATUBA, SP<br /><span>Bazar Ponto 1</span></p></div><div className="footer-bottom"><span>© {new Date().getFullYear()} SHARK TEAM. TODOS OS DIREITOS RESERVADOS.</span><span>DISCIPLINA FORMA. FOCO TRANSFORMA.</span></div></div></footer>
  </div>;
}

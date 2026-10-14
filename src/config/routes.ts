export const routes = {
  home: '/',
  login: '/login/',
  signup: '/cadastro/',
  plateResult: '/consulta/placa/resultado/',
  buyCredits: '/comprar-creditos/',
  myLookups: '/minhas-consultas/',
  userArea: '/area-usuario/',
  help: '/informacoes/',
  contact: '/contato/',
} as const;

export const legalPages = [
  { path: '/sobre/', name: 'Sobre nós' },
  { path: '/termos-uso/', name: 'Termos de Uso' },
  { path: '/politica-privacidade/', name: 'Política de Privacidade' },
  { path: '/politica-cookies/', name: 'Política de Cookies' },
  { path: '/lgpd/', name: 'LGPD' },
  { path: '/aviso-legal/', name: 'Aviso legal' },
  { path: '/politica-reembolso/', name: 'Política de Reembolso' },
] as const;

export const apiPaths = {
  plateLookup: '/api/placa/consultar',
  login: '/api/auth/login',
  logout: '/api/auth/logout',
  refresh: '/api/auth/refresh',
  profile: '/api/user/profile',
  userLookups: '/api/user/consultas',
  publicSettings: '/api/public/settings',
  controllerSummary: '/api/controller/summary',
} as const;

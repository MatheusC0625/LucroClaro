export interface NavItem {
  path: string
  label: string
}

export const navItems: NavItem[] = [
  { path: '/', label: 'Início' },
  { path: '/importar', label: 'Importar' },
  { path: '/produtos', label: 'Produtos e custos' },
  { path: '/comparar', label: 'Comparar' },
  { path: '/lucro-por-produto', label: 'Lucro por produto' },
  { path: '/mei', label: 'Controle MEI' },
]

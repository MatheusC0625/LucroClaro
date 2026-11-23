import { createBrowserRouter } from 'react-router-dom'
import { Layout } from '../components/layout/Layout'
import { HomePage } from '../pages/HomePage'
import { PlaceholderPage } from '../pages/PlaceholderPage'
import { ProductsPage } from '../pages/ProductsPage'

export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      {
        path: '/',
        element: <HomePage />,
      },
      {
        path: '/importar',
        element: (
          <PlaceholderPage
            title="Importar relatórios"
            description="Envie o relatório exportado da Central do Vendedor para o Lucro Claro ler as suas vendas."
          />
        ),
      },
      {
        path: '/produtos',
        element: <ProductsPage />,
      },
      {
        path: '/comparar',
        element: (
          <PlaceholderPage
            title="Comparar períodos"
            description="Escolha dois períodos e veja a diferença entre eles."
          />
        ),
      },
      {
        path: '/lucro-por-produto',
        element: (
          <PlaceholderPage
            title="Lucro por produto"
            description="Descubra quais produtos dão lucro e quais estão dando prejuízo."
          />
        ),
      },
      {
        path: '/mei',
        element: (
          <PlaceholderPage
            title="Controle MEI"
            description="Acompanhe quanto você já faturou no ano em relação ao limite do MEI e não esqueça do DAS."
          />
        ),
      },
    ],
  },
])

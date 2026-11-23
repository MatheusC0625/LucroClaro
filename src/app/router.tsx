import { createBrowserRouter } from 'react-router-dom'
import { Layout } from '../components/layout/Layout'
import { ComparePage } from '../pages/ComparePage'
import { HomePage } from '../pages/HomePage'
import { MeiPage } from '../pages/MeiPage'
import { PlaceholderPage } from '../pages/PlaceholderPage'
import { ProfitByProductPage } from '../pages/ProfitByProductPage'
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
        element: <ComparePage />,
      },
      {
        path: '/lucro-por-produto',
        element: <ProfitByProductPage />,
      },
      {
        path: '/mei',
        element: <MeiPage />,
      },
    ],
  },
])

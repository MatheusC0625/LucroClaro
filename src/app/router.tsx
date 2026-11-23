import { createBrowserRouter } from 'react-router-dom'
import { Layout } from '../components/layout/Layout'
import { ComparePage } from '../pages/ComparePage'
import { HomePage } from '../pages/HomePage'
import { ImportPage } from '../pages/ImportPage'
import { MeiPage } from '../pages/MeiPage'
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
        element: <ImportPage />,
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

import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider, createRouter, createRoute, createRootRoute, Outlet, Link } from '@tanstack/react-router'
import { LoginPage } from './pages/LoginPage'
import { SignupPage } from './pages/SignupPage'
import { useUser, useLogout } from './features/auth/hooks'
import { Button } from './components/ui/button'
import { PricingForm } from './features/pricing/components/PricingForm'
import { CheckoutPage } from './features/payment/components/CheckoutPage'
import { WalletDashboard } from './features/wallet/components/WalletDashboard'
import { AffiliateDashboard } from './features/affiliate/components/AffiliateDashboard'

const queryClient = new QueryClient()

const RootComponent = () => {
  const { data: user, isLoading } = useUser();
  const logout = useLogout();

  if (isLoading) return <div className="p-4">Loading...</div>

  return (
    <>
      <div className="p-2 flex gap-2 border-b items-center justify-between">
        <div className="flex gap-2">
          <Link to="/" className="[&.active]:font-bold">
            Home
          </Link>
          <Link to="/admin/pricing" className="[&.active]:font-bold">
            Pricing
          </Link>
          <Link to="/wallet" className="[&.active]:font-bold">
            Wallet
          </Link>
          <Link to="/affiliate" className="[&.active]:font-bold">
            Affiliates
          </Link>
        </div>
        <div>
          {user ? (
            <div className="flex items-center gap-4">
              <span>Hi, {user.full_name}</span>
              <Button variant="outline" size="sm" onClick={() => logout.mutate()}>Logout</Button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Link to="/login"><Button variant="ghost" size="sm">Login</Button></Link>
              <Link to="/signup"><Button size="sm">Signup</Button></Link>
            </div>
          )}
        </div>
      </div>
      <Outlet />
    </>
  )
}

const rootRoute = createRootRoute({
  component: RootComponent,
})

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: () => <div className="p-4">Welcome to the Industry Standard Auth App!</div>,
})

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: LoginPage,
})

const checkoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/checkout/$planId',
  component: CheckoutPage,
})

const walletRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/wallet',
  component: WalletDashboard,
})

const affiliateRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/affiliate',
  component: AffiliateDashboard,
})

const signupRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/signup',
  component: SignupPage,
})

const pricingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/pricing',
  component: PricingForm,
})

const routeTree = rootRoute.addChildren([indexRoute, loginRoute, signupRoute, pricingRoute, checkoutRoute, walletRoute, affiliateRoute])

const router = createRouter({ routeTree, context: { queryClient } })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </React.StrictMode>,
)

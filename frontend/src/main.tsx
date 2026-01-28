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
import { LandingPage } from './features/home/components/LandingPage'
import { PricingPage } from './features/pricing/components/PricingPage'
import { AdminPlanList } from './features/pricing/pages/AdminPlanList'

import { CouponList } from './features/coupons/pages/CouponList'
import { StripeConnectPage } from './features/stripe-connect/components/StripeConnectPage'

const queryClient = new QueryClient()

const RootComponent = () => {
  const { data: user, isLoading } = useUser();
  const logout = useLogout();

  if (isLoading) return <div className="p-4">Loading...</div>

  return (
    <>
      <div className="p-2 flex gap-2 border-b items-center justify-between">
        <div className="flex gap-2">
          <Link to="/" className="[&.active]:font-bold p-2">
            Home
          </Link>
          <Link to="/pricing" className="[&.active]:font-bold p-2">
            Pricing
          </Link>
          <Link to="/wallet" className="[&.active]:font-bold p-2">
            Wallet
          </Link>
          <Link to="/affiliate" className="[&.active]:font-bold p-2">
            Affiliates
          </Link>
          <Link to="/admin/plans" className="[&.active]:font-bold p-2 text-indigo-600">
            Pricing (Admin)
          </Link>
          <Link to="/admin/coupons" className="[&.active]:font-bold p-2 text-indigo-600">
            Coupons (Admin)
          </Link>
          <Link to="/settings/stripe-connect" className="[&.active]:font-bold p-2 text-indigo-600">
            Connect (Seller)
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
  component: LandingPage,
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

const adminPricingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/pricing',
  component: PricingForm,
})

const adminPlanListRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/plans',
  component: AdminPlanList,
})

const adminCouponsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/coupons',
  component: CouponList,
})

const pricingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/pricing',
  component: PricingPage,
})

import { PaymentSuccessPage } from './features/payment/components/PaymentSuccessPage'

// existing routes...

const paymentSuccessRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/payment/success',
  component: PaymentSuccessPage,
})

const stripeConnectRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/settings/stripe-connect',
  component: StripeConnectPage,
})

const routeTree = rootRoute.addChildren([indexRoute, loginRoute, signupRoute, adminPlanListRoute, adminPricingRoute, adminCouponsRoute, pricingRoute, checkoutRoute, walletRoute, affiliateRoute, paymentSuccessRoute, stripeConnectRoute])

const router = createRouter({
  routeTree,
  context: { queryClient },
  defaultErrorComponent: ({ error }) => <div className="p-4 text-red-500 font-bold">Error: {error.message}</div>,
  defaultNotFoundComponent: () => <div className="p-4">404 - Not Found</div>
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

import { Toaster } from 'sonner';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <Toaster richColors position="top-right" />
    </QueryClientProvider>
  </React.StrictMode>,
)

import { lazy, Suspense } from "react";
import { Switch, Route, useLocation, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/lib/auth";
import BottomNav from "@/components/bottom-nav";
import { ADMIN_PATH } from "@/lib/admin-path";
import { Loader2 } from "lucide-react";

const LoginPage = lazy(() => import("@/pages/login"));
const RegisterPage = lazy(() => import("@/pages/register"));
const HomePage = lazy(() => import("@/pages/home"));
const TasksPage = lazy(() => import("@/pages/tasks"));
const InvestPage = lazy(() => import("@/pages/invest"));
const OrdersPage = lazy(() => import("@/pages/orders"));
const TeamPage = lazy(() => import("@/pages/team"));
const AccountPage = lazy(() => import("@/pages/account"));
const AdminPage = lazy(() => import("@/pages/admin"));
const AdminTeamPage = lazy(() => import("@/pages/admin-team"));
const BankerPage = lazy(() => import("@/pages/banker"));
const DepositPage = lazy(() => import("@/pages/deposit"));
const RobotPayPage = lazy(() => import("@/pages/robotpay"));
const WithdrawalPage = lazy(() => import("@/pages/withdrawal"));
const DepositHistoryPage = lazy(() => import("@/pages/deposit-history"));
const DepositsHistoryPage = lazy(() => import("@/pages/deposit-history-real"));
const HistoryPage = lazy(() => import("@/pages/history"));
const ServicePage = lazy(() => import("@/pages/service"));
const WalletPage = lazy(() => import("@/pages/wallet"));
const ChangePasswordPage = lazy(() => import("@/pages/change-password"));
const AboutPage = lazy(() => import("@/pages/about"));
const RulesPage = lazy(() => import("@/pages/rules"));
const GiftCodePage = lazy(() => import("@/pages/gift-code"));
const TeamDetailsPage = lazy(() => import("@/pages/team-details"));
const MyProductsPage = lazy(() => import("@/pages/my-products"));
const CheckinPage = lazy(() => import("@/pages/checkin"));
const RewardsPage = lazy(() => import("@/pages/rewards"));
const WithdrawalHistoryPage = lazy(() => import("@/pages/withdrawal-history"));
const DepositOrdersPage = lazy(() => import("@/pages/deposit-orders"));
const SalaryBonusPage = lazy(() => import("@/pages/salary-bonus"));
const NotFound = lazy(() => import("@/pages/not-found"));

function PageLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const [location] = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Redirect to="/login" />;
  }

  if (user.isBanned) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-2">Compte suspendu</h1>
          <p className="text-muted-foreground">Votre compte a été suspendu. Contactez le support.</p>
        </div>
      </div>
    );
  }

  if ((user as any).isBanker && !user.isAdmin && location !== "/banker") {
    return <Redirect to="/banker" />;
  }

  return <>{children}</>;
}

function BankerRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return <Redirect to="/login" />;
  if (!(user as any).isBanker && !user.isAdmin) return <Redirect to="/" />;

  return <>{children}</>;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !user.isAdmin) {
    return <Redirect to="/" />;
  }

  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (user) {
    return <Redirect to="/" />;
  }

  return <>{children}</>;
}

function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background pb-16">
      {children}
      <BottomNav />
    </div>
  );
}

function BrandThemeScope({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const isDashboard = location === "/";

  return <div className={isDashboard ? undefined : "ton-theme"}>{children}</div>;
}

function Router() {
  return (
    <Switch>
      <Route path="/login">
        <PublicRoute>
          <LoginPage />
        </PublicRoute>
      </Route>
      <Route path="/register">
        <PublicRoute>
          <RegisterPage />
        </PublicRoute>
      </Route>
      <Route path="/invitation">
        <PublicRoute>
          <RegisterPage />
        </PublicRoute>
      </Route>
      <Route path="/rejoindre">
        <PublicRoute>
          <RegisterPage />
        </PublicRoute>
      </Route>
      <Route path="/">
        <ProtectedRoute>
          <AppLayout>
            <HomePage />
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/tasks">
        <ProtectedRoute>
          <AppLayout>
            <TasksPage />
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/invest">
        <ProtectedRoute>
          <AppLayout>
            <InvestPage />
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/orders">
        <ProtectedRoute>
          <AppLayout>
            <OrdersPage />
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/team">
        <ProtectedRoute>
          <AppLayout>
            <TeamPage />
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/my-products">
        <ProtectedRoute>
          <AppLayout>
            <MyProductsPage />
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/checkin">
        <ProtectedRoute>
          <CheckinPage />
        </ProtectedRoute>
      </Route>
      <Route path="/account">
        <ProtectedRoute>
          <AppLayout>
            <AccountPage />
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/deposit">
        <ProtectedRoute>
          <DepositPage />
        </ProtectedRoute>
      </Route>
      <Route path="/robotpay">
        <ProtectedRoute>
          <RobotPayPage />
        </ProtectedRoute>
      </Route>
      <Route path="/withdrawal">
        <ProtectedRoute>
          <WithdrawalPage />
        </ProtectedRoute>
      </Route>
      <Route path="/deposit-history">
        <ProtectedRoute>
          <DepositHistoryPage />
        </ProtectedRoute>
      </Route>
      <Route path="/deposits-history">
        <ProtectedRoute>
          <DepositsHistoryPage />
        </ProtectedRoute>
      </Route>
      <Route path="/history">
        <ProtectedRoute>
          <HistoryPage />
        </ProtectedRoute>
      </Route>
      <Route path="/withdrawal-history">
        <ProtectedRoute>
          <WithdrawalHistoryPage />
        </ProtectedRoute>
      </Route>
      <Route path="/deposit-orders">
        <ProtectedRoute>
          <DepositOrdersPage />
        </ProtectedRoute>
      </Route>
      <Route path="/service">
        <ProtectedRoute>
          <ServicePage />
        </ProtectedRoute>
      </Route>
      <Route path="/wallet">
        <ProtectedRoute>
          <WalletPage />
        </ProtectedRoute>
      </Route>
      <Route path="/change-password">
        <ProtectedRoute>
          <ChangePasswordPage />
        </ProtectedRoute>
      </Route>
      <Route path="/about">
        <ProtectedRoute>
          <AboutPage />
        </ProtectedRoute>
      </Route>
      <Route path="/rules">
        <ProtectedRoute>
          <RulesPage />
        </ProtectedRoute>
      </Route>
      <Route path="/gift-code">
        <ProtectedRoute>
          <GiftCodePage />
        </ProtectedRoute>
      </Route>
      <Route path="/team-details">
        <ProtectedRoute>
          <TeamDetailsPage />
        </ProtectedRoute>
      </Route>
      <Route path="/daily-bonus">
        <ProtectedRoute>
          <AppLayout>
            <RewardsPage />
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/salary-bonus">
        <ProtectedRoute>
          <AppLayout>
            <SalaryBonusPage />
          </AppLayout>
        </ProtectedRoute>
      </Route>
      {/* /admin is a decoy — the server already returns 404 for it,
          but we also map it to NotFound on the client to be thorough. */}
      <Route path="/admin" component={NotFound} />
      <Route path="/admin/:rest*" component={NotFound} />
      {/* Real admin panel is served under the secret path */}
      <Route path={ADMIN_PATH}>
        <AdminRoute>
          <AdminPage />
        </AdminRoute>
      </Route>
      <Route path={`${ADMIN_PATH}/team/:id`}>
        <AdminRoute>
          <AdminTeamPage />
        </AdminRoute>
      </Route>
      <Route path="/banker">
        <BankerRoute>
          <BankerPage />
        </BankerRoute>
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <BrandThemeScope>
            <Suspense fallback={<PageLoading />}>
              <Router />
            </Suspense>
            <Toaster />
          </BrandThemeScope>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

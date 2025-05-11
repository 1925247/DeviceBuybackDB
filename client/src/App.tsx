import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import DevicesPage from "@/pages/devices";
import BuybackPage from "@/pages/buyback";
import MarketplacePage from "@/pages/marketplace";
import OrdersPage from "@/pages/orders";
import AdminPage from "@/pages/admin";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard}/>
      <Route path="/devices" component={DevicesPage}/>
      <Route path="/buyback" component={BuybackPage}/>
      <Route path="/marketplace" component={MarketplacePage}/>
      <Route path="/orders" component={OrdersPage}/>
      <Route path="/admin" component={AdminPage}/>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

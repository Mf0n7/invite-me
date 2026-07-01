import { toast } from "sonner";
import { apiErrorMessage } from "@/lib/api";
import {
  usePortal,
  useSubscription,
  useSubscriptionCheckout,
  useTiers,
} from "@/hooks/use-billing";

export function useBillingPage() {
  const { data: tiers } = useTiers();
  const { data: sub } = useSubscription();
  const subscribe = useSubscriptionCheckout();
  const portal = usePortal();

  const onSubscribe = async (capacity: number) => {
    try {
      await subscribe.mutateAsync(capacity);
    } catch (err) {
      toast.error(
        apiErrorMessage(err, "Não foi possível iniciar a assinatura."),
      );
    }
  };

  const onManage = async () => {
    try {
      await portal.mutateAsync();
    } catch (err) {
      toast.error(apiErrorMessage(err, "Não foi possível abrir o portal."));
    }
  };

  return {
    tiers,
    sub,
    onSubscribe,
    onManage,
    isSubscribing: subscribe.isPending,
    isOpeningPortal: portal.isPending,
  };
}

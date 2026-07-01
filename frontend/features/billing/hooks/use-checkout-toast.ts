import { useEffect } from "react";
import { toast } from "sonner";

export function useCheckoutToast() {
  useEffect(() => {
    const status = new URLSearchParams(window.location.search).get("checkout");
    if (status === "success")
      toast.success("Assinatura ativada! Pode levar alguns segundos.");
    if (status === "cancel") toast.info("Checkout cancelado.");
  }, []);
}

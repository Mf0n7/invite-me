"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GiftCta } from "@/features/events/components/gift-cta";
import { GiftManager } from "@/features/events/components/gift-manager";
import { useGifts } from "@/hooks/use-gifts";

export function GiftPanel({ uuid }: { uuid: string }) {
  const { data } = useGifts(uuid);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Lista de presentes</CardTitle>
      </CardHeader>
      <CardContent>
        {data?.entitled ? <GiftManager uuid={uuid} /> : <GiftCta uuid={uuid} />}
      </CardContent>
    </Card>
  );
}

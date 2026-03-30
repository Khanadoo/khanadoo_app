import { notFound } from "next/navigation";
import { ProductDetailPage } from "@/components/pages/product-detail-page";
import { foodItems } from "@/lib/mock-data";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const item = foodItems.find((food) => food.id === id);

  if (!item) {
    notFound();
  }

  return <ProductDetailPage item={item} />;
}

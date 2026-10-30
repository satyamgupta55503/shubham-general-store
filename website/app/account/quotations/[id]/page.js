"use client";
import { useParams } from "next/navigation";
import StoreLayout from "@/components/store/layout/StoreLayout";
import CustomerDocument from "@/components/store/CustomerDocument";

export default function CustomerQuotationPage() {
  const { id } = useParams();
  return (
    <StoreLayout>
      <CustomerDocument kind="quotation" id={id} />
    </StoreLayout>
  );
}

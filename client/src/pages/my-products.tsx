import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { getCountryByCode } from "@/lib/countries";
import { Loader2 } from "lucide-react";
import type { Product } from "@shared/schema";

import emptyIllustration from "@assets/illustration-8_1784762965573.png";
import productsReference from "@assets/20260822_123747_1787403034334.jpg";
import productImage1 from "@assets/images_(67)_1787404892163.jpeg";
import productImage2 from "@assets/maquininha-ton-e-boa_(1)_1787404928174.webp";
import productImage3 from "@assets/images_(59)_1787404956774.jpeg";
import productImage4 from "@assets/images_(58)_1787404956874.jpeg";
import productImage5 from "@assets/images_(69)_1787404956897.jpeg";
import productImage6 from "@assets/images_(67)_1787404956922.jpeg";
import productImage7 from "@assets/images_(68)_1787404956953.jpeg";

const PRODUCT_IMAGES = [
  productImage1,
  productImage2,
  productImage3,
  productImage4,
  productImage5,
  productImage6,
  productImage7,
];

interface ProductWithOwnership extends Product {
  isOwned: boolean;
  canClaimFree: boolean;
  ownedCount?: number;
}

export default function MyProductsPage() {
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"our" | "my">("our");
  const [confirmProduct, setConfirmProduct] = useState<ProductWithOwnership | null>(null);

  const { data: products, isLoading: loadingProducts } = useQuery<ProductWithOwnership[]>({
    queryKey: ["/api/products"],
    staleTime: 0,
  });

  const { data: userProducts, isLoading: loadingUserProducts } = useQuery<any[]>({
    queryKey: ["/api/user/products"],
    staleTime: 0,
  });

  const purchaseMutation = useMutation({
    mutationFn: async (productId: number) => {
      const response = await apiRequest("POST", `/api/products/${productId}/purchase`, {});
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Erreur");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/products"] });
      refreshUser();
      setConfirmProduct(null);
      toast({ title: "Produit acheté !", description: "Vous commencerez à recevoir des gains demain." });
    },
    onError: (error: any) => {
      setConfirmProduct(null);
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    },
  });

  if (!user) return null;

  const country = getCountryByCode(user.country);
  const currency = country?.currency === "FCFA" ? "XOF" : country?.currency || "XOF";
  const paidProducts = products?.filter(p => !p.isFree) || [];
  const allUserProducts = userProducts || [];
  const activeUserProducts = allUserProducts.filter(up => up.status === "active");
  const activeProductCount = activeUserProducts.length;
  const totalUserEarnings = Math.round(Number(user.totalEarnings || 0));
  const formatStatAmount = (amount: number) => `${amount.toLocaleString("fr-FR")} ${currency}`;

  const formatDateTime = (dateStr: string) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };

  // Format date as "20 Jul 2026, 15:00"
  const formatPurchaseDate = (dateStr: string) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const day = d.getDate();
    const month = months[d.getMonth()];
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");
    return `${day} ${month} ${year}, ${hours}:${minutes}`;
  };

  return (
    <main className="products-reference min-h-full bg-[#f1fff4] pb-24">
      <style>{`
        .products-reference { color: #151515; font-family: Inter, Arial, sans-serif; }
        .products-reference .products-screen { width: 100%; max-width: 500px; margin: 0 auto; overflow: hidden; }
         .products-reference .products-hero { position: relative; height: min(70.31vw, 360px); min-height: 270px; overflow: hidden; background: #3fcb2d; }
         .products-reference .products-hero img { display: block; width: 100%; height: 100%; object-fit: cover; object-position: top; pointer-events: none; }
         .products-reference .stat-panel { position: absolute; top: 58%; z-index: 1; display: flex; height: 38%; flex-direction: column; align-items: center; justify-content: center; gap: 10px; border: 0; border-radius: 24px; background: #4bcf37; color: #fff; text-align: center; pointer-events: none; }
         .products-reference .stat-panel.our { left: 4%; width: 45%; }
         .products-reference .stat-panel.my { right: 4%; width: 45%; }
         .products-reference .stat-value { display: block; max-width: 100%; overflow: hidden; padding: 0 8px; font-size: clamp(20px, 5vw, 30px); font-weight: 500; line-height: 1; text-overflow: ellipsis; white-space: nowrap; }
         .products-reference .stat-label { display: block; font-size: clamp(14px, 3.5vw, 20px); font-weight: 500; line-height: 1; }
         .products-reference .stat-toggle { position: absolute; top: 58%; z-index: 2; height: 38%; background: transparent; }
         .products-reference .stat-toggle.our { left: 4%; width: 45%; }
         .products-reference .stat-toggle.my { right: 4%; width: 45%; }
         .products-reference .product-list { padding: 0 12px 20px; background: white; }
         .products-reference .product-card { position: relative; height: 265px; margin-bottom: 0; overflow: hidden; border: 0; border-bottom: 1px solid #eeeeee; border-radius: 0; background: white; box-shadow: none; }
         .products-reference .product-picture { position: absolute; top: 12px; right: 7px; left: auto; width: 154px; height: 154px; overflow: hidden; border: 2px solid #7fc9a2; border-radius: 11px; background: #fff; }
         .products-reference .product-picture img { width: 100%; height: 100%; object-fit: cover; }
         .products-reference .product-details { position: absolute; top: 17px; left: 31px; right: 181px; overflow: hidden; }
         .products-reference .product-name { overflow: hidden; color: #42bd45; font-size: 23px; font-weight: 500; line-height: 1.15; text-overflow: ellipsis; white-space: nowrap; }
         .products-reference .product-price { margin-top: 22px; color: #171717; font-size: 17px; font-weight: 400; }
         .products-reference .product-line { margin-top: 12px; color: #171717; font-size: 16px; line-height: 1.15; white-space: normal; overflow-wrap: anywhere; }
         .products-reference .product-line strong { margin-left: 8px; color: #171717; font-weight: 400; }
         .products-reference .buy { position: absolute; right: 7px; bottom: 25px; display: grid; width: 154px; height: 61px; place-items: center; border-radius: 14px; background: linear-gradient(180deg, #43d338 0%, #19b948 100%); color: white; font-size: 18px; font-weight: 400; line-height: 1.1; text-align: center; }
         .products-reference .my-card { height: 265px; padding-bottom: 0; }
         .products-reference .my-card .product-details { position: absolute; top: 17px; left: 31px; right: 181px; margin-left: 0; padding-top: 0; padding-right: 0; }
         .products-reference .my-card .product-picture { top: 12px; }
         .products-reference .my-card .product-line { margin-top: 12px; }
        .products-reference .empty { display: flex; min-height: 260px; flex-direction: column; align-items: center; justify-content: center; border-radius: 9px; background: white; color: #777; }
        .products-reference .empty img { width: 150px; height: 150px; object-fit: contain; }
        @media (max-width: 360px) {
             .products-reference .stat-panel { gap: 7px; border-radius: 20px; }
            .products-reference .stat-value { font-size: 18px; }
            .products-reference .stat-label { font-size: 13px; }
           .products-reference .product-picture { right: 5px; width: 112px; height: 112px; }
           .products-reference .product-details, .products-reference .my-card .product-details { left: 18px; right: 126px; }
           .products-reference .product-name { font-size: 17px; }
           .products-reference .product-price { margin-top: 18px; font-size: 14px; }
           .products-reference .product-line { margin-top: 9px; font-size: 13px; }
           .products-reference .buy { right: 5px; width: 112px; height: 52px; font-size: 14px; }
        }
      `}</style>

      <div className="products-screen">
        <section className="products-hero" aria-label="Produits">
          <img src={productsReference} alt="" />
          <div className="stat-panel our" aria-label={`${activeProductCount} produit${activeProductCount === 1 ? "" : "s"} actif${activeProductCount === 1 ? "" : "s"}`}>
            <span className="stat-value">{activeProductCount}</span>
            <span className="stat-label">Mes produits</span>
          </div>
          <div className="stat-panel my" aria-label={`Revenus : ${formatStatAmount(totalUserEarnings)}`}>
            <span className="stat-value">{formatStatAmount(totalUserEarnings)}</span>
            <span className="stat-label">Mes revenus</span>
          </div>
          <button className="stat-toggle our" onClick={() => setActiveTab("our")} data-testid="tab-our-products" aria-label="Mes produits disponibles" />
          <button className="stat-toggle my" onClick={() => setActiveTab("my")} data-testid="tab-my-product" aria-label="Mes revenus et produits achetés" />
        </section>

        <div className="product-list">

        {/* ── OUR PRODUCTS tab ── */}
        {activeTab === "our" && (
          <div>
            {loadingProducts ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-[#00CC2C]" />
              </div>
            ) : paidProducts.length === 0 ? (
              <div className="empty">
                <img src={emptyIllustration} alt="Vide" />
                <p>Aucun produit disponible</p>
              </div>
            ) : (
              paidProducts.map((product, idx) => {
                const img = PRODUCT_IMAGES[idx % PRODUCT_IMAGES.length];
                return (
                  <div
                    key={product.id}
                    className="product-card"
                    data-testid={`product-card-${product.id}`}
                  >
                    <div className="product-picture"><img src={img} alt={product.name} /></div>
                    <div className="product-details">
                      <p className="product-name">{product.name}</p>
                      <p className="product-price">{Number(product.price).toLocaleString("fr-FR")} {currency}</p>
                      <p className="product-line">Durée :<strong>{product.cycleDays}jours</strong></p>
                      <p className="product-line">Revenu quotidien :<strong>{Number(product.dailyEarnings).toLocaleString("fr-FR")} {currency}</strong></p>
                      <p className="product-line">Revenu total :<strong>{Number(product.totalReturn).toLocaleString("fr-FR")} {currency}</strong></p>
                    </div>
                    <button onClick={() => setConfirmProduct(product)} className="buy" data-testid={`button-purchase-${product.id}`}>
                      <span>ACHETER<br />MAINTENANT</span>
                    </button>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* ── MY PRODUCT tab ── */}
        {activeTab === "my" && (
          <div>
            <div>
              {loadingUserProducts ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-[#00CC2C]" />
                </div>
              ) : allUserProducts.length === 0 ? (
                <div className="empty">
                  <img src={emptyIllustration} alt="Vide" />
                  <p>Aucun produit Stone by ton</p>
                  <p className="text-sm text-gray-400">Achetez des produits pour commencer à gagner</p>
                </div>
              ) : (
                allUserProducts.map((up: any, index: number) => {
                  const cycleDays = up.product?.cycleDays || 60;
                  const daysRemaining = up.daysRemaining || 0;
                  const daysCompleted = Math.max(0, cycleDays - daysRemaining);
                  const earnedSoFar = parseFloat(up.totalEarned || "0");

                  return (
                    <div
                      key={up.id}
                      className="product-card my-card"
                      data-testid={`my-product-card-${up.id}`}
                    >
                      <div className="product-picture"><img src={PRODUCT_IMAGES[index % PRODUCT_IMAGES.length]} alt={up.product?.name || "Produit"} /></div>
                      <div className="product-details">
                        <p className="product-name">{up.product?.name || "Produit"}</p>
                        <p className="product-price">{Number(up.product?.price || 0).toLocaleString("fr-FR")} {currency}</p>
                        <p className="product-line">Jours d'exécution :<strong>{daysCompleted} / {cycleDays}</strong></p>
                        <p className="product-line">Revenu généré :<strong>{earnedSoFar.toLocaleString("fr-FR")} {currency}</strong></p>
                        <p className="product-line">Revenu total :<strong>{Number(up.product?.totalReturn || 0).toLocaleString("fr-FR")} {currency}</strong></p>
                        <p className="product-line">Date :<strong>{formatPurchaseDate(up.purchasedAt)}</strong></p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
        </div>
      </div>

      {/* Purchase confirm modal */}
      {confirmProduct && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-8 bg-black/50"
          onClick={() => setConfirmProduct(null)}
        >
          <div
            className="w-full max-w-xs rounded-2xl overflow-hidden shadow-2xl bg-white"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-6 pt-6 pb-5 text-center">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">
                Conseil
              </p>
              <p className="text-gray-800 font-semibold text-base leading-snug">
                Êtes-vous sûr de vouloir acheter ce produit ?
              </p>
              <p className="text-gray-500 text-sm mt-2 font-medium">
                {confirmProduct.name}
              </p>
            </div>

            {/* Divider */}
            <div className="h-px bg-gray-100" />

            {/* Buttons */}
            <div className="flex">
              <button
                onClick={() => setConfirmProduct(null)}
                className="flex-1 py-4 font-semibold text-base text-gray-500 active:bg-gray-50 transition-colors"
                style={{ borderRight: "1px solid #f0f0f0" }}
                data-testid="button-cancel-purchase"
              >
                Non
              </button>
              <button
                onClick={() => purchaseMutation.mutate(confirmProduct.id)}
                disabled={purchaseMutation.isPending}
                className="flex-1 py-4 font-bold text-base text-white flex items-center justify-center gap-1.5 active:opacity-90 transition-opacity disabled:opacity-60"
                style={{ background: "#00CC2C" }}
                data-testid="button-confirm-purchase"
              >
                {purchaseMutation.isPending
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : "Oui"
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

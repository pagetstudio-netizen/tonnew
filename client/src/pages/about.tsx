import { ChevronLeft } from "lucide-react";
import { Link } from "wouter";

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-full" style={{ background: "#111" }}>

      {/* Header */}
      <header className="flex items-center px-4 py-3" style={{ background: "#111", borderBottom: "1px solid #222" }}>
        <Link href="/account">
          <button className="p-1" data-testid="button-back">
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
        </Link>
        <h1 className="flex-1 text-center text-base font-semibold text-white pr-6">À propos de nous</h1>
      </header>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5" style={{ color: "#d4d4d4", fontSize: 13.5, lineHeight: "1.75" }}>

        <p>
          Stone by ton est une entreprise française fondée en 2013, spécialisée dans la vente en ligne et physique de pierre naturelle, de travertin, de carrelage et de parements muraux. Basée à Six-Fours-les-Plages dans le Var, la marque propose une large gamme de revêtements pour les sols et les murs intérieurs ou extérieurs.
        </p>

        <p>
          Stone by ton accompagne les particuliers et les professionnels dans leurs projets d’aménagement, avec des matériaux sélectionnés pour leur qualité, leur caractère et leur durabilité.
        </p>

        <p>
          Notre collection s’adapte aux espaces intérieurs comme extérieurs : sols, murs, terrasses, salles de bains et pièces de vie.
        </p>

        <p>
          La qualité des produits, le conseil et la satisfaction des clients sont au cœur de l’engagement de Stone by ton.
        </p>

      </div>
    </div>
  );
}

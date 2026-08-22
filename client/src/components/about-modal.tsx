import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import tonLogo from "@assets/images_(25)_1787362424281.png";

interface AboutModalProps {
  open: boolean;
  onClose: () => void;
}

export default function AboutModal({ open, onClose }: AboutModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white border border-gray-200 flex items-center justify-center overflow-hidden">
              <img src={tonLogo} alt="Stone by ton" className="w-10 h-10 object-contain" />
            </div>
            À propos de Stone by ton
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 text-sm text-muted-foreground">
          <p>
            Stone by ton est une entreprise française fondée en 2013, spécialisée dans la vente en ligne et physique de pierre naturelle, de travertin, de carrelage et de parements muraux.
          </p>
          <p>
            Basée à Six-Fours-les-Plages dans le Var, la marque propose une large gamme de revêtements pour les sols et les murs intérieurs ou extérieurs.
          </p>
          <div className="bg-secondary rounded-lg p-4 space-y-2">
            <h4 className="font-medium text-foreground">Nos avantages :</h4>
            <ul className="space-y-1">
              <li>- Revenus quotidiens automatiques</li>
              <li>- Produits robotiques de qualité</li>
              <li>- Système de parrainage attractif</li>
              <li>- Support client disponible</li>
            </ul>
          </div>
          <p className="text-xs">
            Version 1.0.0 - Tous droits réservés
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// @ts-nocheck
import React from "react";
import { Pill, ShoppingCart, AlertCircle, CheckCircle } from "lucide-react";
import { Badge } from "..//ui/badge";
import { Button } from "..//ui/button";

export default function MedicineCard({ medicine, onAddToCart, inCart }) {
  return (
    <div className="bg-white rounded-xl border border-slate-100 overflow-hidden hover:shadow-md transition-all duration-200 group">
      <div className="relative h-36 bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center">
        {medicine.image_url ? (
          <img 
            src={medicine.image_url} 
            alt={medicine.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <Pill className="w-12 h-12 text-teal-300" />
        )}
        {medicine.requires_prescription && (
          <Badge className="absolute top-3 right-3 bg-amber-100 text-amber-700 border-amber-200">
            <AlertCircle className="w-3 h-3 mr-1" />
            Rx Required
          </Badge>
        )}
      </div>
      
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-semibold text-slate-800">{medicine.name}</h3>
            {medicine.generic_name && (
              <p className="text-xs text-slate-400">{medicine.generic_name}</p>
            )}
          </div>
          <Badge variant="outline" className="text-xs shrink-0">
            {medicine.category}
          </Badge>
        </div>
        
        <p className="mt-2 text-sm text-slate-500 line-clamp-2">{medicine.description}</p>
        
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
          <div>
            <span className="text-2xl font-bold text-teal-600">${medicine.price?.toFixed(2)}</span>
            <p className="text-xs text-slate-400">
              {medicine.stock_quantity > 0 ? (
                <span className="text-emerald-600">In Stock</span>
              ) : (
                <span className="text-red-500">Out of Stock</span>
              )}
            </p>
          </div>
          <Button 
            size="sm"
            onClick={() => onAddToCart(medicine)}
            disabled={!medicine.is_available || medicine.stock_quantity === 0}
            className={inCart 
              ? "bg-emerald-500 hover:bg-emerald-600" 
              : "bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600"
            }
          >
            {inCart ? (
              <><CheckCircle className="w-4 h-4 mr-1" /> Added</>
            ) : (
              <><ShoppingCart className="w-4 h-4 mr-1" /> Add</>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
// @ts-nocheck
import React, { useMemo, useState } from "react";
import api from "../api/api";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Search,
  Filter,
  ShoppingCart,
  Minus,
  Plus,
  Trash2,
} from "lucide-react";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { toast } from "sonner";

const CATEGORIES = [
  "All Categories",
  "Antibiotics",
  "Pain Relief",
  "Cardiovascular",
  "Diabetes",
  "Vitamins",
  "Respiratory",
  "Digestive",
  "Skin Care",
  "Mental Health",
  "Allergy",
  "Other",
];

const medicineImageMap = {
  tylenol:
    "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?q=80&w=1200&auto=format&fit=crop",
  advil:
    "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?q=80&w=1200&auto=format&fit=crop",
  amoxil:
    "https://images.unsplash.com/photo-1512069772995-ec65ed45afd6?q=80&w=1200&auto=format&fit=crop",
  zithromax:
    "https://images.unsplash.com/photo-1512069772995-ec65ed45afd6?q=80&w=1200&auto=format&fit=crop",
  glucophage:
    "https://images.unsplash.com/photo-1576602976047-174e57a47881?q=80&w=1200&auto=format&fit=crop",
  lipitor:
    "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=1200&auto=format&fit=crop",
  ventolin:
    "https://images.unsplash.com/photo-1576602976047-174e57a47881?q=80&w=1200&auto=format&fit=crop",
  claritin:
    "https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=1200&auto=format&fit=crop",
  benadryl:
    "https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=1200&auto=format&fit=crop",
  prilosec:
    "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?q=80&w=1200&auto=format&fit=crop",
  pantoloc:
    "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?q=80&w=1200&auto=format&fit=crop",
  "vitamin d3":
    "https://images.unsplash.com/photo-1584017911766-d451b3d0e843?q=80&w=1200&auto=format&fit=crop",
  "vitamin c":
    "https://images.unsplash.com/photo-1584017911766-d451b3d0e843?q=80&w=1200&auto=format&fit=crop",
  "hydrocortisone cream":
    "https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?q=80&w=1200&auto=format&fit=crop",
  zoloft:
    "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=1200&auto=format&fit=crop",
};

const categoryImageMap = {
  "Pain Relief":
    "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?q=80&w=1200&auto=format&fit=crop",
  Antibiotics:
    "https://images.unsplash.com/photo-1512069772995-ec65ed45afd6?q=80&w=1200&auto=format&fit=crop",
  Cardiovascular:
    "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=1200&auto=format&fit=crop",
  Diabetes:
    "https://images.unsplash.com/photo-1576602976047-174e57a47881?q=80&w=1200&auto=format&fit=crop",
  Vitamins:
    "https://images.unsplash.com/photo-1584017911766-d451b3d0e843?q=80&w=1200&auto=format&fit=crop",
  Respiratory:
    "https://images.unsplash.com/photo-1576602976047-174e57a47881?q=80&w=1200&auto=format&fit=crop",
  Digestive:
    "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?q=80&w=1200&auto=format&fit=crop",
  "Skin Care":
    "https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?q=80&w=1200&auto=format&fit=crop",
  "Mental Health":
    "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=1200&auto=format&fit=crop",
  Allergy:
    "https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=1200&auto=format&fit=crop",
  Other:
    "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?q=80&w=1200&auto=format&fit=crop",
};

const getMedicineImage = (medicine) => {
  const nameKey = (medicine.displayName || medicine.name || "")
    .toLowerCase()
    .trim();
  const categoryKey = medicine.displayCategory || medicine.category || "Other";

  return (
    medicineImageMap[nameKey] ||
    categoryImageMap[categoryKey] ||
    "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?q=80&w=1200&auto=format&fit=crop"
  );
};

export default function OrderMedicines() {
  const [successMessage, setSuccessMessage] = useState("");
  const [addedMedicineId, setAddedMedicineId] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [ordering, setOrdering] = useState(false);

  const { data: user = null } = useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const res = await api.auth.me();
      return res;
    },
  });

  const { data: medicines = [], isLoading } = useQuery({
    queryKey: ["patient-medicines"],
    queryFn: async () => {
      const res = await api.get("/medicines");
      const payload = res.data;

      if (Array.isArray(payload)) return payload;
      if (Array.isArray(payload?.medicines)) return payload.medicines;
      if (Array.isArray(payload?.data)) return payload.data;

      return [];
    },
  });

  const normalizedMedicines = useMemo(() => {
    return medicines
      .map((med) => ({
        ...med,
        displayName: med.name || "Medicine",
        displayGenericName: med.genericName || med.generic_name || "",
        displayCategory: med.category || "Other",
        displayDescription: med.description || "No description available",
        displayPrice: Number(med.price) || 0,
        displayStock: med.stockQuantity ?? med.stock_quantity ?? 0,
        displayRequiresPrescription:
          med.requiresPrescription ?? med.requires_prescription ?? false,
        displayAvailable: med.isAvailable ?? med.is_available ?? true,
      }))
      .filter((med) => med.displayAvailable);
  }, [medicines]);

  const filteredMedicines = normalizedMedicines.filter((med) => {
    const q = searchTerm.toLowerCase();

    const matchesSearch =
      med.displayName.toLowerCase().includes(q) ||
      med.displayGenericName.toLowerCase().includes(q) ||
      med.displayCategory.toLowerCase().includes(q);

    const matchesCategory =
      selectedCategory === "All Categories" ||
      med.displayCategory === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const addToCart = (medicine) => {
    const existing = cart.find((item) => item.medicineId === medicine.id);

    if (existing) {
      setCart((prev) =>
        prev.map((item) =>
          item.medicineId === medicine.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCart((prev) => [
        ...prev,
        {
          medicineId: medicine.id,
          medicineName: medicine.displayName,
          price: medicine.displayPrice,
          quantity: 1,
          requiresPrescription: medicine.displayRequiresPrescription,
        },
      ]);
    }
    setAddedMedicineId(medicine.id);

  setTimeout(() => {
    setAddedMedicineId("");
  }, 1500);
  };

  const updateQuantity = (medicineId, delta) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.medicineId === medicineId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const removeFromCart = (medicineId) => {
    setCart((prev) => prev.filter((item) => item.medicineId !== medicineId));
  };

  const cartTotal = cart.reduce(
    (sum, item) => sum + Number(item.price) * item.quantity,
    0
  );

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const hasPrescriptionItems = cart.some((item) => item.requiresPrescription);

const validateForm = () => {
  if (!deliveryAddress.trim()) {
    setSuccessMessage("Address is required");
    return false;
  }

  if (deliveryAddress.length < 10) {
    setSuccessMessage("Address is too short");
    return false;
  }

  if (!phone.trim()) {
    setSuccessMessage("Phone number is required");
    return false;
  }

  // Basic phone validation (10 digits)
  const phoneRegex = /^[0-9]{10}$/;

  if (!phoneRegex.test(phone)) {
    setSuccessMessage("Enter a valid 10-digit phone number");
    return false;
  }

  if (cart.length === 0) {
    setSuccessMessage("Cart is empty");
    return false;
  }

  return true;
};

const handlePlaceOrder = async () => {
  console.log("Place Order clicked");
  console.log("Cart:", cart);
  console.log("User:", user);

 if (!validateForm()) {
  setTimeout(() => setSuccessMessage(""), 2000);
  return;
}

  setOrdering(true);

  try {
    const payload = {
      phoneNumber: phone,
      deliveryAddress,
      items: cart.map((item) => ({
        medicineId: item.medicineId,
        quantity: item.quantity,
      })),
    };

    console.log("Sending order payload:", payload);

    const res = await api.post("/orders", payload);

    console.log("Order response:", res.data);

    setSuccessMessage("Order placed successfully!");

setTimeout(() => {
  setSuccessMessage("");
}, 2000);

    setCart([]);
    setCartOpen(false);
    setDeliveryAddress("");
    setPhone("");
  } catch (error) {
    console.error("Order error:", error?.response?.data || error);
    toast.error(error?.response?.data?.message || "Failed to place order");
  } finally {
    setOrdering(false);
  }
};



  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Order Medicines</h1>
          <p className="text-slate-500 mt-1">
            Browse and order your prescribed medicines
          </p>
        </div>
        <div className="relative">
          <Button
            onClick={() => setCartOpen(true)}
            className="relative bg-gradient-to-r from-teal-500 to-cyan-500"
          >
            <ShoppingCart className="w-5 h-5 mr-2" />
            Cart
            {cartCount > 0 && (
              <Badge className="absolute -top-2 -right-2 bg-red-500 h-5 w-5 p-0 flex items-center justify-center">
                {cartCount}
              </Badge>
            )}
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <Input
            placeholder="Search medicines..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-12 bg-white border-slate-200"
          />
        </div>

        <div className="relative w-full sm:w-56">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full h-12 rounded-md border border-slate-200 bg-white pl-10 pr-3 text-sm outline-none"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {isLoading ? (
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="bg-white rounded-xl h-64 animate-pulse" />
          ))}
        </div>
      ) : filteredMedicines.length > 0 ? (
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          
          {filteredMedicines.map((medicine, i) => (
            <motion.div
              key={medicine.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="bg-white rounded-2xl border border-slate-200 overflow-auto shadow-sm hover:shadow-md transition"
            >
              
              <div className="relative">
                <img
                  src={getMedicineImage(medicine)}
                  alt={medicine.displayName}
                  className="w-full h-48 object-cover"
                />

                {medicine.displayRequiresPrescription && (
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-amber-50 text-amber-700 border border-amber-200 shadow-sm">
                      Rx Required
                    </Badge>
                  </div>
                )}
              </div>

              <div className="p-5">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h3 className="text-xl font-semibold text-slate-800 leading-tight">
                    {medicine.displayName}
                  </h3>
                  <Badge variant="outline" className="shrink-0">
                    {medicine.displayCategory}
                  </Badge>
                </div>

                <p className="text-slate-400 text-lg mb-3">
                  {medicine.displayGenericName}
                </p>

                <p className="text-slate-600 text-lg leading-relaxed min-h-[84px]">
                  {medicine.displayDescription}
                </p>

                <div className="border-t mt-5 pt-5 flex items-end justify-between gap-3">
                  <div>
                    <p className="text-3xl font-bold text-teal-600 leading-none">
                      ${medicine.displayPrice.toFixed(2)}
                    </p>
                    <p
                      className={`mt-2 text-lg ${
                        medicine.displayStock > 0
                          ? "text-emerald-600"
                          : "text-red-500"
                      }`}
                    >
                      {medicine.displayStock > 0 ? "In Stock" : "Out of Stock"}
                    </p>
                  </div>

                  <Button
  onClick={() => addToCart(medicine)}
  disabled={medicine.displayStock <= 0}
  className={
    addedMedicineId.includes(medicine.id)
      ? "bg-emerald-500 hover:bg-emerald-600 rounded-xl"
      : "bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 rounded-xl"
  }
>
  {addedMedicineId.includes(medicine.id) ? (
    "Added ✓"
  ) : (
    <>
      <ShoppingCart className="w-5 h-5 mr-2" />
      Add
    </>
  )}
</Button>
                </div>
                
              </div>
              
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-200">
          <ShoppingCart className="w-16 h-16 mx-auto text-slate-300 mb-4" />
          <h3 className="text-lg font-semibold text-slate-800">
            No medicines found
          </h3>
          <p className="text-slate-500">Try adjusting your search or filters</p>
        </div>
      )}

      {cartOpen && (
        <div className="fixed inset-0 z-50 bg-black/40">
            
          <div className="absolute right-0 top-0 h-full w-full sm:max-w-lg bg-white shadow-2xl p-6 flex flex-col">
            {successMessage && (
  <div className="mb-4 p-4 rounded-xl bg-red-100 text-red-800 border border-red-200">
    {successMessage}
  </div>
)}
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-800">
                Shopping Cart
              </h2>
              <Button variant="ghost" onClick={() => setCartOpen(false)}>
                ✕
              </Button>
            </div>

            <div className="mt-6 flex-1 overflow-y-auto">
              {cart.length > 0 ? (
                <div className="space-y-4">
                  {cart.map((item) => (
                    <div
                      key={item.medicineId}
                      className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-slate-800">
                          {item.medicineName}
                        </p>
                        <p className="text-sm text-slate-500">
                          ${Number(item.price).toFixed(2)} each
                        </p>
                        {item.requiresPrescription && (
                          <Badge
                            variant="outline"
                            className="mt-1 text-xs bg-amber-50 text-amber-700 border-amber-200"
                          >
                            Rx Required
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.medicineId, -1)}
                        >
                          <Minus className="w-4 h-4" />
                        </Button>

                        <span className="w-8 text-center font-medium">
                          {item.quantity}
                        </span>

                        <Button
                          size="icon"
                          variant="outline"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.medicineId, 1)}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>

                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-red-500"
                          onClick={() => removeFromCart(item.medicineId)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}

                  {hasPrescriptionItems && (
                    <p className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg">
                      Some items require a prescription. Please ensure you have
                      a valid prescription.
                    </p>
                  )}

                  <div>
                    <Label>Delivery Address</Label>
                    <Textarea
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      placeholder="Enter your delivery address..."
                      className="mt-1"
                      rows={2}
                    />
                  </div>

                  <div>
                    <Label>Phone Number</Label>
                    <Input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Enter your phone number"
                      className="mt-1"
                    />
                  </div>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <ShoppingCart className="w-16 h-16 mx-auto text-slate-300 mb-4" />
                    <p className="text-slate-500">Your cart is empty</p>
                  </div>
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div className="border-t pt-4 mt-4">
                <div className="flex items-center justify-between py-3">
                  <span className="text-lg font-semibold">Total</span>
                  <span className="text-2xl font-bold text-teal-600">
                    ${cartTotal.toFixed(2)}
                  </span>
                </div>

                <Button
                  onClick={handlePlaceOrder}
                  disabled={ordering ||
    !user ||
    !deliveryAddress ||
    !phone ||
    cart.length === 0}
                  className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600"
                >
                  {ordering ? "Placing Order..." : "Place Order"}
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
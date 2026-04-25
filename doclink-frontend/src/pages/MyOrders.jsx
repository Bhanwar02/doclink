// @ts-nocheck
import React, { useMemo, useState } from "react";
import api from "../api/api";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  Package,
  Clock,
  Truck,
  CheckCircle,
  XCircle,
  ChevronRight,
  MapPin,
  Phone,
} from "lucide-react";
import { Badge } from "../components/ui/badge";
import { Card, CardContent } from "../components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";

const statusConfig = {
  PENDING: { color: "bg-amber-100 text-amber-700", icon: Clock, label: "Pending" },
  CONFIRMED: { color: "bg-blue-100 text-blue-700", icon: Package, label: "Confirmed" },
  PROCESSING: { color: "bg-purple-100 text-purple-700", icon: Package, label: "Processing" },
  SHIPPED: { color: "bg-cyan-100 text-cyan-700", icon: Truck, label: "Shipped" },
  DELIVERED: { color: "bg-emerald-100 text-emerald-700", icon: CheckCircle, label: "Delivered" },
  CANCELLED: { color: "bg-red-100 text-red-700", icon: XCircle, label: "Cancelled" },
};

export default function MyOrders() {
  const [selectedOrder, setSelectedOrder] = useState(null);

  const { data: user = null } = useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const res = await api.auth.me();
      return res;
    },
  });

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["my-orders", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const res = await api.get("/orders");
      const payload = res.data;

      if (Array.isArray(payload)) return payload;
      if (Array.isArray(payload?.orders)) return payload.orders;
      if (Array.isArray(payload?.data)) return payload.data;

      return [];
    },
  });

  const normalizedOrders = useMemo(() => {
    return orders.map((order) => {
      const status = (order.status || "PENDING").toUpperCase();
      const createdAt = order.createdAt || order.created_date || order.created_at || null;
      const totalAmount = Number(order.totalAmount ?? order.total_amount ?? 0) || 0;
      const deliveryAddress = order.deliveryAddress || order.delivery_address || "N/A";
      const phoneNumber = order.phoneNumber || order.phone_number || "N/A";

      const items = Array.isArray(order.items)
        ? order.items.map((item) => ({
            id: item.id,
            quantity: item.quantity ?? 0,
            price: Number(item.price) || 0,
            medicineName:
              item.medicine?.name ||
              item.medicine_name ||
              item.name ||
              "Medicine",
          }))
        : [];

      return {
        ...order,
        status,
        createdAt,
        totalAmount,
        deliveryAddress,
        phoneNumber,
        items,
      };
    });
  }, [orders]);

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">My Orders</h1>
        <p className="text-slate-500 mt-1">Track your medicine orders</p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl h-32 animate-pulse" />
          ))}
        </div>
      ) : normalizedOrders.length > 0 ? (
        <div className="space-y-4">
          {normalizedOrders.map((order) => {
            const status = statusConfig[order.status] || statusConfig.PENDING;
            const StatusIcon = status.icon;

            return (
              <Card
                key={order.id}
                className="cursor-pointer hover:shadow-md transition-all"
                onClick={() => setSelectedOrder(order)}
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-teal-100 flex items-center justify-center">
                        <StatusIcon className="w-6 h-6 text-teal-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800">
                          Order #{order.id?.slice(-8).toUpperCase()}
                        </p>
                        <p className="text-sm text-slate-500 mt-1">
                          {order.items?.length || 0} items • ${order.totalAmount.toFixed(2)}
                        </p>
                        <p className="text-sm text-slate-400 mt-1">
                          {order.createdAt
                            ? format(new Date(order.createdAt), "MMM d, yyyy 'at' h:mm a")
                            : "N/A"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Badge className={`${status.color} border-0`}>
                        {status.label}
                      </Badge>
                      <ChevronRight className="w-5 h-5 text-slate-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-200">
          <Package className="w-16 h-16 mx-auto text-slate-300 mb-4" />
          <h3 className="text-lg font-semibold text-slate-800">No orders yet</h3>
          <p className="text-slate-500 mt-1">Your medicine orders will appear here</p>
        </div>
      )}

      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-5">
              <div className="p-4 bg-slate-50 rounded-xl space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-slate-500">Order ID</span>
                  <span className="font-medium font-mono">
                    #{selectedOrder.id?.slice(-8).toUpperCase()}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm text-slate-500">Date</span>
                  <span className="font-medium">
                    {selectedOrder.createdAt
                      ? format(new Date(selectedOrder.createdAt), "MMM d, yyyy")
                      : "N/A"}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-500">Status</span>
                  <Badge
                    className={`${statusConfig[selectedOrder.status]?.color} border-0`}
                  >
                    {statusConfig[selectedOrder.status]?.label}
                  </Badge>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-slate-800 mb-3">Items</h4>
                <div className="space-y-2">
                  {selectedOrder.items?.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-slate-800">{item.medicineName}</p>
                        <p className="text-sm text-slate-500">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-semibold text-slate-800">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-teal-50 rounded-xl">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-slate-800">Total Amount</span>
                  <span className="text-2xl font-bold text-teal-600">
                    ${selectedOrder.totalAmount.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-slate-800">Delivery Info</h4>
                <div className="flex items-start gap-2 text-sm text-slate-600">
                  <MapPin className="w-4 h-4 mt-0.5 text-slate-400" />
                  {selectedOrder.deliveryAddress}
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Phone className="w-4 h-4 text-slate-400" />
                  {selectedOrder.phoneNumber}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
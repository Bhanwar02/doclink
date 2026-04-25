// @ts-nocheck
import React, { useMemo, useState } from "react";
import api from "../api/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Package, Search, Filter, ChevronRight } from "lucide-react";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { toast } from "sonner";

const statusConfig = {
  PENDING: { color: "bg-amber-100 text-amber-700", label: "Pending" },
  CONFIRMED: { color: "bg-blue-100 text-blue-700", label: "Confirmed" },
  PROCESSING: { color: "bg-purple-100 text-purple-700", label: "Processing" },
  SHIPPED: { color: "bg-cyan-100 text-cyan-700", label: "Shipped" },
  DELIVERED: { color: "bg-emerald-100 text-emerald-700", label: "Delivered" },
  CANCELLED: { color: "bg-red-100 text-red-700", label: "Cancelled" },
};

const ORDER_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

export default function AdminOrders() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const queryClient = useQueryClient();

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const res = await api.get("/orders");
      const payload = res.data;

      if (Array.isArray(payload)) return payload;
      if (Array.isArray(payload?.orders)) return payload.orders;
      if (Array.isArray(payload?.data)) return payload.data;

      return [];
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, status }) => {
      const res = await api.patch(`/orders/${id}/status`, { status });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      toast.success("Order updated");
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Failed to update order");
    },
  });

  const normalizedOrders = useMemo(() => {
    return orders.map((order) => {
      const patientEmail =
        order.patient?.email ||
        order.patient_email ||
        order.user?.email ||
        "No email";

      const patientName =
        order.patientName ||
        order.patient_name ||
        patientEmail.split("@")[0] ||
        "Unknown customer";

      const createdAt =
        order.createdAt || order.created_date || order.created_at || null;

      const totalAmountRaw =
        order.totalAmount ?? order.total_amount ?? order.total ?? 0;

      const totalAmount = Number(totalAmountRaw) || 0;

      const deliveryAddress =
        order.deliveryAddress || order.delivery_address || "N/A";

      const phoneNumber = order.phoneNumber || order.phone_number || "N/A";

      const status = (order.status || "PENDING").toUpperCase();

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
        patientName,
        patientEmail,
        createdAt,
        totalAmount,
        deliveryAddress,
        phoneNumber,
        status,
        items,
      };
    });
  }, [orders]);

  const filteredOrders = normalizedOrders.filter((order) => {
    const q = searchTerm.toLowerCase();

    const matchesSearch =
      order.patientName.toLowerCase().includes(q) ||
      order.patientEmail.toLowerCase().includes(q) ||
      order.id?.toLowerCase().includes(q);

    const matchesStatus =
      statusFilter === "ALL" || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Medicine Orders</h1>
        <p className="text-slate-500 mt-1">Manage and track customer orders</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <Input
            placeholder="Search by patient name, email, or order ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-12 bg-white"
          />
        </div>

        <div className="relative w-full sm:w-56">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full h-12 rounded-md border border-slate-200 bg-white pl-10 pr-3 text-sm outline-none"
          >
            <option value="ALL">All Status</option>
            {ORDER_STATUSES.map((status) => (
              <option key={status} value={status}>
                {statusConfig[status].label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="bg-white rounded-xl h-16 animate-pulse" />
          ))}
        </div>
      ) : filteredOrders.length > 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left py-4 px-6 font-semibold text-slate-600">
                    Order ID
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-slate-600">
                    Customer
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-slate-600">
                    Date
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-slate-600">
                    Total
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-slate-600">
                    Status
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-slate-600">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50">
                    <td className="py-4 px-6">
                      <p className="font-mono text-sm text-slate-800">
                        #{order.id?.slice(-8).toUpperCase()}
                      </p>
                    </td>

                    <td className="py-4 px-6">
                      <div>
                        <p className="font-medium text-slate-800">
                          {order.patientName}
                        </p>
                        <p className="text-sm text-slate-500">
                          {order.patientEmail}
                        </p>
                      </div>
                    </td>

                    <td className="py-4 px-6 text-slate-600">
                      {order.createdAt
                        ? format(new Date(order.createdAt), "MMM d, yyyy")
                        : "N/A"}
                    </td>

                    <td className="py-4 px-6 font-semibold text-slate-800">
                      ${order.totalAmount.toFixed(2)}
                    </td>

                    <td className="py-4 px-6">
                      <select
                        value={order.status}
                        onChange={(e) =>
                          updateMutation.mutate({
                            id: order.id,
                            status: e.target.value,
                          })
                        }
                        className="h-9 rounded-md border border-slate-200 bg-white px-2 text-sm"
                      >
                        {ORDER_STATUSES.map((status) => (
                          <option key={status} value={status}>
                            {statusConfig[status].label}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td className="py-4 px-6">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setSelectedOrder(order)}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-200">
          <Package className="w-16 h-16 mx-auto text-slate-300 mb-4" />
          <h3 className="text-lg font-semibold text-slate-800">
            No orders found
          </h3>
        </div>
      )}

      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-xl space-y-2">
                <div className="flex justify-between gap-4">
                  <span className="text-sm text-slate-500">Order ID</span>
                  <span className="font-mono">
                    #{selectedOrder.id?.slice(-8).toUpperCase()}
                  </span>
                </div>

                <div className="flex justify-between gap-4">
                  <span className="text-sm text-slate-500">Customer</span>
                  <span>{selectedOrder.patientName}</span>
                </div>

                <div className="flex justify-between gap-4">
                  <span className="text-sm text-slate-500">Email</span>
                  <span>{selectedOrder.patientEmail}</span>
                </div>

                <div className="flex justify-between gap-4">
                  <span className="text-sm text-slate-500">Phone</span>
                  <span>{selectedOrder.phoneNumber}</span>
                </div>

                <div className="flex justify-between gap-4">
                  <span className="text-sm text-slate-500">Status</span>
                  <Badge
                    className={`${statusConfig[selectedOrder.status]?.color} border-0`}
                  >
                    {statusConfig[selectedOrder.status]?.label}
                  </Badge>
                </div>
              </div>

              <div>
                <p className="text-sm text-slate-500 mb-2">Delivery Address</p>
                <p className="text-sm bg-slate-50 p-3 rounded-lg">
                  {selectedOrder.deliveryAddress}
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-500 mb-2">
                  Items ({selectedOrder.items.length})
                </p>
                <div className="space-y-2">
                  {selectedOrder.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between p-2 bg-slate-50 rounded"
                    >
                      <span>
                        {item.medicineName} x{item.quantity}
                      </span>
                      <span className="font-medium">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t">
                <span className="font-semibold">Total</span>
                <span className="text-xl font-bold text-teal-600">
                  ${selectedOrder.totalAmount.toFixed(2)}
                </span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
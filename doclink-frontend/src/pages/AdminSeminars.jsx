// @ts-nocheck
import React, { useState } from "react";
import { ToggleLeft, ToggleRight } from "lucide-react";
import api from "../api/api";
import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { GraduationCap } from "lucide-react";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { format } from "date-fns";
import { toast } from "sonner";

export default function AdminSeminars() {
  const queryClient = useQueryClient();

  // STATES
  const [showAddModal, setShowAddModal] = useState(false);
  const [editSeminar, setEditSeminar] = useState(null);
  const [deleteSeminar, setDeleteSeminar] = useState(null);

  const [newSeminar, setNewSeminar] = useState({
    title: "",
    description: "",
    speakerName: "",
    eventDate: "",
    eventTime: "",
    topicCategory: "",
    meetingLink: "",
  });

  // FETCH
  const { data: seminars = [], isLoading, error } = useQuery({
    queryKey: ["seminars"],
    queryFn: async () => {
      const res = await api.get("/seminars");
      return res.data?.seminars || res.data || [];
    },
  });

  // CREATE
  const createSeminarMutation = useMutation({
    mutationFn: async (data) => {
      const res = await api.post("/seminars", data);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Seminar created successfully");
      setShowAddModal(false);
      setNewSeminar({
        title: "",
        description: "",
        speakerName: "",
        eventDate: "",
        eventTime: "",
        topicCategory: "",
        meetingLink: "",
      });
      queryClient.invalidateQueries({ queryKey: ["seminars"] });
    },
  });

  // UPDATE
  const updateSeminarMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const res = await api.patch(`/seminars/${id}`, data);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Seminar updated successfully");
      setEditSeminar(null);
      queryClient.invalidateQueries({ queryKey: ["seminars"] });
    },
  });

  // DELETE
  const deleteSeminarMutation = useMutation({
    mutationFn: async (id) => {
      const res = await api.delete(`/seminars/${id}`);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Seminar deleted");
      setDeleteSeminar(null);
      queryClient.invalidateQueries({ queryKey: ["seminars"] });
    },
  });

const toggleStatusMutation = useMutation({
  mutationFn: async ({ id, isActive }) => {
    return await api.patch(`/seminars/${id}`, { isActive });
  },

  onMutate: async ({ id, isActive }) => {
    await queryClient.cancelQueries(["seminars"]);

    const prev = queryClient.getQueryData(["seminars"]);

    queryClient.setQueryData(["seminars"], (old = []) =>
      old.map((s) =>
        s.id === id ? { ...s, isActive } : s
      )
    );

    return { prev };
  },

  onError: (_err, _vars, context) => {
    queryClient.setQueryData(["seminars"], context.prev);
  },

  onSettled: () => {
    queryClient.invalidateQueries(["seminars"]);
  },
});

  if (isLoading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-500">Error loading seminars</div>;

  return (
    <div className="p-6 lg:p-8">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            Health Seminars
          </h1>
          <p className="text-slate-500">View all seminars</p>
        </div>

        <Button
          onClick={() => setShowAddModal(true)}
          className="bg-teal-600 hover:bg-teal-700 text-white"
        >
          + Add Seminar
        </Button>
      </div>

      {/* LIST */}
      {seminars.length > 0 ? (
        <div className="space-y-4">
          {seminars.map((seminar) => (
            <Card key={seminar.id}>
              <CardContent className="p-5 flex justify-between">
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-orange-100 flex items-center justify-center rounded-xl">
                    <GraduationCap className="text-orange-600" />
                  </div>

                  <div>
                    <h3 className="font-semibold">{seminar.title}</h3>
                    <p className="text-sm text-slate-500">
                      {seminar.description}
                    </p>
                    <p className="text-xs text-slate-400">
                      {seminar.eventDate
                        ? format(new Date(seminar.eventDate), "MMM d, yyyy")
                        : "No date"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
<Button
  size="sm"
  variant="ghost"
  onClick={() =>
    toggleStatusMutation.mutate({
      id: seminar.id,
      isActive: !seminar.isActive,
    })
  }
  className="p-0 h-auto"
>
  {seminar.isActive ? (
    <div className="flex items-center gap-2 text-emerald-600">
      <ToggleRight className="w-5 h-5" />
      <span>Active</span>
    </div>
  ) : (
    <div className="flex items-center gap-2 text-slate-400">
      <ToggleLeft className="w-5 h-5" />
      <span>Inactive</span>
    </div>
  )}
</Button>

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setEditSeminar(seminar)}
                  >
                    ✏️
                  </Button>

                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-red-500"
                    onClick={() => setDeleteSeminar(seminar)}
                  >
                    🗑️
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div>No seminars found</div>
      )}

      {/* ADD MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-xl w-full max-w-lg">
            <h3 className="font-semibold text-lg">Add Seminar</h3>

            <div className="space-y-3 mt-4">
              <Input
                placeholder="Title"
                value={newSeminar.title}
                onChange={(e) =>
                  setNewSeminar({ ...newSeminar, title: e.target.value })
                }
              />
              <Input
                placeholder="Description"
                value={newSeminar.description}
                onChange={(e) =>
                  setNewSeminar({
                    ...newSeminar,
                    description: e.target.value,
                  })
                }
              />
              <Input
                type="date"
                value={newSeminar.eventDate}
                onChange={(e) =>
                  setNewSeminar({
                    ...newSeminar,
                    eventDate: e.target.value,
                  })
                }
              />
              <Input
                type="time"
                value={newSeminar.eventTime}
                onChange={(e) =>
                  setNewSeminar({
                    ...newSeminar,
                    eventTime: e.target.value,
                  })
                }
              />
            </div>

            <div className="flex gap-3 mt-6">
              <Button onClick={() => setShowAddModal(false)}>Cancel</Button>
              <Button
                onClick={() =>
                  createSeminarMutation.mutate(newSeminar)
                }
              >
                Save
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editSeminar && (
  <div className="fixed inset-0 bg-black/50 flex justify-center items-center">
    <div className="bg-white p-6 rounded-xl w-full max-w-lg space-y-3">
      <h3 className="text-lg font-semibold">Edit Seminar</h3>

      <Input
        placeholder="Title"
        value={editSeminar.title || ""}
        onChange={(e) =>
          setEditSeminar({ ...editSeminar, title: e.target.value })
        }
      />

      <Input
        placeholder="Description"
        value={editSeminar.description || ""}
        onChange={(e) =>
          setEditSeminar({ ...editSeminar, description: e.target.value })
        }
      />

      <Input
        placeholder="Speaker Name"
        value={editSeminar.speakerName || ""}
        onChange={(e) =>
          setEditSeminar({ ...editSeminar, speakerName: e.target.value })
        }
      />

      <Input
        type="date"
        value={
          editSeminar.eventDate
            ? editSeminar.eventDate.split("T")[0]
            : ""
        }
        onChange={(e) =>
          setEditSeminar({ ...editSeminar, eventDate: e.target.value })
        }
      />

      <Input
        type="time"
        value={editSeminar.eventTime || ""}
        onChange={(e) =>
          setEditSeminar({ ...editSeminar, eventTime: e.target.value })
        }
      />

      <Input
        placeholder="Category"
        value={editSeminar.topicCategory || ""}
        onChange={(e) =>
          setEditSeminar({ ...editSeminar, topicCategory: e.target.value })
        }
      />

      <Input
        placeholder="Meeting Link"
        value={editSeminar.meetingLink || ""}
        onChange={(e) =>
          setEditSeminar({ ...editSeminar, meetingLink: e.target.value })
        }
      />

      <div className="flex gap-3 mt-4">
        <Button onClick={() => setEditSeminar(null)}>Cancel</Button>

        <Button
          onClick={() =>
            updateSeminarMutation.mutate({
              id: editSeminar.id,
              data: editSeminar,
            })
          }
        >
          Save
        </Button>
      </div>
    </div>
  </div>
)}

      {/* DELETE MODAL */}
      {deleteSeminar && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-xl w-full max-w-md">
            <h3>Delete Seminar</h3>
            <p>Are you sure you want to delete {deleteSeminar.title}?</p>

            <div className="flex gap-3 mt-6">
              <Button onClick={() => setDeleteSeminar(null)}>
                Cancel
              </Button>
              <Button
                className="bg-red-500 text-white"
                onClick={() =>
                  deleteSeminarMutation.mutate(deleteSeminar.id)
                }
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
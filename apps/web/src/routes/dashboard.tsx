import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { api } from "../lib/api";
import { useSession, signOut } from "../lib/auth";
import {
  DEFAULT_NICOTINE_MG,
  NICOTINE_TYPES,
  type NicotineType,
} from "@nicflow/shared";

export const Route = createFileRoute("/dashboard")({
  component: DashboardPage,
});

function DashboardPage() {
  const { data: session, isPending } = useSession();
  const queryClient = useQueryClient();
  const [type, setType] = useState<NicotineType>("cigarette");
  const [nicotineMg, setNicotineMg] = useState(DEFAULT_NICOTINE_MG.cigarette);
  const [notes, setNotes] = useState("");

  const { data: stats } = useQuery({
    queryKey: ["stats"],
    queryFn: async () => {
      const res = await api.entries.stats.$get();
      return res.json();
    },
    refetchInterval: 30000,
  });

  const { data: entries } = useQuery({
    queryKey: ["entries"],
    queryFn: async () => {
      const res = await api.entries.$get();
      return res.json();
    },
  });

  const addEntry = useMutation({
    mutationFn: async () => {
      const res = await api.entries.$post({
        json: { type, nicotineMg, notes: notes || undefined },
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entries"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
      setNotes("");
    },
  });

  const handleTypeChange = (newType: NicotineType) => {
    setType(newType);
    setNicotineMg(DEFAULT_NICOTINE_MG[newType]);
  };

  if (isPending) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  if (!session) {
    return (
      <div className="p-8 text-center">
        <p>Please sign in to access the dashboard.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <button
          onClick={() => signOut()}
          className="text-gray-600 hover:text-gray-900"
        >
          Sign Out
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Current Level</h3>
          <p className="text-3xl font-bold text-indigo-600">
            {stats?.currentLevelMg ?? 0} mg
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Entries (24h)</h3>
          <p className="text-3xl font-bold text-gray-900">
            {stats?.entriesLast24h ?? 0}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">
            Total Nicotine (24h)
          </h3>
          <p className="text-3xl font-bold text-gray-900">
            {stats?.totalNicotineMg ?? 0} mg
          </p>
        </div>
      </div>

      {/* Add Entry Form */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h2 className="text-lg font-semibold mb-4">Log Nicotine</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type
            </label>
            <select
              value={type}
              onChange={(e) => handleTypeChange(e.target.value as NicotineType)}
              className="w-full rounded-md border border-gray-300 px-3 py-2"
            >
              {NICOTINE_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nicotine (mg)
            </label>
            <input
              type="number"
              value={nicotineMg}
              onChange={(e) => setNicotineMg(parseFloat(e.target.value))}
              step="0.1"
              min="0"
              className="w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional"
              className="w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={() => addEntry.mutate()}
              disabled={addEntry.isPending}
              className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              {addEntry.isPending ? "Adding..." : "Add Entry"}
            </button>
          </div>
        </div>
      </div>

      {/* Recent Entries */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Recent Entries</h2>
        <div className="space-y-2">
          {entries?.slice(0, 10).map((entry) => (
            <div
              key={entry.id}
              className="flex justify-between items-center py-2 border-b border-gray-100"
            >
              <div>
                <span className="font-medium capitalize">{entry.type}</span>
                <span className="text-gray-500 ml-2">{entry.nicotineMg} mg</span>
                {entry.notes && (
                  <span className="text-gray-400 ml-2">- {entry.notes}</span>
                )}
              </div>
              <span className="text-sm text-gray-500">
                {new Date(entry.timestamp).toLocaleString()}
              </span>
            </div>
          ))}
          {(!entries || entries.length === 0) && (
            <p className="text-gray-500 text-center py-4">No entries yet</p>
          )}
        </div>
      </div>
    </div>
  );
}

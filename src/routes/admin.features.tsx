import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Trash2, Edit2, Plus, X, Check, Sparkles } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/features")({ component: AdminFeatures });

interface Feature {
  id: string;
  title: string;
  subtitle: string;
  gradient: string;
}

const gradientOptions = [
  { label: "Blue-Purple", value: "from-primary/40 to-accent/30" },
  { label: "Purple-Neon", value: "from-accent/40 to-neon/30" },
  { label: "Neon-Blue", value: "from-neon/40 to-primary/30" },
  { label: "Gold-Amber", value: "from-gold/40 to-amber-700/30" },
  { label: "Rose-Pink", value: "from-rose-500/40 to-pink-500/30" },
  { label: "Emerald-Teal", value: "from-emerald-500/40 to-teal-500/30" },
];

function AdminFeatures() {
  const [features, setFeatures] = useState<Feature[]>([]);

  const [isAddingFeature, setIsAddingFeature] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    gradient: "from-primary/40 to-accent/30",
  });

  const handleAddClick = () => {
    setIsAddingFeature(true);
    setEditingId(null);
    setFormData({ title: "", subtitle: "", gradient: "from-primary/40 to-accent/30" });
  };

  const handleEditClick = (feature: Feature) => {
    setIsAddingFeature(true);
    setEditingId(feature.id);
    setFormData({ title: feature.title, subtitle: feature.subtitle, gradient: feature.gradient });
  };

  const handleSave = () => {
    if (!formData.title.trim()) {
      toast.error("Feature title is required");
      return;
    }
    if (!formData.subtitle.trim()) {
      toast.error("Feature subtitle is required");
      return;
    }

    if (editingId) {
      setFeatures(features.map((f) => (f.id === editingId ? { ...f, ...formData } : f)));
      toast.success("Feature updated successfully");
    } else {
      const newFeature: Feature = {
        id: Date.now().toString(),
        ...formData,
      };
      setFeatures([...features, newFeature]);
      toast.success("Feature added successfully");
    }

    setIsAddingFeature(false);
    setEditingId(null);
    setFormData({ title: "", subtitle: "", gradient: "from-primary/40 to-accent/30" });
  };

  const handleDelete = (id: string) => {
    setFeatures(features.filter((f) => f.id !== id));
    toast.success("Feature deleted");
  };

  const handleCancel = () => {
    setIsAddingFeature(false);
    setEditingId(null);
    setFormData({ title: "", subtitle: "", gradient: "from-primary/40 to-accent/30" });
  };

  return (
    <div className="space-y-4 animate-fade-up">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Feature Slideshow</h1>
        {!isAddingFeature && (
          <button
            onClick={handleAddClick}
            className="tile-press flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-xs font-bold text-primary-foreground glow-primary hover:shadow-lg"
          >
            <Plus className="h-4 w-4" />
            Add Feature
          </button>
        )}
      </div>

      {/* Add/Edit Form */}
      {isAddingFeature && (
        <div className="glass rounded-2xl p-4 space-y-4 animate-fade-up">
          <p className="text-xs font-bold tracking-widest text-muted-foreground">
            {editingId ? "EDIT FEATURE" : "ADD NEW FEATURE"}
          </p>

          <div>
            <label className="text-sm font-semibold block mb-2">Feature Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Tech Symposium"
              className="w-full rounded-xl bg-muted/30 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary"
              maxLength={50}
            />
            <p className="text-xs text-muted-foreground mt-1">{formData.title.length}/50</p>
          </div>

          <div>
            <label className="text-sm font-semibold block mb-2">Subtitle/Description</label>
            <input
              type="text"
              value={formData.subtitle}
              onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
              placeholder="e.g., Oct 15-17"
              className="w-full rounded-xl bg-muted/30 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary"
              maxLength={60}
            />
            <p className="text-xs text-muted-foreground mt-1">{formData.subtitle.length}/60</p>
          </div>

          <div>
            <label className="text-sm font-semibold block mb-2">Design Theme</label>
            <div className="grid grid-cols-3 gap-2">
              {gradientOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setFormData({ ...formData, gradient: option.value })}
                  className={`tile-press rounded-lg p-3 border-2 transition-all ${
                    formData.gradient === option.value
                      ? "border-primary ring-2 ring-primary/50"
                      : "border-muted/20 hover:border-muted/50"
                  }`}
                >
                  <div className={`h-12 rounded-lg bg-gradient-to-br ${option.value} mb-1.5`} />
                  <p className="text-xs font-semibold text-center">{option.label}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-2">PREVIEW</p>
            <div className="glass rounded-2xl p-4">
              <div className={`mb-3 h-20 rounded-xl bg-gradient-to-br ${formData.gradient}`} />
              <p className="text-[10px] tracking-widest text-muted-foreground">CAMPUS</p>
              <p className="text-sm font-bold line-clamp-2">{formData.title || "Feature Title"}</p>
              <p className="text-xs text-muted-foreground line-clamp-1">
                {formData.subtitle || "Subtitle"}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="tile-press flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-accent py-3 font-bold text-primary-foreground glow-primary hover:shadow-lg"
            >
              <Check className="h-4 w-4" />
              Save Feature
            </button>
            <button
              onClick={handleCancel}
              className="tile-press flex-1 flex items-center justify-center gap-2 rounded-xl bg-muted/30 py-3 font-bold hover:bg-muted/40"
            >
              <X className="h-4 w-4" />
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Features List */}
      <div className="space-y-3">
        <p className="text-xs font-bold tracking-widest text-muted-foreground">
          {features.length} FEATURE{features.length !== 1 ? "S" : ""} ACTIVE
        </p>

        {features.length > 0 ? (
          <div className="space-y-2">
            {features.map((feature) => (
              <div key={feature.id} className="glass rounded-xl p-4">
                <div className="flex items-start gap-4">
                  <div
                    className={`h-16 w-20 shrink-0 rounded-lg bg-gradient-to-br ${feature.gradient}`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs tracking-widest text-muted-foreground">CAMPUS</p>
                    <p className="font-semibold text-sm line-clamp-1">{feature.title}</p>
                    <p className="text-xs text-muted-foreground line-clamp-1">{feature.subtitle}</p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button
                      onClick={() => handleEditClick(feature)}
                      className="tile-press p-2 rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="h-4 w-4 text-primary" />
                    </button>
                    <button
                      onClick={() => handleDelete(feature.id)}
                      className="tile-press p-2 rounded-lg bg-muted/20 hover:bg-destructive/20 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass rounded-2xl p-6 text-center space-y-2">
            <Sparkles className="h-8 w-8 text-muted-foreground mx-auto" />
            <p className="text-sm font-semibold">No features yet</p>
            <p className="text-xs text-muted-foreground">Add your first feature to get started</p>
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="glass rounded-2xl p-4 space-y-2">
        <p className="text-xs font-semibold text-muted-foreground">ℹ️ HOW IT WORKS</p>
        <ul className="space-y-1.5 text-xs text-muted-foreground">
          <li className="flex gap-2">
            <span>•</span>
            <span>Features appear in a horizontal scrollable carousel on the home page</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span>Each feature shows a title, subtitle, and custom design theme</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span>Students can scroll left/right to see all active features</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span>Updated features appear immediately on the home page</span>
          </li>
        </ul>
      </div>
    </div>
  );
}

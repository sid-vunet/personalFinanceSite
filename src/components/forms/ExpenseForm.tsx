import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, X, Image as ImageIcon, Loader2 } from "lucide-react";
import { uploadApi } from "@/lib/api";

interface ExpenseFormData {
  amount: string;
  description: string;
  category: string;
  merchant: string;
  date: string;
  notes: string;
  isShared: boolean;
  attachments: string[];
}

interface ExpenseFormProps {
  categories: { id: string; name: string; color?: string }[];
  onSubmit: (data: ExpenseFormData) => void;
  onCancel?: () => void;
  initialData?: Partial<ExpenseFormData>;
  isLoading?: boolean;
}

export function ExpenseForm({
  categories,
  onSubmit,
  onCancel,
  initialData,
  isLoading = false,
}: ExpenseFormProps) {
  const [formData, setFormData] = useState<ExpenseFormData>({
    amount: initialData?.amount || "",
    description: initialData?.description || "",
    category: initialData?.category || "",
    merchant: initialData?.merchant || "",
    date: initialData?.date || new Date().toISOString().split("T")[0],
    notes: initialData?.notes || "",
    isShared: initialData?.isShared ?? true,
    attachments: initialData?.attachments || [],
  });
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      const uploadPromises = Array.from(files).map(file => uploadApi.upload(file));
      const results = await Promise.all(uploadPromises);
      const urls = results.map(r => r.url);
      
      setFormData(prev => ({
        ...prev,
        attachments: [...prev.attachments, ...urls],
      }));
    } catch (err) {
      console.error("Upload error:", err);
      setUploadError("Failed to upload file. Make sure the API server is running.");
    } finally {
      setIsUploading(false);
      // Reset the input
      e.target.value = "";
    }
  };

  const removeAttachment = (index: number) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index),
    }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{initialData ? "Edit Expense" : "Add Expense"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (₹)</Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.amount}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                name="date"
                type="date"
                value={formData.date}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              name="description"
              placeholder="What was this expense for?"
              value={formData.description}
              onChange={handleChange}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                required
              >
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="merchant">Merchant/Store</Label>
              <Input
                id="merchant"
                name="merchant"
                placeholder="Where did you spend?"
                value={formData.merchant}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <textarea
              id="notes"
              name="notes"
              placeholder="Any additional notes..."
              value={formData.notes}
              onChange={handleChange}
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          {/* Attachments */}
          <div className="space-y-2">
            <Label>Attachments (Optional)</Label>
            
            {/* Upload Button */}
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 px-4 py-2 border border-dashed border-input rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                {isUploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
                <span className="text-sm">
                  {isUploading ? "Uploading..." : "Upload Image"}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={isUploading}
                />
              </label>
            </div>
            
            {/* Upload Error */}
            {uploadError && (
              <p className="text-sm text-red-500">{uploadError}</p>
            )}

            {/* Preview Attachments */}
            {formData.attachments.length > 0 && (
              <div className="grid grid-cols-4 gap-2 mt-2">
                {formData.attachments.map((url, index) => (
                  <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-muted group">
                    <img 
                      src={url} 
                      alt={`Attachment ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeAttachment(index)}
                      className="absolute top-1 right-1 h-6 w-6 rounded-full bg-black/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isShared"
              name="isShared"
              checked={formData.isShared}
              onChange={handleChange}
              className="h-4 w-4 rounded border-input"
            />
            <Label htmlFor="isShared" className="font-normal">
              This is a shared family expense
            </Label>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
            <Button type="submit" disabled={isLoading || isUploading}>
              {isLoading
                ? "Saving..."
                : initialData
                  ? "Update Expense"
                  : "Add Expense"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

import { useState, useCallback } from "react";
import { Upload, X, Loader2, ImagePlus } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface ImageUploadProps {
    value: string[];
    onChange: (urls: string[]) => void;
    disabled?: boolean;
}

export function ImageUpload({ value, onChange, disabled }: ImageUploadProps) {
    const [uploading, setUploading] = useState(false);

    const onDrop = useCallback(
        async (acceptedFiles: File[]) => {
            try {
                setUploading(true);
                const newUrls: string[] = [];

                for (const file of acceptedFiles) {
                    const fileExt = file.name.split(".").pop();
                    const fileName = `${Math.random()}.${fileExt}`;
                    const filePath = `${fileName}`;

                    const { error: uploadError } = await supabase.storage
                        .from("product-images")
                        .upload(filePath, file);

                    if (uploadError) {
                        throw uploadError;
                    }

                    const { data } = supabase.storage
                        .from("product-images")
                        .getPublicUrl(filePath);

                    newUrls.push(data.publicUrl);
                }

                onChange([...value, ...newUrls]);
                toast.success("Images uploaded successfully");
            } catch (error) {
                toast.error("Error uploading images");
                console.error(error);
            } finally {
                setUploading(false);
            }
        },
        [onChange, value]
    );

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            "image/jpeg": [],
            "image/png": [],
            "image/webp": [],
        },
        disabled: disabled || uploading,
    });

    const removeImage = (urlToRemove: string) => {
        onChange(value.filter((url) => url !== urlToRemove));
    };

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4 mb-4">
                {value.map((url) => (
                    <div
                        key={url}
                        className="relative aspect-square rounded-md overflow-hidden border group"
                    >
                        <div className="absolute top-2 right-2 z-10 w-auto h-auto">
                            <Button
                                type="button"
                                onClick={() => removeImage(url)}
                                variant="destructive"
                                size="icon"
                                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                        <img
                            src={url}
                            alt="Product"
                            className="object-cover w-full h-full"
                        />
                    </div>
                ))}
            </div>

            <div
                {...getRootProps()}
                className={cn(
                    "border-2 border-dashed rounded-lg p-10 flex flex-col items-center justify-center gap-4 text-center cursor-pointer transition-colors hover:bg-muted/50",
                    isDragActive && "border-primary bg-primary/5",
                    (disabled || uploading) && "opacity-50 cursor-not-allowed"
                )}
            >
                <input {...getInputProps()} />
                {uploading ? (
                    <div className="flex flex-col items-center gap-2">
                        <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">Uploading...</p>
                    </div>
                ) : (
                    <>
                        <div className="p-4 bg-background rounded-full border shadow-sm">
                            <ImagePlus className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm font-medium">
                                Drag & drop images here, or click to select
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Supports JPG, PNG, WebP (Max 5MB)
                            </p>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

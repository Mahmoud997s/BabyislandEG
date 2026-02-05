import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { ImageUpload } from "@/components/ui/image-upload";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription,
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Upload, ChevronLeft, Save, Plus, Trash2, GripVertical } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";

// Detailed Schema including Specs and Features
const productSchema = z.object({
    name: z.string().min(2, "Name is required"),
    description: z.string().optional(),
    price: z.coerce.number().min(0),
    compareAtPrice: z.coerce.number().optional(),
    stock: z.coerce.number().int().min(0),
    category: z.string().min(1, "Category is required"),
    status: z.enum(["active", "draft", "archived"]),
    isNew: z.boolean().default(false),
    isBestSeller: z.boolean().default(false),
    isFeatured: z.boolean().default(false),
    images: z.array(z.string()).default([]),
    // Advanced Details
    specs: z.object({
        weight: z.string().optional(),
        maxLoad: z.string().optional(),
        suitableAge: z.string().optional(),
        dimensions: z.string().optional(),
        foldedDimensions: z.string().optional(),
        wheelType: z.string().optional(),
        reclinePositions: z.coerce.number().optional(),
    }).optional(),
    features: z.array(z.string()).default([]),
    tagline: z.string().optional(),
    tagline_ar: z.string().optional(),
    shippingEstimate: z.string().optional(),
    warranty: z.coerce.number().optional(),
    name_ar: z.string().optional(),
    description_ar: z.string().optional(),
});

type ProductFormValues = z.infer<typeof productSchema>;

export default function ProductForm({ initialData }: { initialData?: any }) {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const form = useForm<ProductFormValues>({
        resolver: zodResolver(productSchema),
        defaultValues: initialData ? {
            ...initialData,
            features: initialData.features || [],
            specs: initialData.specs || {}
        } : {
            name: "",
            name_ar: "",
            description: "",
            description_ar: "",
            price: 0,
            stock: 0,
            category: "",
            status: "active",
            isNew: false,
            isBestSeller: false,
            isFeatured: false,
            images: [],
            features: [],
            specs: {
                weight: "", maxLoad: "", suitableAge: "", dimensions: "", foldedDimensions: "", wheelType: "", reclinePositions: 0
            },
            tagline: "",
            tagline_ar: "",
            shippingEstimate: "3-5 business days",
            warranty: 1
        },
    });

    const { fields: featureFields, append: appendFeature, remove: removeFeature } = useFieldArray({
        control: form.control,
        // @ts-ignore - zod helper issue with simple arrays
        name: "features" as any,
    });

    // Custom helper for simple string array (since useFieldArray expects objects)
    // We'll manage features via local state if hook form gets tricky, but let's try direct first.
    // Actually, useFieldArray works best with object arrays { value: string }. 
    // For simplicity, let's just use a state for features if the schema is array of strings.
    // OR we can map form features to object array on load/save. Let's do the state approach for features UI.
    const [features, setFeatures] = useState<string[]>(initialData?.features || []);

    // Sync features state to form
    const addFeature = () => setFeatures([...features, ""]);
    const updateFeature = (index: number, val: string) => {
        const newFeatures = [...features];
        newFeatures[index] = val;
        setFeatures(newFeatures);
        form.setValue("features", newFeatures);
    };
    const removeFeatureItem = (index: number) => {
        const newFeatures = features.filter((_, i) => i !== index);
        setFeatures(newFeatures);
        form.setValue("features", newFeatures);
    };

    const onSubmit = async (data: ProductFormValues) => {
        setLoading(true);
        try {
            // Ensure features are synced
            data.features = features.filter(f => f.trim() !== "");

            const payload = {
                name: data.name,
                name_ar: data.name_ar,
                description: data.description,
                description_ar: data.description_ar,
                price: data.price,
                compareAtPrice: data.compareAtPrice,
                stock: data.stock,
                category: data.category,
                isNew: data.isNew,
                isBestSeller: data.isBestSeller,
                isFeatured: data.isFeatured,
                images: data.images,
                specs: data.specs,
                features: data.features,
                tagline: data.tagline,
                tagline_ar: data.tagline_ar,
                shippingEstimate: data.shippingEstimate,
                warranty: data.warranty
            };

            if (initialData?.id) {
                // UPDATE
                const { error } = await supabase
                    .from("products")
                    .update(payload)
                    .eq("id", initialData.id);
                if (error) throw error;
                toast.success("Product updated successfully!");
            } else {
                // INSERT
                const { error } = await supabase
                    .from("products")
                    .insert([payload]);
                if (error) throw error;
                toast.success("Product created successfully!");
            }

            navigate("/admin/products");
        } catch (error: any) {
            toast.error(error.message);
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-6xl mx-auto pb-10">

                {/* Header Actions */}
                <div className="flex items-center justify-between sticky top-0 z-10 bg-slate-50/80 backdrop-blur-sm py-4 border-b mb-6">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="sm" onClick={() => navigate("/admin/products")} type="button">
                            <ChevronLeft className="w-4 h-4 mr-2" /> Back
                        </Button>
                        <h1 className="text-xl font-bold text-slate-900">
                            {initialData ? "Edit Product" : "Create Product"}
                        </h1>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" type="button" onClick={() => navigate("/admin/products")}>Discard</Button>
                        <Button type="submit" disabled={loading}>
                            {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                            Save Product
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Organization & Status (Sticky) */}
                    <div className="space-y-6 lg:col-span-1 h-fit">
                        <Card>
                            <CardHeader>
                                <CardTitle>Status & Visibility</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="status"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Product Status</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select status" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="active">Active</SelectItem>
                                                    <SelectItem value="draft">Draft</SelectItem>
                                                    <SelectItem value="archived">Archived</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Separator />
                                <div className="space-y-3">
                                    <FormField
                                        control={form.control}
                                        name="isNew"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                                <div className="space-y-0.5">
                                                    <FormLabel className="text-sm">New Arrival Badge</FormLabel>
                                                </div>
                                                <FormControl>
                                                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="isBestSeller"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                                <div className="space-y-0.5">
                                                    <FormLabel className="text-sm">Best Seller Badge</FormLabel>
                                                </div>
                                                <FormControl>
                                                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="isFeatured"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                                <div className="space-y-0.5">
                                                    <FormLabel className="text-sm">Feature on Home</FormLabel>
                                                </div>
                                                <FormControl>
                                                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Organization</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="category"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Category</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g. Strollers" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="tagline"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Tagline (Short)</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g. The urban choice" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="tagline_ar"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Tagline (Arabic)</FormLabel>
                                            <FormControl>
                                                <Input placeholder="نص ترويجي قصير" dir="rtl" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column: Main Content (Tabs) */}
                    <div className="lg:col-span-2">
                        <Tabs defaultValue="general" className="w-full">
                            <TabsList className="grid w-full grid-cols-4 mb-4">
                                <TabsTrigger value="general">General</TabsTrigger>
                                <TabsTrigger value="media">Media</TabsTrigger>
                                <TabsTrigger value="specs">Specs</TabsTrigger>
                                <TabsTrigger value="features">Features</TabsTrigger>
                            </TabsList>

                            {/* GENERAL TAB */}
                            <TabsContent value="general" className="space-y-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Basic Information</CardTitle>
                                        <CardDescription>Product title, description and pricing.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <FormField
                                            control={form.control}
                                            name="name"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Product Name</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="e.g. Luxury Stroller 3000" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="name_ar"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Product Name (Arabic)</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="اسم المنتج بالعربية" dir="rtl" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="description"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Description (English)</FormLabel>
                                                    <FormControl>
                                                        <Textarea
                                                            placeholder="Detailed product description..."
                                                            className="min-h-[150px]"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="description_ar"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Description (Arabic)</FormLabel>
                                                    <FormControl>
                                                        <Textarea
                                                            placeholder="وصف المنتج بالعربية..."
                                                            className="min-h-[150px]"
                                                            dir="rtl"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <div className="grid grid-cols-2 gap-6">
                                            <FormField
                                                control={form.control}
                                                name="price"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Price (EGP)</FormLabel>
                                                        <FormControl>
                                                            <Input type="number" placeholder="0.00" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="compareAtPrice"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Compare Price</FormLabel>
                                                        <FormControl>
                                                            <Input type="number" placeholder="0.00" {...field} />
                                                        </FormControl>
                                                        <FormDescription>Old price (strikethrough)</FormDescription>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-6">
                                            <FormField
                                                control={form.control}
                                                name="stock"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Stock Quantity</FormLabel>
                                                        <FormControl>
                                                            <Input type="number" {...field} />
                                                        </FormControl>
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="warranty"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Warranty (Years)</FormLabel>
                                                        <FormControl>
                                                            <Input type="number" {...field} />
                                                        </FormControl>
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* MEDIA TAB */}
                            <TabsContent value="media">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Product Images</CardTitle>
                                        <CardDescription>Upload high-quality images. The first image will be the main cover.</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <FormField
                                            control={form.control}
                                            name="images"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <ImageUpload
                                                            value={field.value}
                                                            onChange={field.onChange}
                                                            disabled={loading}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* SPECS TAB */}
                            <TabsContent value="specs">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Technical Specifications</CardTitle>
                                        <CardDescription>Detailed measurements and capabilities.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <FormField
                                            control={form.control}
                                            name="specs.weight"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Weight</FormLabel>
                                                    <FormControl><Input placeholder="e.g. 6.5 kg" {...field} /></FormControl>
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="specs.maxLoad"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Max Load</FormLabel>
                                                    <FormControl><Input placeholder="e.g. 22 kg" {...field} /></FormControl>
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="specs.suitableAge"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Suitable Age</FormLabel>
                                                    <FormControl><Input placeholder="e.g. 0-4 years" {...field} /></FormControl>
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="specs.wheelType"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Wheel Type</FormLabel>
                                                    <FormControl><Input placeholder="e.g. Rubber / EVA" {...field} /></FormControl>
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="specs.dimensions"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Open Dimensions</FormLabel>
                                                    <FormControl><Input placeholder="L x W x H" {...field} /></FormControl>
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="specs.foldedDimensions"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Folded Dimensions</FormLabel>
                                                    <FormControl><Input placeholder="L x W x H" {...field} /></FormControl>
                                                </FormItem>
                                            )}
                                        />
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* FEATURES TAB */}
                            <TabsContent value="features">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Product Features</CardTitle>
                                        <CardDescription>Key selling points displayed as a list.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {features.map((feature, index) => (
                                            <div key={index} className="flex items-center gap-2">
                                                <GripVertical className="w-4 h-4 text-slate-400 cursor-move" />
                                                <Input
                                                    value={feature}
                                                    onChange={(e) => updateFeature(index, e.target.value)}
                                                    placeholder="e.g. One-hand fold mechanism"
                                                />
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => removeFeatureItem(index)}
                                                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        ))}

                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={addFeature}
                                            className="w-full border-dashed"
                                        >
                                            <Plus className="w-4 h-4 mr-2" /> Add Feature
                                        </Button>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </form>
        </Form>
    );
}

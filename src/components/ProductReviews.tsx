import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { reviewsService, Review } from "@/services/reviewsService";
import { Star, Loader2, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface ProductReviewsProps {
    productId: number;
}

export function ProductReviews({ productId }: ProductReviewsProps) {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [rating, setRating] = useState(5);
    const [hoverRating, setHoverRating] = useState(0);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [title, setTitle] = useState("");
    const [comment, setComment] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [visibleReviews, setVisibleReviews] = useState(4);

    useEffect(() => {
        loadReviews();
    }, [productId]);

    const loadReviews = async () => {
        setLoading(true);
        const data = await reviewsService.getApprovedReviews(productId);
        setReviews(data);
        setLoading(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name.trim() || !comment.trim()) {
            toast.error("الرجاء إدخال الاسم والتعليق");
            return;
        }

        setSubmitting(true);

        const success = await reviewsService.submitReview({
            product_id: productId,
            customer_name: name.trim(),
            customer_email: email.trim() || undefined,
            rating,
            title: title.trim() || undefined,
            comment: comment.trim()
        });

        setSubmitting(false);

        if (success) {
            toast.success("تم إرسال تقييمك بنجاح! سيظهر بعد المراجعة.");
            setDialogOpen(false);
            setName("");
            setEmail("");
            setTitle("");
            setComment("");
            setRating(5);
        } else {
            toast.error("فشل في إرسال التقييم");
        }
    };

    const renderStars = (rating: number, interactive = false) => {
        return (
            <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        className={`w-5 h-5 ${star <= (interactive ? (hoverRating || rating) : rating)
                            ? "fill-amber-400 text-amber-400"
                            : "text-slate-300"
                            } ${interactive ? "cursor-pointer transition-colors" : ""}`}
                        onClick={() => interactive && setRating(star)}
                        onMouseEnter={() => interactive && setHoverRating(star)}
                        onMouseLeave={() => interactive && setHoverRating(0)}
                    />
                ))}
            </div>
        );
    };

    const avgRating = reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6" dir="rtl">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">التقييمات والمراجعات</h2>
                    {reviews.length > 0 && (
                        <div className="flex items-center gap-3 mt-2">
                            {renderStars(Math.round(avgRating))}
                            <span className="text-lg font-semibold">{avgRating.toFixed(1)}</span>
                            <span className="text-slate-500">({reviews.length} تقييم)</span>
                        </div>
                    )}
                </div>

                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2">
                            <MessageSquare className="w-4 h-4" />
                            اكتب تقييمك
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]" dir="rtl">
                        <DialogHeader>
                            <DialogTitle>أضف تقييمك</DialogTitle>
                            <DialogDescription>شارك رأيك حول هذا المنتج</DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label>التقييم</Label>
                                {renderStars(rating, true)}
                            </div>

                            <div className="space-y-2">
                                <Label>الاسم *</Label>
                                <Input
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>البريد الإلكتروني</Label>
                                <Input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>عنوان المراجعة</Label>
                                <Input
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="اختصر رأيك في سطر واحد"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>التعليق *</Label>
                                <Textarea
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    rows={4}
                                    required
                                    placeholder="اكتب تجربتك مع المنتج..."
                                />
                            </div>

                            <Button type="submit" disabled={submitting} className="w-full">
                                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "إرسال التقييم"}
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Reviews List */}
            {reviews.length === 0 ? (
                <Card className="border-dashed shadow-none bg-muted/30">
                    <CardContent className="py-12 text-center">
                        <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">لا توجد تقييمات بعد. كن أول من يقيّم هذا المنتج!</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6" dir="ltr"> {/* Enforce LTR for grid order or keep RTL depending on language, but 2-col structure is key */}
                        {reviews.slice(0, visibleReviews).map((review, index) => (
                            <motion.div
                                key={review.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="h-full"
                            >
                                <Card className="h-full flex flex-col shadow-sm hover:shadow-md transition-shadow">
                                    <CardContent className="pt-6 flex-1 flex flex-col gap-3 text-right" dir="auto">
                                        <div className="flex items-start justify-between">
                                            <div className="flex flex-col gap-1">
                                                 <span className="font-bold text-foreground">{review.customer_name}</span>
                                                 {renderStars(review.rating)}
                                            </div>
                                            <span className="text-xs text-muted-foreground">
                                                {new Date(review.created_at).toLocaleDateString("ar-EG")}
                                            </span>
                                        </div>
                                        
                                        {review.title && (
                                            <h4 className="font-bold text-sm text-foreground">{review.title}</h4>
                                        )}
                                        
                                        <p className="text-muted-foreground text-sm leading-relaxed flex-1">
                                            "{review.comment}"
                                        </p>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>

                    {visibleReviews < reviews.length && (
                        <div className="flex justify-center pt-4">
                            <Button 
                                variant="outline" 
                                size="lg" 
                                onClick={() => setVisibleReviews(prev => prev + 4)}
                                className="min-w-[200px] rounded-full"
                            >
                                تحميل المزيد
                            </Button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

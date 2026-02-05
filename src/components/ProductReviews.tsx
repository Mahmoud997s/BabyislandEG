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
                <Card>
                    <CardContent className="py-12 text-center">
                        <MessageSquare className="w-12 h-12 mx-auto text-slate-300 mb-4" />
                        <p className="text-slate-500">لا توجد تقييمات بعد. كن أول من يقيّم هذا المنتج!</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {reviews.map((review, index) => (
                        <motion.div
                            key={review.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="flex items-start justify-between mb-3">
                                        <div>
                                            <p className="font-semibold">{review.customer_name}</p>
                                            <p className="text-xs text-slate-500">
                                                {new Date(review.created_at).toLocaleDateString("ar-EG")}
                                            </p>
                                        </div>
                                        {renderStars(review.rating)}
                                    </div>
                                    {review.title && (
                                        <p className="font-medium mb-2">{review.title}</p>
                                    )}
                                    <p className="text-slate-600 leading-relaxed">{review.comment}</p>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}

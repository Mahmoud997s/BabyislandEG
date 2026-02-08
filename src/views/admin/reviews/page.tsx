"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { reviewsService, Review } from "@/services/reviewsService";
import { Loader2, Star, CheckCircle, XCircle, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function ReviewsPage() {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

    useEffect(() => {
        loadReviews();
    }, []);

    const loadReviews = async () => {
        setLoading(true);
        const data = await reviewsService.getAllReviews();
        setReviews(data);
        setLoading(false);
    };

    const handleApprove = async (id: number) => {
        const success = await reviewsService.updateReviewStatus(id, 'approved');
        if (success) {
            toast.success("Review approved");
            loadReviews();
        } else {
            toast.error("Failed to approve review");
        }
    };

    const handleReject = async (id: number) => {
        const success = await reviewsService.updateReviewStatus(id, 'rejected', 'Rejected by admin');
        if (success) {
            toast.success("Review rejected");
            loadReviews();
        } else {
            toast.error("Failed to reject review");
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this review?")) return;

        const success = await reviewsService.deleteReview(id);
        if (success) {
            toast.success("Review deleted");
            loadReviews();
        } else {
            toast.error("Failed to delete review");
        }
    };

    const renderStars = (rating: number) => {
        return (
            <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        className={`w-4 h-4 ${star <= rating ? "fill-amber-400 text-amber-400" : "text-slate-300"
                            }`}
                    />
                ))}
            </div>
        );
    };

    const filteredReviews = filter === 'all'
        ? reviews
        : reviews.filter(r => r.status === filter);

    const stats = {
        total: reviews.length,
        pending: reviews.filter(r => r.status === 'pending').length,
        approved: reviews.filter(r => r.status === 'approved').length,
        rejected: reviews.filter(r => r.status === 'rejected').length
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50/50">
            <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6">

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                        Reviews Management
                    </h1>
                    <p className="text-slate-500 mt-1">Review and manage customer feedback</p>
                </motion.div>

                {/* Stats */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="grid grid-cols-2 lg:grid-cols-4 gap-4"
                >
                    <Card className="border shadow-sm">
                        <CardContent className="pt-6">
                            <p className="text-sm text-slate-500">Total Reviews</p>
                            <p className="text-3xl font-bold">{stats.total}</p>
                        </CardContent>
                    </Card>
                    <Card className="border shadow-sm">
                        <CardContent className="pt-6">
                            <p className="text-sm text-slate-500">Pending</p>
                            <p className="text-3xl font-bold text-amber-600">{stats.pending}</p>
                        </CardContent>
                    </Card>
                    <Card className="border shadow-sm">
                        <CardContent className="pt-6">
                            <p className="text-sm text-slate-500">Approved</p>
                            <p className="text-3xl font-bold text-emerald-600">{stats.approved}</p>
                        </CardContent>
                    </Card>
                    <Card className="border shadow-sm">
                        <CardContent className="pt-6">
                            <p className="text-sm text-slate-500">Rejected</p>
                            <p className="text-3xl font-bold text-red-600">{stats.rejected}</p>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Reviews Tabs */}
                <Tabs value={filter} onValueChange={(v: any) => setFilter(v)} className="space-y-4">
                    <TabsList className="grid w-full grid-cols-4 lg:w-[600px]">
                        <TabsTrigger value="all">All ({stats.total})</TabsTrigger>
                        <TabsTrigger value="pending">Pending ({stats.pending})</TabsTrigger>
                        <TabsTrigger value="approved">Approved ({stats.approved})</TabsTrigger>
                        <TabsTrigger value="rejected">Rejected ({stats.rejected})</TabsTrigger>
                    </TabsList>

                    <TabsContent value={filter} className="space-y-4">
                        {filteredReviews.length === 0 ? (
                            <Card className="border-dashed">
                                <CardContent className="py-12 text-center text-slate-500">
                                    No reviews found in this category
                                </CardContent>
                            </Card>
                        ) : (
                            filteredReviews.map((review) => (
                                <motion.div
                                    key={review.id}
                                    initial={{ opacity: 0, scale: 0.98 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                >
                                    <Card className="border shadow-sm hover:shadow-md transition-shadow">
                                        <CardContent className="pt-6">
                                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <p className="font-semibold text-lg">{review.customer_name}</p>
                                                        {renderStars(review.rating)}
                                                        <Badge variant={
                                                            review.status === 'approved' ? 'default' :
                                                                review.status === 'pending' ? 'secondary' :
                                                                    'destructive'
                                                        }>
                                                            {review.status === 'approved' ? 'Approved' :
                                                                review.status === 'pending' ? 'Pending' : 'Rejected'}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-xs text-slate-500 mb-3">
                                                        {new Date(review.created_at).toLocaleDateString("en-US", {
                                                            year: 'numeric',
                                                            month: 'long',
                                                            day: 'numeric'
                                                        })}
                                                        {review.customer_email && ` • ${review.customer_email}`}
                                                    </p>
                                                    {review.title && (
                                                        <p className="font-medium text-slate-700 mb-2">{review.title}</p>
                                                    )}
                                                    <p className="text-slate-600 leading-relaxed max-w-2xl">{review.comment}</p>
                                                </div>

                                                <div className="flex items-center gap-2 md:self-start">
                                                    {review.status !== 'approved' && (
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="gap-2 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                                                            onClick={() => handleApprove(review.id)}
                                                        >
                                                            <CheckCircle className="w-4 h-4" />
                                                            Approve
                                                        </Button>
                                                    )}
                                                    {review.status !== 'rejected' && (
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                                                            onClick={() => handleReject(review.id)}
                                                        >
                                                            <XCircle className="w-4 h-4" />
                                                            Reject
                                                        </Button>
                                                    )}
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="text-slate-400 hover:text-red-600"
                                                        onClick={() => handleDelete(review.id)}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))
                        )}
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}

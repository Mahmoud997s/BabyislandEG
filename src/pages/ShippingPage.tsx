import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Truck, Clock, MapPin } from "lucide-react";

export default function ShippingPage() {
    const { t } = useTranslation();
    // Assuming simple placeholder text or using existing translation keys if available
    // If not, we fall back to hardcoded Arabic as requested "Arabic first"

    return (
        <Layout>
            <section className="bg-primary/5 py-12 lg:py-16 text-center">
                <div className="container-main max-w-4xl">
                    <motion.h1
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-3xl lg:text-4xl font-bold mb-4 text-primary"
                    >
                        سياسة الشحن والتوصيل
                    </motion.h1>
                    <p className="text-muted-foreground">تعرف على مناطق التوصيل، التكلفة، والوقت المتوقع</p>
                </div>
            </section>

            <section className="py-16 bg-background">
                <div className="container-main max-w-3xl space-y-12">

                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="flex gap-4"
                    >
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            <Clock className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold mb-2">مدة التوصيل</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                نقوم بتوصيل جميع الطلبات خلال 3-5 أيام عمل في القاهرة والجيزة، و 5-7 أيام عمل للمحافظات الأخرى.
                                يتم تأكيد الطلب خلال 24 ساعة من إتمامه عبر الموقع.
                            </p>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="flex gap-4"
                    >
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            <Truck className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold mb-2">تكلفة الشحن</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                الشحن مجاني لجميع الطلبات التي تزيد قيمتها عن 5000 جنيه مصري.
                                للطلبات الأقل من ذلك، يتم احتساب مصاريف شحن ثابتة 50 جنيه للقاهرة والجيزة، و 80 جنيه للمحافظات.
                            </p>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="flex gap-4"
                    >
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            <MapPin className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold mb-2">مناطق التغطية</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                نقوم بالتوصيل لجميع محافظات جمهورية مصر العربية. في حالة المناطق النائية قد يستغرق التوصيل وقتاً إضافياً.
                            </p>
                        </div>
                    </motion.div>

                    <div className="pt-8 border-t text-center">
                        <p className="text-sm text-muted-foreground mb-4">
                            هل لديك استفسار آخر بخصوص الشحنة؟
                        </p>
                        <Button asChild variant="default">
                            <Link to="/contact">تواصل معنا</Link>
                        </Button>
                    </div>
                </div>
            </section>
        </Layout>
    );
}

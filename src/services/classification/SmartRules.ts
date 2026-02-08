
export interface SmartRule {
    id: string;
    keywords: string[];
    weakKeywords?: string[];
    negative?: string[];
    weight: number;
}

export const SMART_RULES: Record<string, SmartRule> = {
    'baby-care': {
        id: 'baby-care',
        keywords: [
            'diaper', 'wipes', 'cream', 'lotion', 'oil', 'shampoo', 'soap', 'bath', 'grooming',
            'thermometer', 'aspirator', 'health', 'monitor', 'safety', 'gate', 'lock',
            'potty', 'training', 'step', 'stool', 'toothbrush', 'paste', 'nail', 'clipper',
            'حفاضات', 'مناديل', 'كريم', 'لوشن', 'زيت', 'شامبو', 'صابون', 'استحمام', 'عناية',
            'ميزان حرارة', 'شفاط', 'صحة', 'مراقبة', 'أمان', 'بوابة', 'قفل',
            'بوثي', 'تدريب', 'كرسي', 'فرشاة', 'عجينة', 'مقص', 'أظافر',
            'towel', 'washcloth', 'sponge', 'rinser', 'tub', 'stand', 'mat', 'visor',
            'منشفة', 'ليفة', 'إسفنجة', 'حوض', 'مسند', 'سجادة', 'قبعة'
        ],
        negative: ['toy', 'doll', 'clothes', 'dress', 'block'],
        weight: 10
    },
    'strollers-gear': {
        id: 'strollers-gear',
        keywords: [
            'stroller', 'pram', 'pushchair', 'buggy', 'travel system', 'bassinet', 'carrycot',
            'car seat', 'booster', 'base', 'adapter', 'carrier', 'wrap', 'sling', 'backpack',
            'diaper bag', 'changing bag', 'organizer', 'holder', 'hook', 'footmuff', 'rain cover',
            'sunshade', 'net', 'mosquito', 'parasol', 'umbrella', 'wheel', 'board',
            'عربة', 'عربية', 'مستلزمات', 'شنطة', 'مقعد سيارة', 'كارسيت', 'بوستر', 'قاعدة',
            'شيالة', 'حمالة', 'حقيبة', 'منظم', 'حامل', 'خطاف', 'غطاء مطر', 'ناموسية', 'شمسية'
        ],
        weakKeywords: ['travel', 'outdoor', 'walk', 'ride'],
        weight: 10
    },
    'feeding': {
        id: 'feeding',
        keywords: [
            'bottle', 'nipple', 'teat', 'pacifier', 'soother', 'dummy', 'clip', 'holder',
            'breast pump', 'nursing', 'pad', 'shield', 'milk', 'storage', 'bag', 'container',
            'formula', 'food', 'cereal', 'snack', 'pouch', 'puree', 'biscuit', 'cookie',
            'high chair', 'booster seat', 'bib', 'burp cloth', 'placemat', 'plate', 'bowl',
            'spoon', 'fork', 'cup', 'sippy', 'straw', 'trainer', 'sterilizer', 'warmer',
            'blender', 'steamer', 'processor', 'maker', 'drying rack', 'brush', 'cleaning',
            'biberon', 'feeding', 'رضاعة', 'ببرونة', 'حلمة', 'لهاية', 'تيتينا', 'مشبك',
            'شفاط ثدي', 'صدر', 'رضاغة', 'حليب', 'تخزين', 'كيس', 'علبة', 'طعام', 'سيريلاك',
            'وجبة', 'بسكويت', 'كراسي طعام', 'كرسي طعام', 'مريلة', 'مريول', 'طبق', 'صحن', 'زبدية',
            'ملعقة', 'شوكة', 'كوب', 'كأس', 'شفاطة', 'معقم', 'سخان', 'خلاط', 'محضر طعام',
            'مجفف', 'فرشاة تنظيف'
        ],
        weight: 10
    },
    'toys': {
        id: 'toys',
        keywords: [
            'toy', 'game', 'puzzle', 'doll', 'action figure', 'playset', 'building', 'block',
            'lego', 'soft toy', 'plush', 'stuffed', 'teddy', 'bear', 'animal', 'musical',
            'instrument', 'car', 'truck', 'train', 'vehicle', 'ball', 'activity', 'center',
            'gym', 'playmat', 'walker', 'rocker', 'bouncer', 'swing', 'jumper', 'sorter',
            'stacker', 'rattle', 'teether', 'bath toy', 'water', 'sand', 'outdoor', 'ride-on',
            'bike', 'trike', 'scooter', 'skate', 'helmet', 'pad', 'battery', 'remote',
            'لعبة', 'ألعاب', 'بازل', 'دمية', 'عروسة', 'شخصية', 'مكعبات', 'ليجو', 'دبدوب',
            'حيوان', 'موسيقى', 'سيارة', 'شاحنة', 'قطار', 'كرة', 'نشاط', 'مركز', 'جيم',
            'سجادة لعب', 'مشاية', 'هزاز', 'مرجيحة', 'نطاطة', 'خشخشة', 'عضاضة', 'ألعاب استحمام',
            'ماء', 'رمل', 'خارجي', 'ركوب', 'دراجة', 'سكوتر', 'خوذة', 'بطارية', 'ريموت'
        ],
        weakKeywords: ['fun', 'play', 'learn', 'educational'],
        weight: 10
    },
     'clothing': {
        id: 'clothing',
        keywords: [
            'clothing', 'clothes', 'wear', 'apparel', 'outfit', 'set', 'suit', 'dress',
            'skirt', 'shirt', 't-shirt', 'top', 'blouse', 'pants', 'trousers', 'jeans',
            'leggings', 'shorts', 'jacket', 'coat', 'vest', 'sweater', 'cardigan', 'hoodie',
            'jumper', 'sweatshirt', 'onesie', 'romper', 'bodysuit', 'jumpsuit', 'pajama',
            'sleepwear', 'robe', 'gown', 'nightgown', 'underwear', 'briefs', 'panties',
            'boxers', 'socks', 'tights', 'shoes', 'boots', 'booties', 'sandals', 'slippers', 'sneakers',
            'trainers', 'hat', 'cap', 'beanie', 'gloves', 'mittens', 'scarf', 'swimwear',
            'swimsuit', 'bikini', 'trunks', 'costume', 'uniform',
            'ملابس', 'لبس', 'زي', 'طقم', 'بدلة', 'فستان', 'تنورة', 'جيب', 'قميص', 'تيشرت',
            'بلوزة', 'بنطلون', 'جينز', 'ليقنز', 'شورت', 'جاكيت', 'معطف', 'بالطو', 'فيست',
            'بلوفر', 'سويت شيرت', 'هودي', 'سالوبيت', 'بربتوز', 'بيجامة', 'ملابس نوم', 'روب',
            'ملابس داخلية', 'كلسون', 'بوكسر', 'شراب', 'جوارب', 'كولون', 'حذاء', 'جزمة',
            'صندل', 'شبشب', 'كوتشي', 'قبعة', 'طاقية', 'قفاز', 'جوانتي', 'كوفية', 'مايوه',
            'ملابس سباحة', 'تنكري', 'يونيفورم'
        ],
        negative: ['doll', 'toy'],
        weight: 10
    },
    'maternity': {
        id: 'maternity',
        keywords: [
            'maternity', 'pregnancy', 'pregnant', 'nursing', 'breastfeeding', 'mom', 'mum',
            'mother', 'postpartum', 'hospital bag', 'belly', 'support', 'belt', 'band',
            'pillow', 'bra', 'underwear', 'shapewear', 'dress', 'tops',
            'pants', 'jeans', 'leggings', 'cream', 'oil', 'lotion', 'stretch mark', 'nipple',
            'care', 'pad', 'shield', 'supplement', 'vitamin', 'tea',
            'أمام', 'أمومة', 'حمل', 'حامل', 'رضاعة', 'طبيعية', 'أم', 'ماما', 'نفاس',
            'شنطة الولادة', 'بطن', 'دعم', 'حزام', 'مشد', 'وسادة', 'مخدة', 'حمالة صدر',
            'توب', 'بنطلون', 'جينز', 'ليقنز', 'كريم', 'زيت', 'لوشن', 'علامات تمدد',
            'تشققات', 'حلمة', 'عناية', 'قطن', 'مكمل', 'فيتامين', 'شاي'
        ],
        weight: 10
    },
    'nursery': {
        id: 'nursery',
        keywords: [
            'nursery', 'room', 'furniture', 'decor', 'bed', 'crib', 'cot', 'cradle',
            'bassinet', 'mattress', 'sheet', 'bedding', 'blanket', 'comforter', 'quilt',
            'pillow', 'bumper', 'mobile', 'canopy', 'net', 'curtain', 'rug', 'carpet',
            'mat', 'lamp', 'light', 'nightlight', 'storage', 'organizer', 'box', 'basket',
            'bin', 'chest', 'wardrobe', 'closet', 'hanger', 'shelf', 'table', 'chair',
            'sofa', 'beanbag', 'rocker', 'glider', 'ottoman', 'wallpaper', 'sticker', 'decal',
            'غرفة', 'نوم', 'أثاث', 'ديكور', 'سرير', 'مهد', 'مرتبة', 'ملاءة', 'مفرش',
            'بطانية', 'لحاف', 'وسادة', 'مخدة', 'ناموسية', 'ستارة', 'سجادة', 'مصباح',
            'إضاءة', 'وناسة', 'تخزين', 'منظم', 'صندوق', 'سلة', 'دولاب', 'خزانة', 'شماعة',
            'رف', 'طاولة', 'كرسي', 'كنبة', 'بين باج', 'هزاز', 'ورق حائط', 'ملصق'
        ],
        weight: 8
    },
    'bathing': {
        id: 'bathing',
        keywords: [
            'bath', 'bathing', 'tub', 'stand', 'seat', 'support', 'mat', 'non-slip',
            'thermometer', 'rinser', 'jug', 'cup', 'toy', 'storage', 'organizer', 'towel',
            'hooded', 'washcloth', 'sponge', 'mitt', 'robe', 'gown', 'shampoo', 'wash',
            'soap', 'bubble', 'oil', 'lotion', 'cream', 'powder', 'cologne', 'perfume',
            'brush', 'comb', 'manicure', 'clippers', 'scissors', 'aspirator',
            'استحمام', 'حمام', 'حوض', 'بانيو', 'مسند', 'كرسي', 'سجادة', 'مانع انزلاق',
            'ميزان حرارة', 'كوب', 'لعبة', 'تخزين', 'منظم', 'منشفة', 'بشكير', 'برنس',
            'ليفة', 'إسفنجة', 'روب', 'شامبو', 'غسول', 'صابون', 'رغوة', 'زيت', 'لوشن',
            'كريم', 'بودرة', 'كولونيا', 'عطر', 'فرشاة', 'مشط', 'مقص', 'أظافر', 'شفاط'
        ],
        weight: 9
    }
};

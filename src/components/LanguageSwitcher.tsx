import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';

export function LanguageSwitcher() {
    const { i18n } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const { locale } = useParams<{ locale: string }>();

    const currentLocale = locale || i18n.language || 'ar';
    const targetLocale = currentLocale === 'ar' ? 'en' : 'ar';

    const handleSwitch = () => {
        // Replace locale in current path
        const pathWithoutLocale = location.pathname.replace(/^\/(ar|en)/, '');
        const newPath = `/${targetLocale}${pathWithoutLocale || '/'}${location.search}`;

        // Save preference
        localStorage.setItem('locale', targetLocale);

        // Navigate
        navigate(newPath);
    };

    return (
        <Button
            variant="ghost"
            size="sm"
            onClick={handleSwitch}
            className="gap-1 px-2"
            title={currentLocale === 'ar' ? 'Switch to English' : 'التبديل للعربية'}
        >
            <Globe className="h-4 w-4" />
            <span className="text-xs font-medium">
                {currentLocale === 'ar' ? 'EN' : 'ع'}
            </span>
        </Button>
    );
}

export default LanguageSwitcher;

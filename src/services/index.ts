// Services barrel export
// Provides cleaner imports: import { productsService, authService } from '@/services'

export { analyticsService } from './analyticsService';
export { authService, type User } from './authService';
export { customersService } from './customersService';
export { discountsService } from './discountsService';
export { emailService } from './emailService';
export { flashSalesService } from './flashSalesService';
export { orderService, type Order } from './orderService'; // Removed OrderItem if not exported
export { productsService } from './productsService'; // Removed missing types
export { reviewsService } from './reviewsService';
export { rolesService } from './rolesService';
export { settingsService } from './settingsService';
export { storageService } from './storage';
export { wishlistService } from './wishlistService';

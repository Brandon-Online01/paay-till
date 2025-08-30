import { create } from 'zustand';
import type { MenuItem } from '../types';
import info from '../data/info.json';

/**
 * Load till configuration data from info.json
 */
const TILL_DATA = info.till;

/**
 * Extended menu item interface with badge information
 */
export interface MenuItemWithBadge extends MenuItem {
    /** Optional badge for special pricing or status */
    badge?: string | null;
}

/**
 * Interface for menu store state and actions
 */
interface MenuStore {
    /** Array of all menu items with badges */
    items: MenuItemWithBadge[];
    /** Array of product categories with counts */
    categories: Array<{
        id: string;
        name: string;
        icon: string;
        count: number;
    }>;

    // Actions
    /**
     * Get items filtered by category
     * @param category - Category ID to filter by, or 'all' for all items
     * @returns Array of filtered menu items
     */
    getItemsByCategory: (category: string) => MenuItemWithBadge[];

    /**
     * Search items by name or description
     * @param query - Search query string
     * @returns Array of matching menu items
     */
    searchItems: (query: string) => MenuItemWithBadge[];

    /**
     * Get a specific item by ID
     * @param id - Item ID to find
     * @returns Menu item or undefined if not found
     */
    getItemById: (id: string) => MenuItemWithBadge | undefined;
}

/**
 * Menu store for managing product catalog and categories
 * Loads data from info.json and provides search/filter functionality
 */
export const useMenuStore = create<MenuStore>((set, get) => {
    /**
     * Transform raw data from info.json to MenuItemWithBadge format
     * Validates data integrity and sets customizable flag for certain items
     */
    const items: MenuItemWithBadge[] = TILL_DATA.items
        .map((item, index) => {
            // Validate required fields
            if (!item?.id || !item?.name || typeof item?.price !== 'number') {
                console.warn(`Invalid menu item data at index ${index}:`, item);
                return null;
            }

            return {
                id: item.id,
                name: item.name,
                category: item.category,
                price: item.price,
                image: item.image,
                description: item.description,
                badge: item.badge,
                // Mark certain items as customizable (based on category or variants)
                customizable:
                    item.category === 'sandwiches' ||
                    item.category === 'beverages' ||
                    !!item.variants, // Mark as customizable if item has variants
            };
        })
        .filter(Boolean) as MenuItemWithBadge[]; // Filter out null items

    /**
 * Category icon mapping for dynamic category generation
 */
const categoryIconMap: Record<string, string> = {
    all: '🍽️',
    electronics: '📱',
    clothing: '👕',
    food: '🍕',
    beverages: '☕',
    toys: '🧸',
    tools: '🔧',
    home: '🏠',
    health: '💊',
    sports: '⚽',
    automotive: '🚗',
    books: '📚',
    office: '📝',
    pet: '🐕',
    baby: '👶',
    // Add more default icons as needed
};

/**
 * Generate categories dynamically from actual product data
 * Only includes categories that have products and assigns appropriate icons
 */
const generateDynamicCategories = (items: MenuItemWithBadge[]): MenuStore['categories'] => {
    const categoryMap = new Map<string, number>();
    
    // Count items in each category
    items.forEach((item) => {
        if (item.category) {
            categoryMap.set(item.category, (categoryMap.get(item.category) || 0) + 1);
        }
    });

    // Create categories array with proper naming and icons
    const dynamicCategories: MenuStore['categories'] = [];
    
    // Always add "All Items" category first
    dynamicCategories.push({
        id: 'all',
        name: 'All Items',
        icon: categoryIconMap.all || '🍽️',
        count: items.length,
    });

    // Add categories that have items
    for (const [categoryId, count] of categoryMap.entries()) {
        if (count > 0) {
            // Generate a proper display name from category ID
            const displayName = categoryId
                .split(/[-_]/)
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ');

            dynamicCategories.push({
                id: categoryId,
                name: displayName,
                icon: categoryIconMap[categoryId] || '📦', // Default icon if not mapped
                count,
            });
        }
    }

    return dynamicCategories;
};

// Generate categories dynamically from products
const categories = generateDynamicCategories(items);

    return {
        items,
        categories,

        /**
         * Get items filtered by category with validation
         */
        getItemsByCategory: (category: string) => {
            // Validate input
            if (typeof category !== 'string') {
                console.error('Invalid category parameter:', category);
                return [];
            }

            try {
                const items = get().items;
                if (category === 'all') {
                    return items;
                }
                return items.filter(
                    (item) =>
                        item?.category === category &&
                        item?.id &&
                        item?.name &&
                        typeof item?.price === 'number'
                );
            } catch (error) {
                console.error('Error filtering items by category:', error);
                return [];
            }
        },

        /**
         * Search items by name or description with validation
         */
        searchItems: (query: string) => {
            // Validate input
            if (typeof query !== 'string') {
                console.error('Invalid search query:', query);
                return [];
            }

            try {
                const items = get().items;
                const trimmedQuery = query.trim();

                if (!trimmedQuery) {
                    return items;
                }

                const lowerQuery = trimmedQuery.toLowerCase();

                return items.filter(
                    (item) =>
                        // Validate item has required properties
                        item?.id &&
                        item?.name &&
                        typeof item?.price === 'number' &&
                        (item.name.toLowerCase().includes(lowerQuery) ||
                            item.description
                                ?.toLowerCase()
                                .includes(lowerQuery))
                );
            } catch (error) {
                console.error('Error searching items:', error);
                return [];
            }
        },

        /**
         * Get a specific item by ID with validation
         */
        getItemById: (id: string) => {
            // Validate input
            if (typeof id !== 'string' || !id.trim()) {
                console.error('Invalid item ID:', id);
                return undefined;
            }

            try {
                return get().items.find(
                    (item) =>
                        item?.id === id &&
                        item?.name &&
                        typeof item?.price === 'number'
                );
            } catch (error) {
                console.error('Error finding item by ID:', error);
                return undefined;
            }
        },
    };
});

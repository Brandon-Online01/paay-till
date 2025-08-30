#!/usr/bin/env node

/**
 * Direct SQLite Migration Script
 * Uses better-sqlite3 directly to create product tables
 */

const Database = require('better-sqlite3');
const path = require('path');

function runProductMigration() {
    console.log('🔄 Starting direct product migration...');
    
    try {
        // Connect to the database file
        const dbPath = path.join(__dirname, '../inventory.db');
        console.log('📊 Connecting to database:', dbPath);
        
        const db = new Database(dbPath);
        
        console.log('✅ Database connected successfully');
        
        // Check if products table exists
        const tableExists = db.prepare(
            "SELECT name FROM sqlite_master WHERE type='table' AND name='products'"
        ).get();
        
        if (!tableExists) {
            console.log('📋 Creating products table...');
            
            // Create products table with all required columns
            db.exec(`
                CREATE TABLE products (
                    id TEXT PRIMARY KEY,
                    name TEXT NOT NULL,
                    category TEXT,
                    price REAL NOT NULL DEFAULT 0,
                    image TEXT,
                    description TEXT,
                    badge TEXT,
                    variants TEXT,
                    inStock INTEGER DEFAULT 1,
                    stockQuantity INTEGER DEFAULT 0,
                    barcode TEXT,
                    qrCode TEXT,
                    reorderQty INTEGER DEFAULT 10,
                    maxBuyQty INTEGER DEFAULT 100,
                    minBuyQty INTEGER DEFAULT 1,
                    resellerName TEXT,
                    brand TEXT,
                    information TEXT,
                    createdAt TEXT,
                    updatedAt TEXT
                )
            `);
            
            console.log('✅ Products table created');
        } else {
            console.log('📋 Products table exists, checking for missing columns...');
            
            // Get existing columns
            const columns = db.prepare("PRAGMA table_info(products)").all();
            const existingColumns = columns.map(col => col.name);
            
            console.log('   Existing columns:', existingColumns.join(', '));
            
            // Add missing columns
            const requiredColumns = [
                { name: 'barcode', type: 'TEXT' },
                { name: 'qrCode', type: 'TEXT' },
                { name: 'reorderQty', type: 'INTEGER DEFAULT 10' },
                { name: 'maxBuyQty', type: 'INTEGER DEFAULT 100' },
                { name: 'minBuyQty', type: 'INTEGER DEFAULT 1' },
                { name: 'resellerName', type: 'TEXT' },
                { name: 'brand', type: 'TEXT' },
                { name: 'information', type: 'TEXT' }
            ];
            
            for (const column of requiredColumns) {
                if (!existingColumns.includes(column.name)) {
                    try {
                        db.exec(`ALTER TABLE products ADD COLUMN ${column.name} ${column.type}`);
                        console.log(`   ✅ Added column: ${column.name}`);
                    } catch (error) {
                        if (error.message.includes('duplicate column')) {
                            console.log(`   ✓ Column already exists: ${column.name}`);
                        } else {
                            console.warn(`   ⚠️ Failed to add column ${column.name}:`, error.message);
                        }
                    }
                } else {
                    console.log(`   ✓ Column exists: ${column.name}`);
                }
            }
        }
        
        // Create indexes for better performance
        console.log('🔍 Creating database indexes...');
        const indexes = [
            'CREATE INDEX IF NOT EXISTS idx_products_category ON products(category)',
            'CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand)',
            'CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode)',
            'CREATE INDEX IF NOT EXISTS idx_products_name ON products(name)',
            'CREATE INDEX IF NOT EXISTS idx_products_instock ON products(inStock)',
            'CREATE INDEX IF NOT EXISTS idx_products_reorder ON products(stockQuantity, reorderQty)'
        ];
        
        for (const indexSQL of indexes) {
            try {
                db.exec(indexSQL);
                console.log(`   ✅ Created index`);
            } catch (error) {
                console.log(`   ✓ Index already exists`);
            }
        }
        
        // Create transactions table if needed
        console.log('📋 Ensuring transactions table exists...');
        db.exec(`
            CREATE TABLE IF NOT EXISTS transactions (
                id TEXT PRIMARY KEY,
                total REAL NOT NULL DEFAULT 0,
                subtotal REAL NOT NULL DEFAULT 0,
                discount REAL DEFAULT 0,
                tax REAL DEFAULT 0,
                paymentMethod TEXT,
                status TEXT DEFAULT 'pending',
                receiptNumber TEXT,
                customerId TEXT,
                notes TEXT,
                createdAt TEXT,
                updatedAt TEXT
            )
        `);
        
        // Create transaction_items table if needed
        console.log('📋 Ensuring transaction_items table exists...');
        db.exec(`
            CREATE TABLE IF NOT EXISTS transaction_items (
                id TEXT PRIMARY KEY,
                transactionId TEXT NOT NULL,
                productId TEXT NOT NULL,
                quantity INTEGER NOT NULL DEFAULT 1,
                unitPrice REAL NOT NULL DEFAULT 0,
                totalPrice REAL NOT NULL DEFAULT 0,
                variant TEXT,
                FOREIGN KEY (transactionId) REFERENCES transactions(id),
                FOREIGN KEY (productId) REFERENCES products(id)
            )
        `);
        
        // Create migrations tracking table
        console.log('📋 Setting up migration tracking...');
        db.exec(`
            CREATE TABLE IF NOT EXISTS migrations (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                executed_at TEXT DEFAULT CURRENT_TIMESTAMP
            )
        `);
        
        // Mark migration as complete
        const migrationId = 'products_enhanced_schema_v1';
        db.prepare('INSERT OR REPLACE INTO migrations (id, name) VALUES (?, ?)')
          .run(migrationId, 'Enhanced product schema with barcode, QR, reorder fields');
        
        // Get final product count
        const countResult = db.prepare("SELECT COUNT(*) as count FROM products").get();
        console.log(`📦 Total products in database: ${countResult?.count || 0}`);
        
        // Get transaction count
        const transactionCount = db.prepare("SELECT COUNT(*) as count FROM transactions").get();
        console.log(`💳 Total transactions in database: ${transactionCount?.count || 0}`);
        
        // Show table schema
        console.log('\n📋 Products table schema:');
        const finalColumns = db.prepare("PRAGMA table_info(products)").all();
        finalColumns.forEach(col => {
            const nullable = col.notnull ? 'NOT NULL' : 'NULLABLE';
            const defaultVal = col.dflt_value ? ` DEFAULT ${col.dflt_value}` : '';
            console.log(`   ${col.name}: ${col.type} ${nullable}${defaultVal}`);
        });
        
        // Show completed migrations
        console.log('\n📋 Completed migrations:');
        const migrations = db.prepare("SELECT * FROM migrations ORDER BY executed_at").all();
        migrations.forEach(migration => {
            console.log(`   ✅ ${migration.id}: ${migration.name}`);
        });
        
        db.close();
        
        console.log('\n✅ Product migration completed successfully!');
        console.log('🎉 Database is ready for use!');
        
        return true;
        
    } catch (error) {
        console.error('❌ Product migration failed:', error);
        console.error('\nError details:', {
            message: error.message,
            code: error.code
        });
        return false;
    }
}

// Main execution
if (require.main === module) {
    const success = runProductMigration();
    if (success) {
        console.log('\n✅ Migration script completed successfully');
        process.exit(0);
    } else {
        console.error('\n❌ Migration script failed');
        process.exit(1);
    }
}

module.exports = { runProductMigration };

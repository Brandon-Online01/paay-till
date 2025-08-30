import * as Print from 'expo-print';
import { shareAsync } from 'expo-sharing';
import { Platform } from 'react-native';

/**
 * Print Utility for Receipts and Document Printing
 * Provides printing functionality for Android and iOS (AirPrint)
 */

export interface PrintStatus {
    isAvailable: boolean;
    selectedPrinter: Print.Printer | null;
    lastError: string | null;
}

export interface ReceiptData {
    orderNumber: string;
    date: string;
    items: {
        name: string;
        quantity: number;
        price: number;
        total: number;
    }[];
    subtotal: number;
    tax: number;
    total: number;
    paymentMethod: string;
    cashier: string;
    businessName: string;
    businessAddress?: string;
    businessPhone?: string;
}

export class PrintUtils {
    private static selectedPrinter: Print.Printer | null = null;
    private static lastError: string | null = null;

    /**
     * Initialize print utilities and check availability
     */
    static async initialize(): Promise<PrintStatus> {
        try {
            // Check if printing is available on the platform
            const isAvailable = Platform.OS === 'ios' || Platform.OS === 'android';
            
            if (!isAvailable) {
                this.lastError = 'Printing not supported on this platform';
                return { isAvailable: false, selectedPrinter: null, lastError: this.lastError };
            }

            this.lastError = null;
            console.log('🖨️ Print utilities initialized successfully');
            
            return {
                isAvailable,
                selectedPrinter: this.selectedPrinter,
                lastError: null
            };
        } catch (error) {
            this.lastError = error instanceof Error ? error.message : 'Unknown print initialization error';
            console.error('❌ Print initialization failed:', error);
            return { isAvailable: false, selectedPrinter: null, lastError: this.lastError };
        }
    }

    /**
     * Select a printer (iOS only)
     */
    static async selectPrinter(): Promise<Print.Printer | null> {
        try {
            if (Platform.OS !== 'ios') {
                this.lastError = 'Printer selection only available on iOS';
                return null;
            }

            const printer = await Print.selectPrinterAsync();
            this.selectedPrinter = printer;
            this.lastError = null;
            console.log(`🖨️ Printer selected: ${printer.name}`);
            return printer;
        } catch (error) {
            this.lastError = error instanceof Error ? error.message : 'Failed to select printer';
            console.error('❌ Printer selection failed:', error);
            return null;
        }
    }

    /**
     * Print receipt from transaction data
     */
    static async printReceipt(receiptData: ReceiptData): Promise<boolean> {
        try {
            const html = this.generateReceiptHTML(receiptData);
            
            const printOptions: Print.PrintOptions = {
                html,
                width: 226, // 58mm thermal printer width in pixels (approximate)
                orientation: Print.Orientation.portrait,
            };

            // Add printer URL if iOS and printer selected
            if (Platform.OS === 'ios' && this.selectedPrinter) {
                printOptions.printerUrl = this.selectedPrinter.url;
            }

            await Print.printAsync(printOptions);
            this.lastError = null;
            console.log('✅ Receipt printed successfully');
            return true;
        } catch (error) {
            this.lastError = error instanceof Error ? error.message : 'Failed to print receipt';
            console.error('❌ Receipt printing failed:', error);
            return false;
        }
    }

    /**
     * Generate PDF receipt and share
     */
    static async generateAndShareReceipt(receiptData: ReceiptData): Promise<string | null> {
        try {
            const html = this.generateReceiptHTML(receiptData);
            
            const { uri } = await Print.printToFileAsync({
                html,
                width: 226,
                base64: false
            });

            await shareAsync(uri, { 
                UTI: '.pdf', 
                mimeType: 'application/pdf',
                dialogTitle: `Receipt ${receiptData.orderNumber}`
            });

            this.lastError = null;
            console.log('✅ Receipt PDF generated and shared');
            return uri;
        } catch (error) {
            this.lastError = error instanceof Error ? error.message : 'Failed to generate receipt PDF';
            console.error('❌ Receipt PDF generation failed:', error);
            return null;
        }
    }

    /**
     * Print custom HTML content
     */
    static async printHTML(html: string, options?: Partial<Print.PrintOptions>): Promise<boolean> {
        try {
            const printOptions: Print.PrintOptions = {
                html,
                orientation: Print.Orientation.portrait,
                ...options
            };

            if (Platform.OS === 'ios' && this.selectedPrinter) {
                printOptions.printerUrl = this.selectedPrinter.url;
            }

            await Print.printAsync(printOptions);
            this.lastError = null;
            console.log('✅ Custom HTML printed successfully');
            return true;
        } catch (error) {
            this.lastError = error instanceof Error ? error.message : 'Failed to print HTML';
            console.error('❌ HTML printing failed:', error);
            return false;
        }
    }

    /**
     * Generate receipt HTML template
     */
    private static generateReceiptHTML(data: ReceiptData): string {
        const itemsHTML = data.items.map(item => `
            <tr>
                <td style="padding: 2px 0; font-size: 10px;">${item.name}</td>
                <td style="padding: 2px 0; text-align: center; font-size: 10px;">${item.quantity}</td>
                <td style="padding: 2px 0; text-align: right; font-size: 10px;">R${item.price.toFixed(2)}</td>
                <td style="padding: 2px 0; text-align: right; font-size: 10px; font-weight: bold;">R${item.total.toFixed(2)}</td>
            </tr>
        `).join('');

        return `
            <!DOCTYPE html>
            <html>
            <head>
                <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
                <style>
                    body {
                        font-family: 'Courier New', monospace;
                        margin: 0;
                        padding: 10px;
                        font-size: 11px;
                        line-height: 1.2;
                        color: #000;
                        background: #fff;
                    }
                    .header {
                        text-align: center;
                        border-bottom: 1px dashed #000;
                        padding-bottom: 8px;
                        margin-bottom: 8px;
                    }
                    .business-name {
                        font-size: 14px;
                        font-weight: bold;
                        margin-bottom: 4px;
                    }
                    .business-info {
                        font-size: 9px;
                        margin-bottom: 2px;
                    }
                    .receipt-info {
                        margin-bottom: 8px;
                        border-bottom: 1px dashed #000;
                        padding-bottom: 8px;
                    }
                    .items-table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-bottom: 8px;
                    }
                    .items-header {
                        border-bottom: 1px solid #000;
                        padding-bottom: 2px;
                        margin-bottom: 4px;
                    }
                    .totals {
                        border-top: 1px dashed #000;
                        padding-top: 8px;
                        margin-top: 8px;
                    }
                    .total-row {
                        display: flex;
                        justify-content: space-between;
                        margin-bottom: 2px;
                    }
                    .final-total {
                        font-weight: bold;
                        font-size: 12px;
                        border-top: 1px solid #000;
                        padding-top: 4px;
                        margin-top: 4px;
                    }
                    .footer {
                        text-align: center;
                        margin-top: 12px;
                        border-top: 1px dashed #000;
                        padding-top: 8px;
                        font-size: 9px;
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <div class="business-name">${data.businessName}</div>
                    ${data.businessAddress ? `<div class="business-info">${data.businessAddress}</div>` : ''}
                    ${data.businessPhone ? `<div class="business-info">${data.businessPhone}</div>` : ''}
                </div>
                
                <div class="receipt-info">
                    <div><strong>Receipt #:</strong> ${data.orderNumber}</div>
                    <div><strong>Date:</strong> ${data.date}</div>
                    <div><strong>Cashier:</strong> ${data.cashier}</div>
                </div>
                
                <table class="items-table">
                    <thead class="items-header">
                        <tr>
                            <th style="text-align: left; font-size: 10px;">Item</th>
                            <th style="text-align: center; font-size: 10px;">Qty</th>
                            <th style="text-align: right; font-size: 10px;">Price</th>
                            <th style="text-align: right; font-size: 10px;">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemsHTML}
                    </tbody>
                </table>
                
                <div class="totals">
                    <div class="total-row">
                        <span>Subtotal:</span>
                        <span>R${data.subtotal.toFixed(2)}</span>
                    </div>
                    <div class="total-row">
                        <span>Tax:</span>
                        <span>R${data.tax.toFixed(2)}</span>
                    </div>
                    <div class="total-row final-total">
                        <span>TOTAL:</span>
                        <span>R${data.total.toFixed(2)}</span>
                    </div>
                    <div class="total-row" style="margin-top: 8px;">
                        <span>Payment Method:</span>
                        <span>${data.paymentMethod}</span>
                    </div>
                </div>
                
                <div class="footer">
                    <div>Thank you for your business!</div>
                    <div>Visit us again soon</div>
                </div>
            </body>
            </html>
        `;
    }

    /**
     * Get current print status
     */
    static getStatus(): PrintStatus {
        return {
            isAvailable: Platform.OS === 'ios' || Platform.OS === 'android',
            selectedPrinter: this.selectedPrinter,
            lastError: this.lastError
        };
    }

    /**
     * Get selected printer info
     */
    static getSelectedPrinter(): Print.Printer | null {
        return this.selectedPrinter;
    }

    /**
     * Clear last error
     */
    static clearError(): void {
        this.lastError = null;
    }

    /**
     * Format status for logging
     */
    static formatStatusForLogging(): string {
        const status = this.getStatus();
        const printer = status.selectedPrinter ? status.selectedPrinter.name : 'None selected';
        const error = status.lastError || 'None';
        
        return `🖨️ Print: ${status.isAvailable ? 'Available' : 'Unavailable'} | Printer: ${printer} | Error: ${error}`;
    }
}

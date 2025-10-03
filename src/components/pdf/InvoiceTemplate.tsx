// src/components/pdf/InvoiceTemplate.tsx
import React from 'react';
import { Page, Text, View, StyleSheet, Image, Font, Svg, Path } from '@react-pdf/renderer';
import { SanitizedInvoice, SanitizedUser } from '@/lib/pdf-utils';

// --- Font Registration (FIXED) ---
// Switched to HTTPS to prevent "Mixed Content" errors in production.
Font.register({
  family: 'Roboto',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/roboto/v16/zN7GBFwfMP4uA6AR0HCoLQ.ttf' },
    { src: 'https://fonts.gstatic.com/s/roboto/v16/bdHGHleUa-ndQCOrdpfxfw.ttf', fontWeight: 'bold' },
  ]
});

// --- SVG Icon Components ---
const LocationIcon = () => (
    <Svg width="10" height="10" viewBox="0 0 24 24" style={{ marginRight: 5, marginTop: 2 }}>
        <Path fill="#666666" d="M12 0C7.31 0 3.5 3.81 3.5 8.5c0 5.25 8.5 15.5 8.5 15.5s8.5-10.25 8.5-15.5C20.5 3.81 16.69 0 12 0zm0 11.5c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z"/>
    </Svg>
);

const PhoneIcon = () => (
    <Svg width="10" height="10" viewBox="0 0 24 24" style={{ marginRight: 5, marginTop: 2 }}>
        <Path fill="#666666" d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
    </Svg>
);

const EmailIcon = () => (
    <Svg width="10" height="10" viewBox="0 0 24 24" style={{ marginRight: 5, marginTop: 2 }}>
        <Path fill="#666666" d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
    </Svg>
);


// --- Modern Stylesheet ---
const styles = StyleSheet.create({
    page: {
        fontFamily: 'Roboto',
        fontSize: 10,
        padding: 30,
        backgroundColor: '#F7F8FA',
        color: '#333333',
    },
    watermark: {
        position: 'absolute',
        top: '40%',
        left: '25%',
        width: '50%',
        height: '36%',
        opacity: 0.04,
    },
    // Header Section
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 15,
        borderBottom: '2px solid #1A237E',
        paddingBottom: 10,
    },
    headerLeft: {
        flex: 3, // Takes more space
        textAlign: 'left',
    },
    companyName: {
        fontSize: 34,
        fontWeight: 'bold',
        color: '#1A237E',
        fontFamily: 'Roboto',
        marginBottom: 8,
    },
    companyDetails: {
        fontSize: 10,
        color: '#666666',
        lineHeight: 1.5,
    },
    contactRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 3,
    },
    contactGroup: {
        flexDirection: 'row',
        marginTop: 5,
    },
    headerRight: {
        flex: 1, // Takes less space
        textAlign: 'right',
        marginTop: 8,
    },
    invoiceTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333333',
        fontFamily: 'Roboto',
        letterSpacing: 1,
    },
    // Billing & Invoice Info Section
    detailsSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 15,
        backgroundColor: '#FFFFFF',
        paddingTop: 15,
        paddingBottom: 15,
        paddingHorizontal: 20,
        borderRadius: 8,
    },
    billedTo: {
        flex: 1,
        paddingRight: 20,
    },
    invoiceInfo: {
        flex: 1,
        alignItems: 'flex-end',
    },
    sectionTitle: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#007BFF',
        marginBottom: 10,
        fontFamily: 'Roboto',
        textTransform: 'uppercase',
    },
    clientName: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 5,
        fontFamily: 'Roboto',
        color: '#1A237E',
    },
    clientDetails: {
        fontSize: 10,
        color: '#444444',
        lineHeight: 1.5,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        fontSize: 10,
        marginBottom: 5,
        width: 220,
    },
    infoLabel: {
        color: '#555555',
    },
    infoValue: {
        fontWeight: 'bold',
        fontFamily: 'Roboto',
        color: '#333333',
    },
    // Line Items Table
    table: {
        width: '100%',
        marginBottom: 20,
        borderRadius: 8,
        overflow: 'hidden',
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#1A237E',
        padding: 10,
        color: 'white',
    },
    tableRow: {
        flexDirection: 'row',
        borderBottom: '1px solid #EAEAEA',
        padding: 10,
        backgroundColor: '#FFFFFF',
    },
    tableCell: {
        fontSize: 10,
    },
    th: {
        fontSize: 10,
        fontWeight: 'bold',
        fontFamily: 'Roboto',
        textTransform: 'uppercase',
    },
    colItemNo: { width: '5%', textAlign: 'center' },
    colDescription: { width: '40%' },
    colHsn: { width: '15%', textAlign: 'center' },
    colQty: { width: '10%', textAlign: 'right' },
    colRate: { width: '15%', textAlign: 'right' },
    colAmount: { width: '15%', textAlign: 'right' },

    // Footer Section
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 40,
        right: 40,
        paddingBottom: 25,
    },
    paymentAndTotalSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
        alignItems: 'flex-start',
    },
    paymentDetails: {
        flex: 1.5,
        flexDirection: 'row',
    },
    paymentTextContainer: {
        marginRight: 20,
    },
    paymentLabel: {
        fontSize: 11,
        color: '#666666',
        lineHeight: 1.4,
    },
    paymentValue: {
        fontSize: 12,
        fontWeight: 'bold',
        fontFamily: 'Roboto',
    },
    qrCodeContainer: {
        alignItems: 'center',
    },
    qrCode: {
        width: 100,
        height: 100,
    },
    qrCodeLabel: {
        marginTop: 5,
        fontSize: 9,
        color: '#555555',
    },
    totalSection: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        padding: 15,
        borderRadius: 8,
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
        fontSize: 12,
    },
    grandTotalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
        paddingTop: 10,
        borderTop: '2px solid #333333',
    },
    grandTotalLabel: {
        fontSize: 18,
        fontWeight: 'bold',
        fontFamily: 'Roboto',
    },
    grandTotalValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#007BFF',
        fontFamily: 'Roboto',
    },
    greetingMessage: {
        borderTop: '1px solid #EAEAEA',
        paddingTop: 15,
        textAlign: 'center',
        fontSize: 11,
        color: '#888888',
        fontFamily: 'Roboto',
    },
});

type TemplateProps = {
  invoice: SanitizedInvoice;
  user: SanitizedUser;
};

export const InvoiceTemplate: React.FC<TemplateProps> = ({ invoice, user }) => {
  const subtotal = invoice.lineItems.reduce((acc, item) => acc + item.quantity * item.rate, 0);
  const discountAmount = subtotal * (invoice.discount / 100);
  const subtotalAfterDiscount = subtotal - discountAmount;
  const taxAmount = subtotalAfterDiscount * (invoice.taxRate / 100);
  const total = subtotalAfterDiscount + taxAmount + (invoice.previousDues || 0);

  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('en-GB');

  const headers = user.itemTableHeaders;

  return (
    <Page size="A4" style={styles.page}>
      {/* Watermark */}
      {user.companyLogoUrl && <Image src={user.companyLogoUrl} style={styles.watermark} />}

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
            <Text style={styles.companyName}>{user.companyName}</Text>
            <View style={styles.companyDetails}>
                <View style={styles.contactRow}>
                    <LocationIcon />
                    <Text style={{ flex: 1 }}>{user.companyAddress}</Text>
                </View>
                <View style={styles.contactGroup}>
                    <View style={[styles.contactRow, { marginRight: 15 }]}><PhoneIcon /><Text> {user.contactPhone}</Text></View>
                    <View style={styles.contactRow}><EmailIcon /><Text> {user.email}</Text></View>
                </View>
            </View>
        </View>
        <View style={styles.headerRight}>
            <Text style={styles.invoiceTitle}>INVOICE</Text>
        </View>
      </View>

      {/* Billing and Invoice Info */}
      <View style={styles.detailsSection}>
        <View style={styles.billedTo}>
          <Text style={styles.sectionTitle}>Bill To</Text>
          <Text style={styles.clientName}>{invoice.client.fullName}</Text>
          <Text style={styles.clientDetails}>
            {invoice.client.billingAddress}{'\n'}
            Phone: {invoice.client.phoneNumber}{'\n'}
            {/* FIX: Wrapped conditional string in a Text component to prevent layout errors. */}
            {invoice.client.clientGstin && <Text>GSTIN: {invoice.client.clientGstin}</Text>}
          </Text>
        </View>
        <View style={styles.invoiceInfo}>
          <View style={styles.infoRow}><Text style={styles.infoLabel}>Invoice Number:</Text><Text style={styles.infoValue}>{invoice.invoiceNumber}</Text></View>
          <View style={styles.infoRow}><Text style={styles.infoLabel}>Invoice Date:</Text><Text style={styles.infoValue}>{formatDate(invoice.invoiceDate)}</Text></View>
          {invoice.dueDate && <View style={styles.infoRow}><Text style={styles.infoLabel}>Due Date:</Text><Text style={styles.infoValue}>{formatDate(invoice.dueDate)}</Text></View>}
          {invoice.client.tradeName && <View style={styles.infoRow}><Text style={styles.infoLabel}>Trade Name:</Text><Text style={styles.infoValue}>{invoice.client.tradeName}</Text></View>}
          {invoice.client.clientPanNumber && <View style={styles.infoRow}><Text style={styles.infoLabel}>PAN:</Text><Text style={styles.infoValue}>{invoice.client.clientPanNumber}</Text></View>}
        </View>
      </View>

      {/* Line Items Table */}
      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={[styles.th, styles.colItemNo]}>{headers.itemNo}</Text>
          <Text style={[styles.th, styles.colDescription]}>{headers.description}</Text>
          <Text style={[styles.th, styles.colHsn]}>{headers.hsnCode}</Text>
          <Text style={[styles.th, styles.colQty]}>{headers.quantity}</Text>
          <Text style={[styles.th, styles.colRate]}>{headers.rate}</Text>
          <Text style={[styles.th, styles.colAmount]}>{headers.amount}</Text>
        </View>
        {invoice.lineItems.map((item, index) => (
          <View style={styles.tableRow} key={index} wrap={false}>
            <Text style={[styles.tableCell, styles.colItemNo]}>{index + 1}</Text>
            <Text style={[styles.tableCell, styles.colDescription]}>{item.description}</Text>
            <Text style={[styles.tableCell, styles.colHsn]}>{item.hsnCode}</Text>
            <Text style={[styles.tableCell, styles.colQty]}>{item.quantity}</Text>
            <Text style={[styles.tableCell, styles.colRate]}>{item.rate.toFixed(2)}</Text>
            <Text style={[styles.tableCell, styles.colAmount]}>{(item.quantity * item.rate).toFixed(2)}</Text>
          </View>
        ))}
      </View>

      {/* Summary and Totals (at the bottom) */}
      <View style={styles.footer} fixed>
        <View style={styles.paymentAndTotalSection}>
          <View style={styles.paymentDetails}>
              <View style={styles.paymentTextContainer}>
                  <Text style={styles.sectionTitle}>Payment Details</Text>
                  {user.paymentDetails.accountName && <Text style={styles.paymentValue}>{user.paymentDetails.accountName}</Text>}
                  {user.paymentDetails.bankName && <Text style={styles.paymentLabel}>Bank: {user.paymentDetails.bankName}</Text>}
                  {user.paymentDetails.accountNumber && <Text style={styles.paymentLabel}>A/C: {user.paymentDetails.accountNumber}</Text>}
                  {user.paymentDetails.ifscCode && <Text style={styles.paymentLabel}>IFSC: {user.paymentDetails.ifscCode}</Text>}
                  {user.paymentDetails.upiId && <Text style={styles.paymentLabel}>UPI ID: {user.paymentDetails.upiId}</Text>}
              </View>
              {user.paymentDetails.qrCodeUrl && (
                  <View style={styles.qrCodeContainer}>
                      <Image src={user.paymentDetails.qrCodeUrl} style={styles.qrCode} />
                      <Text style={styles.qrCodeLabel}>Scan to Pay</Text>
                  </View>
              )}
          </View>

          <View style={styles.totalSection}>
              <View style={styles.totalRow}><Text>Subtotal</Text><Text>Rs. {subtotal.toFixed(2)}</Text></View>
              {invoice.discount > 0 && <View style={styles.totalRow}><Text>Discount ({invoice.discount.toFixed(1)}%)</Text><Text>- Rs. {discountAmount.toFixed(2)}</Text></View>}
              {invoice.taxRate > 0 && <View style={styles.totalRow}><Text>Tax ({invoice.taxRate.toFixed(1)}%)</Text><Text>+ Rs. {taxAmount.toFixed(2)}</Text></View>}
              {invoice.previousDues > 0 && <View style={styles.totalRow}><Text>Previous Dues</Text><Text>+ Rs. {invoice.previousDues.toFixed(2)}</Text></View>}
              <View style={styles.grandTotalRow}>
                  <Text style={styles.grandTotalLabel}>Total</Text>
                  <Text style={styles.grandTotalValue}>Rs. {total.toFixed(2)}</Text>
              </View>
          </View>
        </View>
        <View style={styles.greetingMessage}>
            <Text>Thank you for your business!</Text>
        </View>
      </View>
    </Page>
  );
};
import jsPDF from 'jspdf';
import { Booking, Ticket } from '../api/bookings';
import { formatDate, formatTime, formatPrice } from './formatters';

/**
 * Generate a booking number if one doesn't exist
 */
const getBookingNumber = (booking: any): string => {
  if (booking.bookingNumber) {
    return booking.bookingNumber;
  }
  
  // If bookingNumber is missing, generate one based on the ID
  // Format: RB-00000{id} (e.g., RB-000034)
  return `RB-${booking.id.toString().padStart(6, '0')}`;
};

/**
 * Generates a clean, simple invoice-style PDF for a booking
 */
export const generateTicketPDF = async (
  ticketElementId: string, // We'll keep this parameter for compatibility but won't use it
  fileName: string = 'receipt.pdf',
  booking?: Booking // Add booking parameter to get data directly
): Promise<void> => {
  try {
    // If no booking is provided, stop the process
    if (!booking) {
      console.error('Booking data not provided for PDF generation');
      return;
    }
    
    // Get the main ticket (first passenger)
    const ticket = booking.tickets[0];
    if (!ticket) {
      console.error('No ticket data available in booking');
      return;
    }
    
    // Ensure we have a booking number (generate one if needed)
    const bookingNumber = getBookingNumber(booking);
    
    // Create new PDF document (A4 size)
    const pdf = new jsPDF({
      orientation: 'portrait', 
      unit: 'mm',
      format: 'a4'
    });
    
    // Add basic metadata
    pdf.setProperties({
      title: `Reçu de réservation - ${bookingNumber}`,
      subject: 'Reçu de réservation',
      author: 'RimBest Airways',
      creator: 'RimBest Airways'
    });
    
    // Set consistent text color
    pdf.setTextColor(70, 70, 70);
    
    // ======== HEADER ========
    // Company name
    pdf.setFontSize(24);
    pdf.setFont('helvetica', 'bold');
    pdf.text('RimBest Airways', 20, 20);
    
    // Subtitle
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Reçu de réservation', 20, 27);
    
    // Date and booking reference
    pdf.setFontSize(10);
    pdf.text(`Date d'émission: ${formatDate(booking.bookingDate)}`, 20, 35);
    pdf.text(`N° de réservation: ${bookingNumber}`, 20, 40);
    
    // Add separation line
    pdf.setDrawColor(200, 200, 200);
    pdf.setLineWidth(0.5);
    pdf.line(20, 45, 190, 45);
    
    // ======== CUSTOMER INFO ========
    // Customer title
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Informations du passager', 20, 55);
    
    // Customer details
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Nom: ${ticket.passengerName}`, 20, 63);
    pdf.text(`Email: ${ticket.passengerEmail}`, 20, 69);
    
    // ======== FLIGHT INFORMATION ========
    // Title
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Détails du vol', 20, 85);
    
    // Flight info table header
    pdf.setFillColor(240, 240, 240);
    pdf.rect(20, 90, 170, 10, 'F');
    
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Vol', 25, 97);
    pdf.text('De', 55, 97);
    pdf.text('À', 85, 97);
    pdf.text('Date', 115, 97);
    pdf.text('Départ', 145, 97);
    pdf.text('Arrivée', 170, 97);
    
    // Flight info table row
    pdf.setFont('helvetica', 'normal');
    pdf.text(ticket.flight.flightNumber, 25, 107);
    pdf.text(ticket.flight.departureCity, 55, 107);
    pdf.text(ticket.flight.arrivalCity, 85, 107);
    
    // Get just the date part
    const flightDate = formatDate(ticket.flight.departureTime).split(' ').slice(0, -1).join(' ');
    pdf.text(flightDate, 115, 107);
    
    pdf.text(formatTime(ticket.flight.departureTime), 145, 107);
    pdf.text(formatTime(ticket.flight.arrivalTime), 170, 107);
    
    // Add table borders
    pdf.setDrawColor(220, 220, 220);
    pdf.setLineWidth(0.3);
    pdf.rect(20, 90, 170, 10); // header
    pdf.rect(20, 100, 170, 12); // row
    
    pdf.line(50, 90, 50, 112); // vertical lines
    pdf.line(80, 90, 80, 112);
    pdf.line(110, 90, 110, 112);
    pdf.line(140, 90, 140, 112);
    pdf.line(165, 90, 165, 112);
    
    // ======== PASSENGER DETAILS ========
    // Title
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Détails du billet', 20, 130);
    
    // Table header
    pdf.setFillColor(240, 240, 240);
    pdf.rect(20, 135, 170, 10, 'F');
    
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Passager', 25, 142);
    pdf.text('Siège', 85, 142);
    pdf.text('Statut', 125, 142);
    pdf.text('Prix', 170, 142);
    
    // Table content
    pdf.setFont('helvetica', 'normal');
    pdf.text(ticket.passengerName, 25, 152);
    pdf.text(ticket.seatNumber || 'À assigner', 85, 152);
    pdf.text('Confirmé', 125, 152);
    pdf.text(formatPrice(ticket.price), 170, 152);
    
    // Add table borders
    pdf.rect(20, 135, 170, 10); // header
    pdf.rect(20, 145, 170, 12); // row
    
    // Vertical lines
    pdf.line(80, 135, 80, 157);
    pdf.line(120, 135, 120, 157);
    pdf.line(165, 135, 165, 157);
    
    // ======== PAYMENT SUMMARY ========
    // Title
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Résumé du paiement', 20, 175);
    
    // Payment details
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Sous-total', 130, 185);
    pdf.text(formatPrice(booking.totalPrice), 170, 185);
    
    pdf.text('Taxes', 130, 192);
    pdf.text('Incluses', 170, 192);
    
    // Total with line
    pdf.setDrawColor(200, 200, 200);
    pdf.line(130, 195, 190, 195);
    
    pdf.setFont('helvetica', 'bold');
    pdf.text('Total', 130, 202);
    pdf.text(formatPrice(booking.totalPrice), 170, 202);
    
    // Payment status
    pdf.setFontSize(12);
    pdf.setDrawColor(100, 100, 100);
    pdf.setFillColor(240, 240, 240);
    pdf.roundedRect(130, 210, 60, 15, 3, 3, 'FD');
    
    pdf.setTextColor(50, 50, 50);
    pdf.text('PAYÉ', 160, 220, { align: 'center' });
    
    // ======== FOOTER ========
    pdf.setTextColor(120, 120, 120);
    pdf.setFontSize(8);
    pdf.text('RimBest Airways - Route de l\'Aéroport, Nouakchott, Mauritanie', 105, 280, { align: 'center' });
    pdf.text('www.rimbest.com • +222 45 25 25 25', 105, 285, { align: 'center' });
    
    // Save the PDF
    pdf.save(fileName);
  } catch (error) {
    console.error('Failed to generate PDF:', error);
  }
};

/**
 * Format ticket filename
 */
export const formatTicketFileName = (
  bookingNumber: string,
  passengerName: string
): string => {
  // Ensure we have a valid booking number
  const safeBookingNumber = bookingNumber || 'unknown';
  const sanitizedName = passengerName.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
  const date = new Date().toISOString().split('T')[0];
  return `recu_${safeBookingNumber}_${sanitizedName}_${date}.pdf`;
}; 
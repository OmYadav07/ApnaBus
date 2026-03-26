export function formatBookingId(id: number, bookingDate?: string | Date): string {
  const date = bookingDate ? new Date(bookingDate) : new Date();
  const year = date.getFullYear();
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `BUS${year}${day}${month}${id}`;
}

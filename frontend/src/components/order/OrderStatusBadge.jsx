const ORDER_STATUS_MAP = {
  order_placed:      { label: 'Order Placed',       color: 'blue' },
  payment_pending:   { label: 'Payment Pending',    color: 'yellow' },
  confirmed:         { label: 'Confirmed',           color: 'blue' },
  preparing:         { label: 'Preparing',           color: 'blue' },
  out_for_delivery:  { label: 'Out for Delivery',   color: 'orange' },
  delivered:         { label: 'Delivered',           color: 'green' },
  rental_active:     { label: 'Rental Active',       color: 'green' },
  return_pending:    { label: 'Return Pending',      color: 'yellow' },
  returned:          { label: 'Returned',            color: 'purple' },
  completed:         { label: 'Completed',           color: 'green' },
  cancelled:         { label: 'Cancelled',           color: 'red' },
};

export default function OrderStatusBadge({ status }) {
  const info = ORDER_STATUS_MAP[status] || { label: status, color: 'gray' };
  return (
    <span className={`badge badge-${info.color}`}>{info.label}</span>
  );
}

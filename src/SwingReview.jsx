export default function SwingReview() {
  return (
    <iframe
      src={import.meta.env.BASE_URL + 'review.html'}
      style={{ width: '100%', height: 'calc(100vh - 56px)', border: 'none', display: 'block' }}
      title="Swing Review"
    />
  );
}

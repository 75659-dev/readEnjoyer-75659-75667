type Review = {
  id: number | string;
  bookTitle: string;
  rating: number;
  text: string;
  date: string;
};

type ReviewListProps = {
  reviews: Review[];
};

export default function ReviewList({ reviews }: ReviewListProps) {
  return (
    <div className="space-y-3">
      {reviews.map((r) => (
        <div key={r.id} className="border rounded-lg p-4 bg-white shadow-sm">
          <div className="flex items-center justify-between">
            <div className="font-semibold">{r.bookTitle}</div>
            <div className="text-xs text-gray-500">{r.date}</div>
          </div>
          <div className="text-sm text-gray-700 mt-2">{r.text}</div>
          <div className="text-xs text-gray-500 mt-2">Rating: {r.rating}/5</div>
        </div>
      ))}
    </div>
  );
}

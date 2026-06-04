import type { ProductDetail } from "@/types/product";

type ProductReviewsSectionProps = {
  reviews: ProductDetail["reviews"];
  averageRating: number;
  reviewCount: number;
};

function Stars({ rating }: { rating: number }) {
  return (
    <span className="inline-flex gap-0.5 text-brand-orange" aria-hidden>
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={i <= Math.round(rating) ? "opacity-100" : "opacity-25"}>
          ★
        </span>
      ))}
    </span>
  );
}

export function ProductReviewsSection({
  reviews,
  averageRating,
  reviewCount,
}: ProductReviewsSectionProps) {
  return (
    <section className="border-t border-neutral-200 py-12 md:py-16">
      <h2 className="font-editorial text-3xl text-foreground md:text-4xl">
        Comentarios
      </h2>

      <div className="mt-6 flex flex-wrap items-center gap-4">
        {reviewCount > 0 ? (
          <>
            <Stars rating={averageRating} />
            <span className="text-sm text-neutral-600">
              {averageRating.toFixed(1)} · {reviewCount}{" "}
              {reviewCount === 1 ? "comentario" : "comentarios"}
            </span>
          </>
        ) : (
          <p className="text-sm text-neutral-500">
            Aún no hay comentarios para este producto.
          </p>
        )}
      </div>

      {reviews.length > 0 && (
        <ul className="mt-10 divide-y divide-neutral-200">
          {reviews.map((review) => (
            <li key={review.id} className="py-6 first:pt-0">
              <div className="flex items-center gap-3">
                <Stars rating={review.rating} />
                <span className="text-sm font-medium text-foreground">
                  {review.userName ?? "Cliente"}
                </span>
                <time
                  className="text-xs text-neutral-400"
                  dateTime={review.createdAt.toISOString()}
                >
                  {new Intl.DateTimeFormat("es-CL", {
                    dateStyle: "medium",
                  }).format(review.createdAt)}
                </time>
              </div>
              {review.title && (
                <p className="mt-2 text-sm font-medium text-foreground">
                  {review.title}
                </p>
              )}
              {review.body && (
                <p className="mt-2 text-sm leading-relaxed text-neutral-700">
                  {review.body}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

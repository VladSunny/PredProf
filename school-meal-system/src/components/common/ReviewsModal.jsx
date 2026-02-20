const ReviewsModal = ({
  isOpen,
  onClose,
  dish,
  reviews,
  reviewData,
  setReviewData,
  onReviewSubmit,
}) => {
  if (!isOpen || !dish) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-2xl animate-scale-in">
        <h3 className="font-bold text-lg mb-4">Отзывы о {dish.name}</h3>

        {/* Add Review */}
        <div className="py-4 border-b border-base-200">
          <h4 className="font-semibold mb-2">Оставить отзыв</h4>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm">Оценка:</span>
            <div className="rating">
              {[1, 2, 3, 4, 5].map((star) => (
                <input
                  key={star}
                  type="radio"
                  name="rating"
                  className="mask mask-star-2 bg-warning"
                  checked={reviewData.rating === star}
                  onChange={() =>
                    setReviewData({ ...reviewData, rating: star })
                  }
                />
              ))}
            </div>
          </div>
          <textarea
            className="textarea textarea-bordered w-full"
            placeholder="Ваш комментарий..."
            value={reviewData.comment}
            onChange={(e) =>
              setReviewData({ ...reviewData, comment: e.target.value })
            }
          />
          <button
            className="btn btn-primary btn-sm mt-2 transition-all duration-200 hover:scale-105"
            onClick={onReviewSubmit}
          >
            Отправить
          </button>
        </div>

        {/* Reviews List */}
        <div className="py-4 space-y-4 max-h-64 overflow-y-auto">
          {reviews.length === 0 ? (
            <p className="text-center text-base-content/60">Пока нет отзывов</p>
          ) : (
            reviews.map((review) => (
              <div key={review.id} className="p-3 bg-base-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="rating rating-sm">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <input
                        key={star}
                        type="radio"
                        className="mask mask-star-2 bg-warning"
                        checked={review.rating === star}
                        disabled
                      />
                    ))}
                  </div>
                </div>
                {review.comment && (
                  <p className="mt-2 text-sm">{review.comment}</p>
                )}
              </div>
            ))
          )}
        </div>

        <div className="modal-action">
          <button
            className="btn transition-all duration-200 hover:scale-105"
            onClick={onClose}
          >
            Закрыть
          </button>
        </div>
      </div>
      <div
        className="modal-backdrop bg-black/50 animate-fade-in"
        onClick={onClose}
      ></div>
    </div>
  );
};

export default ReviewsModal;

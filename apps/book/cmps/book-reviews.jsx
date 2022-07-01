export function BookReviews({ reviews, onDeleteReview }) {
  return <ul className="book-reviews">
    {reviews.map((review, idx) => {
      return <li key={idx}>
        <button onClick={() => onDeleteReview(review.id)}>X</button>
        <h6>By: {review.fullName}</h6>
        <h6>Rate: {review.rate}/5</h6>
        <h6>Read at: {review.readAt}</h6>
        <p>{review.review}</p>
      </li>
    })}
  </ul >
}
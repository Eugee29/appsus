const { Link } = ReactRouterDOM

export function BookPreview({ book }) {
  let {
    title,
    id,
    listPrice: { amount, currencyCode, isOnSale },
    thumbnail,
  } = book

  let symbol
  switch (currencyCode) {
    case 'EUR':
      symbol = '€'
      break
    case 'ILS':
      symbol = '₪'
      break
    case 'USD':
      symbol = '$'
      break
  }

  return (
    <Link to={`book/${id}`}>
      <article className="book-preview">
        {isOnSale && <h1 className="sale">SALE!</h1>}
        <img src={thumbnail} />
        <h1>{title}</h1>
        <h2>
          {amount} {symbol}
        </h2>
      </article>
    </Link>
  )
}

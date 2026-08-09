function ProductCard({ nom, prix, date }) {
  const prixFormate = Number(prix).toLocaleString('fr-FR');

  return (
    <article className="product-card">
      <div className="product-card__accent" aria-hidden="true" />
      <div className="product-card__body">
        <h3 className="product-card__name">{nom}</h3>
        <p className="product-card__label">Prix plancher officiel</p>
        <div className="product-card__price-row">
          <span className="product-card__price">{prixFormate}</span>
          <span className="product-card__unit">FCFA/kg</span>
        </div>
        {date && (
          <time className="product-card__date" dateTime={date}>
            En vigueur depuis {new Date(date).toLocaleDateString('fr-FR')}
          </time>
        )}
      </div>
    </article>
  );
}

export default ProductCard;

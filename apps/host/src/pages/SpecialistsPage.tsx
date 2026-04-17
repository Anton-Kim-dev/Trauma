export const SpecialistsPage = () => (
  <div className="page-shell">
    <section className="page-intro">
      <p className="hero-kicker">Специалисты</p>
      <h1>Команда кабинета травматологии.</h1>
      <p className="hero-text">
        После авторизации пациент может просматривать медицинскую карточку, историю записей и взаимодействовать с
        врачом через одну из подключённых frontend-реализаций.
      </p>
    </section>

    <section className="card-grid">
      <article className="simple-card">
        <span>Травматолог-ортопед</span>
        <strong>Анна Ветрова</strong>
        <p className="muted-text">Первичный приём, наблюдение после травм, рекомендации по лечению.</p>
      </article>
      <article className="simple-card">
        <span>Хирург-консультант</span>
        <strong>Максим Резников</strong>
        <p className="muted-text">Разбор сложных случаев и помощь в выборе дальнейшей тактики лечения.</p>
      </article>
    </section>
  </div>
);

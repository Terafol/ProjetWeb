import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api";

function Home() {
  const [voyages, setVoyages] = useState([]);
  const [country, setCountry] = useState("");
  const [type, setType] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sortBy, setSortBy] = useState("");

  const fetchVoyages = async () => {
    try {
      const params = {};
      if (country) params.country = country;
      if (type) params.type = type;
      if (maxPrice) params.maxPrice = maxPrice;
      if (sortBy) params.sort = sortBy;
      const res = await API.get("/voyages", { params });
      setVoyages(res.data);
    } catch (err) {
      console.error("Erreur chargement voyages :", err);
    }
  };

  useEffect(() => {
    fetchVoyages();
  }, []);

  const handleFilter = (e) => {
    e.preventDefault();
    fetchVoyages();
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Voyages disponibles</h2>

      <form onSubmit={handleFilter} style={{ marginBottom: "2rem" }}>
        <input
          type="text"
          placeholder="Pays"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          style={{ marginRight: "1rem" }}
        />
        <input
          type="text"
          placeholder="Type (plage, montagne...)"
          value={type}
          onChange={(e) => setType(e.target.value)}
          style={{ marginRight: "1rem" }}
        />
        <input
          type="number"
          placeholder="Prix max"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          style={{ marginRight: "1rem" }}
        />
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={{ marginRight: "1rem" }}>
            <option value="">Trier par...</option>
            <option value="price">Prix croissant</option>
        </select>

        <button type="submit">Filtrer</button>
      </form>

      {voyages.length === 0 ? (
        <p>Aucun voyage trouvé.</p>
      ) : (
        voyages.map((voyage) => (
          <div key={voyage.id} style={{ border: "1px solid #ccc", padding: "1rem", marginBottom: "1rem" }}>
            <h3>{voyage.title}</h3>
            <p>{voyage.country} – {voyage.city}</p>
            <p>{voyage.price} €</p>
            <p>{voyage.type}</p>
            <Link to={`/voyage/${voyage.id}`}>Voir détails</Link>
          </div>
        ))
      )}
    </div>
  );
}

export default Home;

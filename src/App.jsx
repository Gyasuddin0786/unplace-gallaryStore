import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useInView } from "react-intersection-observer";
function App() {
  const [images, setImages] = useState([]);
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("nature");
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const { ref, inView } = useInView();

  const fetchImages = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(`https://api.pexels.com/v1/search`, {
        params: {
          query,
          page,
          per_page: 12,
        },
        headers: {
          Authorization:
            "u4iJCbm5Rasci0noi9O1pUSvrUVJFeu9q09L936B4OkJf8SvRcmTXI23", // Please Replace with your Pexels API key
        },
      });
      setImages((prevImages) => [...prevImages, ...response.data.photos]);
    } catch (error) {
      console.error("Error fetching images:", error);
    } finally {
      setLoading(false);
    }
  }, [query, page]);

  useEffect(() => {
    fetchImages();
  }, [page, query, fetchImages]);

  useEffect(() => {
    if (inView) setPage((prevPage) => prevPage + 1);
  }, [inView]);

  const handleSearch = (e) => {
    e.preventDefault();
    setImages([]);
    setPage(1);
    fetchImages();
  };

  const handleImageClick = (image) => {
    setSelectedImage(image);
  };

  const handleModalClose = () => {
    setSelectedImage(null);
  };

  const handleFavorite = (image) => {
    setFavorites((prevFavorites) =>
      prevFavorites.find((fav) => fav.id === image.id)
        ? prevFavorites.filter((fav) => fav.id !== image.id)
        : [...prevFavorites, image]
    );
  };

  const handleDownload = async (url) => {
    try {
      const response = await axios.get(url, { responseType: "blob" });
      const blob = new Blob([response.data]);
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "image.jpg";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error("Error downloading the image:", error);
    }
  };

  return (
    <div style={{ backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
      {/* 🌟 Fixed Top Navbar */}
      <nav
        className="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          padding: "10px 20px",
        }}
      >
        <div
          className="container-fluid d-flex justify-content-between align-items-center"
        >
          <a
            href="#"
            style={{
              color: "#00ff80",
              fontWeight: "bold",
              fontSize: "1.5rem",
              textDecoration: "none",
            }}
          >
            🌿 Apna Pexels Gallery
          </a>
          <form
            onSubmit={handleSearch}
            style={{ display: "flex", alignItems: "center", gap: "10px" }}
          >
            <input
              type="search"
              placeholder="Search images..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{
                width: "250px",
                borderRadius: "10px",
                padding: "8px 15px",
                border: "1px solid #ccc",
                outline: "none",
              }}
            />
            <button
              type="submit"
              style={{
                backgroundColor: "#00ff80",
                color: "#000",
                border: "none",
                borderRadius: "10px",
                padding: "8px 20px",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              Search
            </button>
          </form>
        </div>
      </nav>

      {/* Image Gallery */}
      <div className="container-fluid" style={{ paddingTop: "80px" }}>
        <div className="row">
          {images.map((image, index) => (
            <div className="col-md-4 mb-4" key={index}>
              <div
                className="card border-0 shadow-sm"
                style={{
                  borderRadius: "15px",
                  overflow: "hidden",
                  transition: "transform 0.3s ease, box-shadow 0.3s ease",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "scale(1.03)";
                  e.currentTarget.style.boxShadow =
                    "0 8px 20px rgba(0,0,0,0.2)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                  e.currentTarget.style.boxShadow = "none";
                }}
                onClick={() => handleImageClick(image)}
              >
                <img
                  src={image.src.medium}
                  className="card-img-top"
                  alt={image.alt || "Image"}
                  style={{
                    objectFit: "cover",
                    height: "250px",
                    borderRadius: "15px 15px 0 0",
                  }}
                />
                <div className="card-body text-center">
                  <p
                    className="card-text text-truncate"
                    style={{ fontSize: "14px", color: "#555" }}
                  >
                    {image.alt || "Beautiful Image"}
                  </p>
                  <button
                    className={`btn ${
                      favorites.find((fav) => fav.id === image.id)
                        ? "btn-danger"
                        : "btn-outline-danger"
                    } btn-sm me-2`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleFavorite(image);
                    }}
                  >
                    {favorites.find((fav) => fav.id === image.id)
                      ? "♥"
                      : "♡"}
                  </button>
                  <button
                    className="btn btn-outline-success btn-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownload(image.src.original);
                    }}
                  >
                    ⬇
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Infinite Scroll Trigger */}
      <div ref={ref} className="text-center mb-5">
        {loading && (
          <div className="spinner-border text-success" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        )}
      </div>
{/* Footer */}
      <footer
        style={{
          backgroundColor: "#000",
          color: "#fff",
          textAlign: "center",
          padding: "20px 10px",
          position: "relative",
          bottom: 0,
          width: "100%",
          borderTop: "2px solid #00ff80",
        }}
      >
        <p style={{ margin: "0", fontSize: "14px" }}>
          © {new Date().getFullYear()} Apna Pexels Gallery | Made with 💚 by <a href="https://github.com/Gyasuddin0786" className="text-decoration-none">Gyasuddin Ansari</a></p>
      </footer>
      {/* Modal for Enlarged Image */}
      {selectedImage && (
        <div
          className="modal d-block"
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.8)",
          }}
        >
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div
              className="modal-content"
              style={{
                borderRadius: "15px",
                overflow: "hidden",
                backgroundColor: "#fff",
              }}
            >
              <div className="modal-header">
                <h5 className="modal-title text-dark">
                  {selectedImage.alt || "Image"}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={handleModalClose}
                ></button>
              </div>
              <div className="modal-body text-center">
                <img
                  src={selectedImage.src.large}
                  alt={selectedImage.alt || "Image"}
                  className="img-fluid rounded"
                />
              </div>
              <div className="modal-footer d-flex justify-content-between">
                <button
                  className={`btn ${
                    favorites.find((fav) => fav.id === selectedImage.id)
                      ? "btn-danger"
                      : "btn-outline-danger"
                  }`}
                  onClick={() => handleFavorite(selectedImage)}
                >
                  {favorites.find((fav) => fav.id === selectedImage.id)
                    ? "Unfavorite"
                    : "Favorite"}
                </button>
                <button
                  className="btn btn-outline-success"
                  onClick={() => handleDownload(selectedImage.src.original)}
                >
                  Download
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={handleModalClose}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
